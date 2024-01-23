import pandas as pd
import json
from datetime import datetime
from pylatexenc.latex2text import LatexNodes2Text
import random

def get_clean_authors(authors):
    r = []
    for a in authors:
        r.append(" ".join(a).strip())
    return r

print("start1")
articles = []

file_path = 'arxiv-metadata-oai-snapshot.json'
samples_size = 30000

with open(file_path, 'r') as f:
    lines = f.readlines()

total_lines = len(lines)

selected_lines = set()

while len(selected_lines) < samples_size:
    random_index = random.randint(0, total_lines - 1)

    if random_index not in selected_lines:
        selected_lines.add(random_index)
        d = json.loads(lines[random_index])
        d['clean_authors'] = get_clean_authors(d['authors_parsed'])
        articles.append(d)

'''
with open("arxiv-metadata-oai-snapshot.json", "r") as f:
    for i, line in enumerate(f):
        if i >= 30000:
            break
        d = json.loads(line)
        d['clean_authors'] = get_clean_authors(d['authors_parsed']) 
        articles.append(d)
'''
        
articles_df = pd.DataFrame().from_records(articles)
articles_df['created_date'] = [datetime.strptime(date[0]['created'].split(',')[1],' %d %b %Y %H:%M:%S %Z') 
                               for date in articles_df['versions']]
#articles_df.head()

print("start2")

LatexNodes2Text().latex_to_text(articles_df['abstract'][2]).replace('\n', ' ').strip()

clean_abstract = []
clean_title = []
for i,a in articles_df.iterrows():
    # Clean title
    try:
        clean_title.append(LatexNodes2Text().latex_to_text(a['title']).replace('\n', ' ').strip()) 
    except:
        clean_title.append(a['abstract'].replace('\n', ' ').strip())
    # Clean abstract
    try:
        clean_abstract.append(LatexNodes2Text().latex_to_text(a['abstract']).replace('\n', ' ').strip()) 
    except:
        clean_abstract.append(a['abstract'].replace('\n', ' ').strip())
articles_df['clean_abstracts'] = clean_abstract
articles_df['clean_title'] = clean_title

articles_df['clean_authors'] = articles_df['clean_authors'].apply(lambda x: '|'.join(x))
articles_df.to_csv("articles.csv", sep=';', index=False)
        