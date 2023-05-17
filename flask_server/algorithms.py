from flask import Flask, request
import json 
import docx2txt
import pdfminer
from pdfminer.high_level import extract_text
import re
import spacy
from spacy.matcher import PhraseMatcher
import skillNer
from skillNer.general_params import SKILL_DB
from skillNer.skill_extractor_class import SkillExtractor
import nltk
import zipfile
import xml.etree.ElementTree as ET
import fuzzywuzzy
from fuzzywuzzy import fuzz
import sklearn
import datetime
import json
import numpy
import string
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import parsing_constants
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from fuzzywuzzy import fuzz
import calendar


#parsing algo#

PHONE_REG = re.compile(parsing_constants.PHONE_REGEX)
EMAIL_REG = re.compile(parsing_constants.EMAIL_REGEX)
LINK_REG = re.compile(parsing_constants.LINKS_REGEX, re.VERBOSE)
month_names = set(str(month) for month in calendar.month_name) | set(str(month) for month in calendar.month_abbr)
month_names.discard('')
month_names.discard(None)
month_names |= set(month[0] for month in month_names)

nlp =  spacy.load('models/entity_ruler_pattern_matcher')

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_text_from_docx(docx_path):
    txt = docx2txt.process(docx_path)
    if txt:
        return txt.replace('\t', ' ')
    return None
 
def extract_links(resume_text:str):
    return LINK_REG.findall(resume_text)

def extract_names_modified(nlp, input_string:str):
    doc = nlp(input_string[:20])
    doc_entities = doc.ents
    doc_persons = filter(lambda x: x.label_ == 'PERSON', doc_entities)
    doc_persons = filter(lambda x: len(x.text.strip().split()) >= 2, doc_persons)
    doc_persons = map(lambda x: x.text.strip(), doc_persons)
    doc_persons = list(doc_persons)
    if len(doc_persons) > 0:
        words = doc_persons[0].split("\n")
        return words[0]
    return ''

def extract_names_transformer(resume_text:str):

    bert_tokenizer = AutoTokenizer.from_pretrained('dslim/bert-large-NER')
    bert_model = AutoModelForTokenClassification.from_pretrained('dslim/bert-large-NER')

    nlp_name = pipeline('ner', model=bert_model, tokenizer=bert_tokenizer)
    names_string = resume_text[:20]
    ner_list = nlp_name(names_string)

    this_name = []
    all_names_list_tmp = []

    for ner_dict in ner_list:
        if ner_dict['entity'] == 'B-PER':
            if len(this_name) == 0:
                this_name.append(ner_dict['word'])
            else:
                all_names_list_tmp.append([this_name])
                this_name = []
                this_name.append(ner_dict['word'])
        elif ner_dict['entity'] == 'I-PER':
            this_name.append(ner_dict['word'])

    all_names_list_tmp.append([this_name])

    final_name_list = []
    for name_list in all_names_list_tmp:
        full_name = ' '.join(name_list[0]).replace(' ##', '').replace(' .', '.')
        final_name_list.append(full_name)
    
    if len(final_name_list) > 0:
        return final_name_list[0]
    
    return ''

 
def extract_phone_number(resume_text):
    phone = re.findall(PHONE_REG, resume_text)
 
    if phone:
        number = ''.join(phone[0])
 
        if (resume_text.find(number) >= 0 and len(number) < 16):
            return number
    return None


def extract_emails(resume_text):
    return re.findall(EMAIL_REG, resume_text)

def get_skills(nlp, text:str):
    doc = nlp(text)
    myset = []
    subset = []
    for ent in doc.ents:
        if ent.label_=="SKILL":
             subset.append(ent.text)
    myset.append(subset)
    unique_skills = list(dict.fromkeys(subset))
    return unique_skills

def extract_dates(resume_text):
    dates = []
    start_regexes = parsing_constants.WORK_EXPERIENCE_HEADINGS
    end_regex = parsing_constants.EVERY_OTHER_HEADING_REGEX
    result = None

    for start_regex in start_regexes:
        match = re.search(f'{start_regex}(.*?){end_regex}', resume_text, re.DOTALL | re.IGNORECASE)
        if match:
            result = match.group(1)
            break
    
    date_regex = parsing_constants.DATE_REGEX
    date_formats = parsing_constants.DATE_FORMATS_BY_REGEX
    matches = re.finditer(date_regex, result)

    for match in matches:
        for _, possible_formats in date_formats.items():
            for possible_format in possible_formats:
                try:
                    dt = datetime.datetime.strptime(match.group(), possible_format)
                    dates.append(dt)
                except ValueError:
                    pass
    return dates

def calculate_experience(dates):
    if len(dates) == 1:
        return (datetime.datetime.now() - dates[0]).days / 365.25
    if len(dates) < 1:
        return 0
    dates = sorted(dates)
    start_date = dates[0]
    end_date = dates[-1]
    years_of_exp = (end_date - start_date).days / 365.25
    return round(years_of_exp, 1)

def extract_dates_and_text(resume_text):
    dates_and_text = []
    start_regexes = parsing_constants.WORK_EXPERIENCE_HEADINGS
    end_regex = parsing_constants.EVERY_OTHER_HEADING_REGEX
    result = None

    for start_regex in start_regexes:
        match = re.search(f'{start_regex}(.*?){end_regex}', resume_text, re.DOTALL | re.IGNORECASE)
        if match:
            result = match.group(1)
            break
    
    date_regex = parsing_constants.DATE_REGEX
    date_formats = parsing_constants.DATE_FORMATS_BY_REGEX
    matches = re.finditer(date_regex, result)

    for match in matches:
        date_str = match.group()
        for _, possible_formats in date_formats.items():
            for possible_format in possible_formats:
                try:
                    dt = datetime.datetime.strptime(date_str, possible_format)
                    date_text = re.search(rf".*{date_str}.*", result, re.MULTILINE)
                    if date_text is not None:
                        date_text = date_text.group()
                    words = [word.strip() for word in date_text.split() if word[0].isupper()  and word.isalnum() and word not in month_names]
                    job_title = ' '.join(words)
                    dates_and_text.append((dt, job_title))
                except ValueError:
                    pass
    return dates_and_text

def calculate_experience_for_each_job(dates_and_text):
    total_experience = 0
    previous_title = None
    previous_date = None
    experience_dict = {}

    # Sort the input list by start date
    dates_and_text.sort(key=lambda x: x[0])

    for date, title in dates_and_text:
        if title != previous_title:
            previous_title = title
            previous_date = date
        else:
            experience = (date - previous_date).days / 365
            if title != '' and experience!=0:
                print(f"Experience as {title}: {experience:.2f} years")
                experience_dict[title] = experience
            total_experience += experience
            previous_date = date

    total_experience = round(total_experience, 2)
    return experience_dict, total_experience


def down_cast(obj):
    if isinstance(obj, numpy.int64): 
        return int(obj)


#matching algo#

#match university, returns 1 if uni name in cv and returns 0 if uni name not in cv
def uni_matching(text, jd_data):
    if 'universities' not in jd_data:
        return 0
    unis = jd_data["universities"]
    for key, value in unis.items():
        if key in text or value in text:
            return 1
    return 0

def qualifications_matching(text, jd_data):
    if 'qualification' not in jd_data:
        return 0
    qualis = jd_data["qualification"]

    for key, value in qualis.items():
        if key in text or value in text:
            return 1
    return 0


#matching years of experience
def exp_matching(cv_data, jd_data):
    if 'experience' not in jd_data:
        return 0
    
    if jd_data['experience'] == 'None':
        return 0

    exp_JD = float(jd_data["experience"].split()[0])
   
    if 'total_experience' not in cv_data:
        return 0

    exp_CV = float(cv_data["total_experience"])
    # Calculate the percentage of matching experience
    match_percentage = (exp_CV / exp_JD) 

    # Cap the match percentage at 100% to avoid exceeding 100%
    match_percentage = min(match_percentage, 1)

    return match_percentage

#matching skills based on keywords and producing a percentage match
def skills_matching(cv_data, jd_data):
    if 'skills' not in jd_data:
        return 0
    skills_CV = cv_data['skills']
    
    if len(jd_data['skills']) == 0:
        return 0
    skills_JD = [skill["skill_name"] for skill in jd_data["skills"]]
    # Count the number of matching elements
    matching_count = 0
    for elem in skills_JD:
        if elem in skills_CV:
            matching_count += 1
    
    # Calculate the percentage of matching elements
    matching_percentage = (matching_count / len(skills_JD))

    # Cap the match percentage at 100% to avoid exceeding 100%
    matching_percentage = min(matching_percentage, 1)
    
    return matching_percentage

#using cosine method
#The cosine similarity ranges from 0 (completely dissimilar) to 1 (completely similar), with 1 indicating perfect similarity.
def cosine_sim_match(cv_data, jd_data):
    skills_CV = cv_data['skills']
    if skills_CV is None:
        return 0
    if len(jd_data['skills']) == 0:
        return 0
    skills_JD = [skill["skill_name"] for skill in jd_data["skills"]]
   # Convert the input arrays to strings for vectorization
    text1 = ' '.join(map(str, skills_JD))
    text2 = ' '.join(map(str, skills_CV))

    # Create TfidfVectorizer object
    vectorizer = TfidfVectorizer()

    # Fit and transform the input arrays
    tfidf_matrix = vectorizer.fit_transform([text1, text2])

    # Calculate the cosine similarity
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    return cosine_sim

#using jaccard similarity. 0 to 1 ka scale
def jaccard_similarity(cv_data, jd_data):
    skills_CV = cv_data['skills']
    if skills_CV is None:
        return 0
    if len(jd_data['skills']) == 0:
        return 0
    skills_JD = [skill["skill_name"] for skill in jd_data["skills"]]
    set1 = set(skills_JD)
    set2 = set(skills_CV)
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    similarity = intersection / union if union != 0 else 0
    return similarity

#0 to 100 scale
def fuzzy_matching(cv_data, jd_data):
    skills_CV = cv_data['skills']
    if skills_CV is None:
        return 0
    if len(jd_data['skills']) == 0:
        return 0
    skills_JD = [skill["skill_name"] for skill in jd_data["skills"]]
    similarity_scores = []
    for item1 in skills_JD:
        for item2 in skills_CV:
            similarity = fuzz.token_set_ratio(item1, item2)
            similarity_scores.append(similarity)
    avg_similarity = (sum(similarity_scores) / len(similarity_scores)) / 100
    return avg_similarity

def bigboy(cv_text, cv, jd):
    skills:float = skills_matching(cv, jd)
    exp:float = exp_matching(cv, jd)
    uni: float = uni_matching(cv_text, jd)
    qualf:float = qualifications_matching(cv_text,jd)

    match_score = (skills + exp + uni + qualf) / 4

    return match_score

# Setup flask server
app = Flask(__name__) 
  
@app.route('/parse_cv', methods = ['POST']) 
def parse_cv(): 
    data = request.get_json() 
    result = []
    for file in data:
        text:str = extract_text_from_pdf('../server/uploaded_CVs/' + file)
        print(text)
        dates:list = extract_dates(text)
        #years_of_exp = calculate_experience(dates)
        experience_by_job, total_experience = calculate_experience_for_each_job(extract_dates_and_text(text))
        name_modified = extract_names_modified(nlp, text)
        if (name_modified == ''):
            name_modified = extract_names_transformer(string.capwords(text))
        phone_number = extract_phone_number(text)
        emails = extract_emails(text)
        skills = get_skills(nlp,text)
        if(len(skills)==0):
            skill_extractor = SkillExtractor(nlp, SKILL_DB, PhraseMatcher)
            skills = skill_extractor.annotate(text)
        #skills = list(set([for skill in skills skill.lower()]))
        links = extract_links(text)
    

        if name_modified == '':
            name_modified = "NA"

        if phone_number is None:
            phone_number = "NA"

        if emails is None:
            emails = []

        if skills is None:
            skills = []

        if total_experience is None:
            total_experience = 0

        if links is None:
            links = []

        result.append({"full_name": name_modified, "phone_number": phone_number, "emails": emails, "skills": skills, "total_experience": total_experience,"experience_by_job": experience_by_job, "links": links })
    # Return data in json format 

    return json.dumps(result)
   
@app.route('/match_cv', methods = ['POST']) 
def match_cv(): 
    data = request.get_json() 
    jd_data =  data['jd']
    cv_data_array = data['cvs']

    final_scores = []
    for cv_data in cv_data_array:
        scores = {}
        resume_text:str = extract_text_from_pdf('../server/' + cv_data['cv_path'])
        skills_match_score = 0

        if 'skills' in jd_data:
            for skill in jd_data["skills"]:
                for surface_form in skill["low_surface_forms"]:
                    for cv_skill in cv_data["skills"]:
                        match_score = fuzz.token_set_ratio(surface_form, cv_skill)
                        if match_score > skills_match_score:
                            skills_match_score = match_score
                if(skills_match_score>100):
                    scores["skills"] = 100
                scores["skills"] = skills_match_score
        else:
            scores["skills"] = 100
        
        if 'universities' in jd_data:
            jd_universities = jd_data["universities"]
            matched_universities = set()
            for uni_key, uni_value in jd_universities.items():
                pattern = r"\b" + re.escape(uni_value) + r"\b"
                if re.search(pattern, resume_text, re.IGNORECASE):
                    matched_universities.add(uni_key)
                pattern = r"\b" + re.escape(uni_key) + r"\b"
                if re.search(pattern, resume_text, re.IGNORECASE):
                    matched_universities.add(uni_key)
            if matched_universities:
                scores["universities_match_score"] = 100
            else:
                scores["universities_match_score"] = 0
        else:
            scores["universities_match_score"] = 100

        experience_match_score = 50
        jd_experience = 0

        if 'experience' in jd_data:
            if jd_data["experience"].startswith("10+"):
                jd_experience = 10
            else:
                try:
                    jd_experience = int(jd_data["experience"].split()[0])
                except ValueError:
                    jd_experience = 0
        else:
            jd_experience = 0

        if(jd_experience>0):
            if(cv_data['total_experience']/jd_experience>0.75):
                experience_match_score = 100
            
            if(cv_data['total_experience']/jd_experience<0.30):
                experience_match_score = 30
        
            scores['experience_match_score'] = experience_match_score
        else:
            scores['experience_match_score'] = 100

        if 'qualification' in jd_data:
            jd_qualifications = jd_data["qualification"]
            matched_quals = set()
            for qual_key, qual_value in jd_qualifications.items():
                for line in resume_text.split('\n'):
                    ratio = fuzz.token_set_ratio(line, qual_value)
                    if ratio >= 80:
                        matched_quals.add(qual_key)
                        break
                for word in line.split():
                    ratio = fuzz.token_set_ratio(word, qual_key)
                    if ratio >= 80:
                        matched_quals.add(qual_key)
                        break
                        
            if matched_quals:
                scores['qualification_match_score'] = 100
            else:
                scores['qualification_match_score'] = 0
                scores['qualification_match_score'] = scores['qualification_match_score'] * 0.5
        else:
            scores['qualification_match_score'] = 100
        
        total_score = 0
        for key, value in scores.items():
            total_score += value
        total_score = total_score / (len(scores) * 100) * 100

        scores["total_score"] = round(total_score)
        final_scores.append(round(total_score))

    print(final_scores)
    # Return data in json format 
    return json.dumps(final_scores)

if __name__ == "__main__": 
    app.run(port=5000, debug=True)