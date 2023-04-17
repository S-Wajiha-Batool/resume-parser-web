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
import json
import numpy
import nltk
import zipfile
import xml.etree.ElementTree as ET
import fuzzywuzzy
from fuzzywuzzy import fuzz
import sklearn
from sklearn.metrics.pairwise import cosine_similarity
import datetime
import json
import numpy
import string

PHONE_REG = re.compile(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]')
EMAIL_REG = re.compile(r'[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+')
NAME_REGEX = r'[a-z]+(\s+[a-z]+)?'
nlp = spacy.load("models/entity_ruler_pattern_matcher")
skill_extractor = SkillExtractor(nlp, SKILL_DB, PhraseMatcher)

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_text_from_docx(docx_path):
    txt = docx2txt.process(docx_path)
    if txt:
        return txt.replace('\t', ' ')
    return None
 
#####Method 1
def extract_names(txt):
    person_names = []
    for sent in nltk.sent_tokenize(txt):
        for chunk in nltk.ne_chunk(nltk.pos_tag(nltk.word_tokenize(sent))):
            if hasattr(chunk, 'label') and chunk.label() == 'PERSON':
                person_names.append(
                    ' '.join(chunk_leave[0] for chunk_leave in chunk.leaves())
                )
    if len(person_names)>1:
        return person_names
    return None


#####################
def extract_names_modified(nlp, input_string:str):
    
    doc = nlp(input_string)
    doc_entities = doc.ents

    doc_persons = filter(lambda x: x.label_ == 'PERSON', doc_entities)
    doc_persons = filter(lambda x: len(x.text.strip().split()) >= 2, doc_persons)
    doc_persons = map(lambda x: x.text.strip(), doc_persons)
    doc_persons = list(doc_persons)

    if len(doc_persons) > 0:
        return doc_persons[0]
    return None
 
 
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
    start_regexes = [
    r"professional experience",
    r"work experience",
    r"experience"
    ]

    end_regex = r"(education|qualification|hobbies|interests|references|projects|certifications|skills|awards|achievements|publications|publications and presentations|presentations|extracurricular activities|extracurricular|languages|technical skills|technical|personal skills|personal|summary|objective|career objective|career summary|career|summary of qualifications|summary of qualifications|summary of quali)"

    # Initialize the result variable to None
    result = None

    # Loop through the start regex patterns and look for matches
    for start_regex in start_regexes:
        match = re.search(f'{start_regex}(.*?){end_regex}', resume_text, re.DOTALL | re.IGNORECASE)
        if match:
            result = match.group(1)
            break
    
    date_regex = r'\b(?:\d{1,2}[\/.-])?(?:(?:0?[1-9]|1[0-2])[\/.-](?:0?[1-9]|[12]\d|3[01])|(?:0?[1-9]|[12]\d|3[01])[\/.-](?:0?[1-9]|1[0-2]))[\/.-]?\d{2,4}\b|\b(?:0?[1-9]|1[0-2])[\/.-]\d{4}\b|\b\d{4}[\/.-](?:0?[1-9]|1[0-2])[\/.-](?:0?[1-9]|[12]\d|3[01])\b|\b(?:0?[1-9]|[12]\d|3[01])[\/.-](?:0?[1-9]|1[0-2])[\/.-]\d{4}\b|\b(?:0?[1-9]|[12]\d|3[01])[\/.-](?:0?[1-9]|1[0-2])[\/.-]\d{2}(?!\d)\b|\b\d{1,2}[\/.-][A-Za-z]{3,9}[\/.-]\d{4}\b|\b[A-Za-z]{3,9}[\/.-]\d{1,2}[\/.-]\d{4}\b'

    date_formats = {
        '%d/%m/%Y': ['%d-%m-%Y', '%d.%m.%Y', '%d/%m/%y'],
        '%Y-%m-%d': ['%Y-%m-%d'],
        '%d-%B-%Y': ['%d-%B-%Y', '%d-%b-%Y'],
        '%B-%d-%Y': ['%B-%d-%Y', '%b-%d-%Y'],
        '%m/%Y': ['%m/%Y'],
        '%Y-%m': ['%Y-%m'],
        '%m/%y': ['%m/%y'],
        '%B-%Y': ['%B-%Y', '%b-%Y'],
        '%B-%Y': ['%B-%Y', '%b-%Y'],
        '%B-%Y': ['%B %Y', '%b %Y']

    }

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

def down_cast(obj):
    if isinstance(obj, numpy.int64): 
        return int(obj)

# Setup flask server
app = Flask(__name__) 
  
@app.route('/parse_cv', methods = ['POST']) 
def parse_cv(): 
    data = request.get_json() 
    print(data)
    result = []
    for file in data:
        text:str = extract_text_from_pdf('../server/uploaded_CVs/' + file).lower()
        dates:list = extract_dates(text)
        years_of_exp = calculate_experience(dates)
        name_modified = extract_names_modified(nlp, text)
        phone_number = extract_phone_number(text)
        emails = extract_emails(text)
        skills = skill_extractor.annotate(text)
        skills_matched = get_skills(nlp,text)
        
        ### to be done
        links = []

        if name_modified is None:
            name_modified = "NA"

        if phone_number is None:
            phone_number = "NA"

        if emails is None:
            emails = []

        if skills_matched is None:
            skills_matched = []

        if years_of_exp is None:
            years_of_exp = 0

        if links is None:
            links = []

        result.append({"full_name": name_modified, "phone_number": phone_number, "emails": emails, "skills": skills_matched, "experience": years_of_exp, "links": links })
    # Return data in json format 
    print(result)
    return json.dumps(result)
   
@app.route('/match_cv', methods = ['POST']) 
def match_cv(): 
    data = request.get_json() 
    print(data)
    result = [6,7]
    #for cv in data:

    # Return data in json format 
    #print(result)
    return json.dumps(result)

if __name__ == "__main__": 
    app.run(port=5000, debug=True)