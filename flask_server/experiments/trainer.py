import spacy
from spacy.util import minibatch, compounding
import pandas as pd
import random
from tqdm import tqdm
from spacy.training import Example

skill_df = pd.read_excel('skills_db.xlsx')

SKILL_TRAIN_DATA = []
    
#("Software Engineer", {"entities": [(0, 16, "JOB_TITLE")]}),

for skill in tqdm(skill_df['Skills'].values):
    SKILL_TRAIN_DATA.append((str(skill), {"entities": [(0, len(str(skill)), "SKILL")]}))

nlp = spacy.load("en_core_web_sm")
ner = nlp.get_pipe("ner")
ner.add_label("SKILL")

n_iter = 10
dropout = 0.35
batch_size = 12
batch_compound = 4.0
batch_start = 32
batch_end = 128

# Train the model
with nlp.select_pipes(enable=["ner"]):
    optimizer = nlp.create_optimizer()
    for i in tqdm(range(n_iter)):
        # Shuffle the training data
        random.shuffle(SKILL_TRAIN_DATA)
        # Create minibatches using compounding
        batches = minibatch(SKILL_TRAIN_DATA, size=compounding(batch_start, batch_end, batch_compound))
        # Iterate through the minibatches
        examples = []
        for batch in batches:
            texts, annotations = zip(*batch)
            for text, annotation in zip(texts, annotations):
                example = Example.from_dict(nlp.make_doc(text), annotation)
                examples.append(example)
            # Update the model with the current minibatch
            nlp.update(examples, sgd=optimizer, drop=dropout)

# for i in tqdm(range(10)):
#     random.shuffle(SKILL_TRAIN_DATA)
#     for text, annotations in SKILL_TRAIN_DATA:
#         doc = nlp.make_doc(text)
#         example = spacy.training.Example.from_dict(doc, annotations)
#         nlp.update([example], sgd=optimizer)

nlp.to_disk("skill_model")
