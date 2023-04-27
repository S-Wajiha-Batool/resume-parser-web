import docx2txt
from pdfminer.high_level import extract_text
import re
import spacy
from spacy.matcher import PhraseMatcher
from skillNer.general_params import SKILL_DB
from skillNer.skill_extractor_class import SkillExtractor
import datetime
import json
import numpy
import string
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import parsing_constants

PHONE_REG = re.compile(parsing_constants.PHONE_REGEX)
EMAIL_REG = re.compile(parsing_constants.EMAIL_REGEX)
LINK_REG = re.compile(parsing_constants.LINKS_REGEX, re.VERBOSE)

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
    doc = nlp(input_string)
    doc_entities = doc.ents
    doc_persons = filter(lambda x: x.label_ == 'PERSON', doc_entities)
    doc_persons = filter(lambda x: len(x.text.strip().split()) >= 2, doc_persons)
    doc_persons = map(lambda x: x.text.strip(), doc_persons)
    doc_persons = list(doc_persons)
    if len(doc_persons) > 0:
        return doc_persons[0]
    return ''

def extract_names_transformer(resume_text:str):

    bert_tokenizer = AutoTokenizer.from_pretrained('dslim/bert-large-NER')
    bert_model = AutoModelForTokenClassification.from_pretrained('dslim/bert-large-NER')

    nlp_name = pipeline('ner', model=bert_model, tokenizer=bert_tokenizer)
    names_string = resume_text
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

 
def extract_phone_number(resume_text:str):
    phone = re.findall(PHONE_REG, resume_text)
 
    if phone:
        number = ''.join(phone[0])
 
        if (resume_text.find(number) >= 0 and len(number) < 16):
            return number
    return None

def extract_emails(resume_text:str):
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
                    words = [word.strip() for word in date_text.split() if word[0].isupper()]
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
            if title != '':
                print(f"Experience as {title}: {experience:.2f} years")
                experience_dict[title] = experience
            total_experience += experience
            previous_date = date

    total_experience = round(total_experience, 2)
    return experience_dict, total_experience


# def extract_job_dates_and_titles(resume_text):
#     job_dates_and_titles = []

#     start_regexes = parsing_constants.WORK_EXPERIENCE_HEADINGS
#     end_regex = parsing_constants.EVERY_OTHER_HEADING_REGEX

#     # Extract dates and job titles for each job
#     for start_regex in start_regexes:
#         match = re.search(f'{start_regex}(.*?){end_regex}', resume_text, re.DOTALL | re.IGNORECASE)
#         print(match)
#         if match:
#             job_text = match.group(1)
#             date_regex = parsing_constants.DATE_REGEX
#             date_formats = parsing_constants.DATE_FORMATS_BY_REGEX
#             matches = re.finditer(date_regex, job_text)
#             job_dates_and_titles.append([])
#             for match in matches:
#                 for _, possible_formats in date_formats.items():
#                     for possible_format in possible_formats:
#                         try:
#                             dt = datetime.datetime.strptime(match.group(), possible_format)
#                             job_dates_and_titles[-1].append(dt)
#                             break
#                         except ValueError:
#                             pass
#             # Extract job titles
#             title_regex = r'(?<=\n)[A-Z][^\n]*?(?=\n\d)'
#             title_match = re.search(title_regex, job_text)
#             if title_match:
#                 job_title = title_match.group().strip()
#                 job_dates_and_titles[-1].append(job_title)

#     return job_dates_and_titles

# def calculate_job_experience(text:str):
#     job_dates_and_titles = extract_job_dates_and_titles(text)
#     experience_list = []

#     for dates_and_title in job_dates_and_titles:
#         dates = dates_and_title[:-1]
#         title = dates_and_title[-1]
#         years_of_exp = calculate_experience(dates)
#         experience_dict = {'title': title, 'years_of_experience': years_of_exp}
#         experience_list.append(experience_dict)

#     return experience_list

# def new_fun(text):
#     import re
#     from datetime import datetime

#     job_title_regex = r'\b[A-Z][\w\s]*(?=,\s\d{4}\s-\s|\b(present)\b)'

#     # Initialize list to store job titles and years of experience
#     job_titles = []
#     years_of_experience = []

#     date_regex = parsing_constants.DATE_REGEX


#     # Iterate over each job entry in work experience
#     for job_entry in text.split('\n'):
#         # Match job title and date using regular expressions
#         start_date_str = re.search(date_regex, job_entry).group('start_date')
#         end_date_str = re.search(date_regex, job_entry).group('end_date')
#         job_title = re.search(job_title_regex, job_entry).group()
        
#         # Convert start and end dates to datetime objects
#         start_date = datetime.strptime(start_date_str, '%b %Y')
#         if end_date_str == 'present':
#             end_date = datetime.now()
#         else:
#             end_date = datetime.strptime(end_date_str, '%b %Y')
        
#         # Calculate years of experience and add to list
#         years_of_experience.append(round((end_date - start_date).days / 365))
#         job_titles.append(job_title)

#     # Print results
#     for i, job_title in enumerate(job_titles):
#         print(f"Job {i+1}: {job_title}, Years of experience: {years_of_experience[i]}")



def down_cast(obj):
    if isinstance(obj, numpy.int64): 
        return int(obj)

text:str = extract_text_from_pdf('resumes/resume.pdf')
calculate_experience_for_each_job(extract_dates_and_text(text))
dates:list = extract_dates(text)
years_of_exp = calculate_experience(dates)
name_modified = extract_names_modified(nlp, text)
if (name_modified ==''):
    name_modified = extract_names_transformer(string.capwords(text))
phone_number = extract_phone_number(text)
emails = extract_emails(text)
skills = get_skills(nlp,text)
if(len(skills)==0):
    skill_extractor = SkillExtractor(nlp, SKILL_DB, PhraseMatcher)
    skills = skill_extractor.annotate(text)
links = extract_links(text)

if name_modified:
    print(string.capwords(name_modified))

if phone_number:
    print(phone_number)

if emails:
    print(emails[0])


if years_of_exp:
    print(years_of_exp)

if(links):
    print(links)

with open("predicted/skills.json", "w") as write_file:
    json.dump(skills, write_file, indent=4,default=down_cast)
