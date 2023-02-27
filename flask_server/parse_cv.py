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
import sys
import os
from promise import promise

PHONE_REG = re.compile(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]')
EMAIL_REG = re.compile(r'[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+')
NAME_REGEX = r'[a-z]+(\s+[a-z]+)?'
nlp = spacy.load("en_core_web_lg")

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
def extract_names_modified(input_string,nlp):
    
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

def is_heading2_section(p):
    return_val = False
    heading_style_elem = p.find(".//w:pStyle[@w:val='Heading2']", ns)
    if heading_style_elem is not None:
        return_val = True
    return return_val
 
 
def get_section_text(p):
    return_val = ''
    text_elems = p.findall('.//w:t', ns)
    font_elems = p.findall('.//w:rFonts[@w:ascii="Times New Roman"]', ns)
    font_size_elems = p.findall(f'.//w:sz[@w:val="{10}"]', ns)
    if text_elems is not None:
        return_val = ''.join([t.text for t in text_elems])
    return return_val
 
def get_text_from_font_size(p):
    return_val = ''
    text_elems = p.findall('.//w:t', ns)
    font_size_elems = p.findall(f'.//w:sz[@w:val="{10}"]', ns)
    if text_elems is not None:
        return_val_text = ''.join([t.text for t in text_elems])
    if font_size_elems is not None:
        return_val_size = ''.join([t.text for t in font_size_elems])
    return return_val_text, return_val_size

def get_text_if_heading_size(p, size):
    return_val = ''
    text_elems = p.findall('.//w:t', ns)
    font_size_elems = p.findall(f'.//w:sz[@w:val="{size}"]', ns)
    if text_elems is not None:
        return_val_text = ''.join([t.text for t in text_elems])
    if font_size_elems is not None:
        return_val_size = ''.join([t.text for t in font_size_elems])
    return return_val_text, return_val_size

def fuzzy_match_list_of_text_from_string(string, list_of_text):
    return_val = ''
    for text in list_of_text:
        if fuzz.ratio(string, text) > 90:
            return_val = text
            break
    return return_val

def cosine_similarity_between_values_of_two_dicts(dict1, dict2):
    return_val = 0
    dict1_values = list(dict1.values())
    dict2_values = list(dict2.values())
    return_val = cosine_similarity([dict1_values], [dict2_values])
    return return_val

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
        text = extract_text_from_pdf('../server/uploaded_CVs/' + file)
        #names = extract_names(text)

        #name_modified = extract_names_modified(text,nlp)
        #phone_number =  extract_phone_number(text)
        name_modified = "AA"
        phone_number = "2332233"
        emails = extract_emails(text)
        #skills = skill_extractor.annotate(text)
        #print(skills)
        
        ### to be done

        skills= [] 
        experience = '2 years'
        qualification = 'Bs-CS'
        links = []
        universities = []

        result.append({"full_name": name_modified, "phone_number": phone_number, "emails": emails, "skills": skills, "experience": experience, "qualification": qualification, "links": links, "universities": universities })
    # Return data in json format 
    print(result)
    return json.dumps(result)
   
@app.route('/match_cv', methods = ['POST']) 
def match_cv(): 
    data = request.get_json() 
    print(data)
    result = [9,8]
    #for cv in data:

    # Return data in json format 
    #print(result)
    return json.dumps(result)

if __name__ == "__main__": 
    app.run(port=5000, debug=True)