from neo4j import GraphDatabase
import pandas as pd
from datetime import datetime

driver = GraphDatabase.driver('neo4j://localhost:7687', auth=('neo4j', ''))

articles_df = pd.read_csv('articles.csv', sep=';')
articles_df["clean_authors"] = articles_df["clean_authors"].apply(lambda x: x.split('|'))
print(articles_df["categories"])
print(articles_df.head())

if True:

    with driver.session() as session:
        session.run('CREATE CONSTRAINT article IF NOT EXISTS FOR (a:Article) REQUIRE a.id IS UNIQUE;')
        session.run('CREATE CONSTRAINT authors IF NOT EXISTS FOR (a:Author) REQUIRE a.name IS UNIQUE;')

    import_query = """

    UNWIND $data as row
    CREATE (a:Article)
    SET a += apoc.map.clean(row,['authors'],[])
    SET a.date = date(row['date'])
    WITH a, row.authors as authors
    UNWIND authors as author
    MERGE (au:Author{name:author})
    MERGE (au)-[:WROTE]->(a)

    """

    import_data = []
    session = driver.session()
    for i, row in articles_df.iterrows():
        import_data.append({'id':row['id'], 'title':row['clean_title'], 'abstract':row['clean_abstracts'], 
                            'date':datetime.strptime(row['created_date'], '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d'), 'authors':row['clean_authors']})
        if ((i % 2000) == 0) and (len(import_data) != 0):
            session.run(import_query, {'data':import_data})
            import_data = []

    session.run(import_query, {'data':import_data})
    session.close()