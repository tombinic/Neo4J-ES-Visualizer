import pandas as pd
from datetime import datetime
from elasticsearch import Elasticsearch

articles_df = pd.read_csv('articles.csv', sep=';')
articles_df["clean_authors"] = articles_df["clean_authors"].apply(lambda x: x.split('|'))

mapping = {
    "settings":{
        "number_of_shards": 3,
        "number_of_replicas": 3
    },
    "mappings": {
        "properties": {
            "submitter": {"type": "keyword"},
            "authors": {"type": "text"},
            "title": {"type": "text"},
            "abstract": {"type": "text"},
            "comments": {"type": "text"},
            "ref": {"type": "keyword"},
            "categories": {"type": "keyword"},
        }
    }
}

es = Elasticsearch(
    hosts = ['https://localhost:9200'], 
    basic_auth = ['elastic', 'OswJuTiwd5UmBpSLakbk'], 
    verify_certs = False,
)

index_name = "arxiv"
if not es.indices.exists(index=index_name):
    es.indices.create(index=index_name, body=mapping)
    print(f"Index '{index_name}' created, with the specified mapping.")
else:
    print(f"Index '{index_name}' already exists.")

print(articles_df.columns)
articles_df = articles_df[['submitter', 'authors', 'clean_title', 'comments', 'journal-ref', 'categories','clean_abstracts']]
articles_df = articles_df.rename(columns = {'clean_title': 'title', 'clean_abstracts': 'abstract', "journal-ref": "ref"})
articles_df = articles_df.fillna('')
docs = articles_df.to_dict(orient = 'records')

for idx, doc in enumerate(docs):
    res = es.index(index = index_name, id = idx, body = doc)
    print(res)