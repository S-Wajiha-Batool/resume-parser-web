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

PHONE_REG = re.compile(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]')
EMAIL_REG = re.compile(r'[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+')
NAME_REGEX = r'[a-z]+(\s+[a-z]+)?'
nlp =  spacy.load('models/entity_ruler_pattern_matcher')
skill_extractor = SkillExtractor(nlp, SKILL_DB, PhraseMatcher)
 
def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_text_from_docx(docx_path):
    txt = docx2txt.process(docx_path)
    if txt:
        return txt.replace('\t', ' ')
    return None

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
        '%B-%Y': ['%B-%Y', '%b-%Y']
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

text:str = extract_text_from_pdf('resumes/resume.pdf').lower()
dates:list = extract_dates(text)
years_of_exp = calculate_experience(dates)
name_modified = extract_names_modified(nlp, text)
phone_number = extract_phone_number(text)
emails = extract_emails(text)
skills = skill_extractor.annotate(text)
skills_matched = get_skills(nlp,text)

if name_modified:
    print(string.capwords(name_modified))

if phone_number:
    print(phone_number)

if emails:
    print(emails[0])

if skills_matched:
    print(skills_matched)

if years_of_exp:
    print(years_of_exp)

with open("predicted/skills.json", "w") as write_file:
    json.dump(skills, write_file, indent=4,default=down_cast)
