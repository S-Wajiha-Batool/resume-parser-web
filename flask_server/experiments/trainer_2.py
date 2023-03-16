import json
from sklearn.model_selection import train_test_split
from spacy.training import Example
from spacy.scorer import Scorer
from spacy.util import filter_spans
from tqdm import tqdm
from spacy.scorer import Scorer
import spacy
from spacy.util import minibatch, compounding

spacy.prefer_gpu()

nlp = spacy.blank("en")  # create a blank English language model

with open("resume_annotated_data.json") as f:
    data = json.load(f)

docs = []
for item in data:
    text = item["content"]
    entities = item["annotation"]
    doc = nlp(text)
    spans = []
    for ent in entities:
        label = ent["label"][0]
        start = ent["points"][0]["start"]
        end = ent["points"][0]["end"]
        span = doc.char_span(start, end, label=label)
        if span is not None:
            spans.append(span)
            print(span)
    filtered = filter_spans(spans) # THIS DOES THE TRICK
    doc.ents = filtered
    docs.append(doc)


#train_data, test_data = train_test_split(docs, test_size=0.05)


nlp = spacy.load("en_core_web_sm")
ner = nlp.get_pipe("ner")

ner.add_label("Skills")
ner.add_label("College Name")
ner.add_label("Graduation Year")
ner.add_label("Designation")
ner.add_label("Companies worked at")
ner.add_label("Email Address")
ner.add_label("Location")
ner.add_label("Name")
import random

# set the batch size and number of iterations
batch_size = 16
n_iter = 27
optimizer = nlp.create_optimizer()

n_iter = 100
dropout = 0.3
batch_size = 32
batch_compound = 1.75
batch_start = 32
batch_end = 128

# batch the training data and update the model weights
for i in range(n_iter):
    ner_loss = 0
    random.shuffle(docs)
    batches = minibatch(docs, size=compounding(batch_start, batch_end, batch_compound))
    losses = {}
    for batch in batches:
        examples = []
        for doc in batch:
            ents = [(e.start_char, e.end_char, e.label_) for e in doc.ents]
            examples.append(Example.from_dict(doc, {"entities": ents}))
        nlp.update(examples, sgd=optimizer, drop=dropout, losses=losses)
        if(losses['ner'] < ner_loss or ner_loss == 0):
            print("Saving model with loss:", losses['ner'])
            nlp.to_disk("skill_model_2")
            ner_loss = losses['ner']
    print("Iteration:", i+1, "Loss:", losses, "batch_size:", len(batch))

