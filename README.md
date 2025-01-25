# 📚 Neo4J-ES-Visualizer
👥 Thanks to [Andrea Bertogalli](https://github.com/andberto) and [Niccolò Balestrieri](https://github.com/NiccoloBalestrieri)
## 📝 Introduction

In this project, we present a detailed analysis of the ArXiv dataset, a community-supported resource founded in 1991 and operated by Cornell University. By leveraging cutting-edge technologies, our goal is to extract meaningful insights from the interconnected academic knowledge within ArXiv.

We utilized:
- **Neo4j**: A graph database system, chosen for its ability to handle the dataset's graph-like structure (authors, articles, relationships).
- **ElasticSearch**: A robust search engine used for full-text searches across the dataset, ensuring usability and scalability.

Our final output includes a web application showcasing 20 queries (10 for each technology) in a user-friendly interface.

---

## 🛠️ Data Wrangling / Data Generation

The dataset was provided in JSON format and limited to 30,000 randomly selected entries. 

Steps:
1. **Cleaning and Transformation**: Names and dates were cleaned, and Latex-formatted abstracts were converted to UTF-8.
2. **CSV Conversion**: The cleaned data was saved as a CSV file for compatibility with Neo4j and ElasticSearch.

Example transformation:

**Before:**
```latex
\sigma-meson having the predicted mass $m_{\sigma}=666$ MeV
```

**After:**
```
sigma-meson having the predicted mass m_sigma = 666 MeV
```

---

## 🗂️ Dataset

### Neo4j
The dataset for Neo4j included:
- **Article Nodes**: `id`, `title`, `abstract`, `date`.
- **Author Nodes**: `name`.
- **Relationships**: `WROTE`.

### ElasticSearch
A custom mapping was created with the following attributes:
- `submitter`, `authors`, `title`, `abstract`, `comments`, `ref`, `categories`.

---

## 🔍 Queries

### Neo4j Queries
1. **Articles from 2007 with ≥25 authors**
   ```cypher
   MATCH (ar:Article)<-[:WROTE]-(au:Author)
   WITH count(au) as number_of_authors, ar
   WHERE date(ar.date).year = 2007 AND number_of_authors >= 25
   RETURN ar;
   ```
2. **Article with the most authors**
   ```cypher
   MATCH (ar:Article)<-[:WROTE]-(au:Author)
   RETURN ar ORDER BY count(au) DESC LIMIT 1;
   ```

... (Additional queries in the same format)

### ElasticSearch Queries
11. **Articles with "AI" in the title but not "ethic"**
   ```json
   {
     "query": {
       "bool": {
         "must": [ { "match": { "title": "AI" } } ],
         "must_not": [ { "match": { "title": "ethic" } } ]
       }
     }
   }
   ```
12. **Document count by submitter**
   ```json
   {
     "size": 0,
     "aggs": { "doc_by_submitter": { "terms": { "field": "submitter" } } }
   }
   ```

... (Additional queries in the same format)

---

## 📊 Extra

### Disclaimer
Due to time constraints, error handling in the web app is minimal. Users must ensure query syntax correctness.

### WebApp Structure
The app follows a client-server architecture:
- **Frontend**: Sends user queries.
- **Backend**: Processes queries via Neo4j or ElasticSearch and returns results as JSON.

### WebApp Screens
- **Neo4j Interface**: Displays query results as graphs.
- **ElasticSearch Interface**: Shows textual query results.
---

This README file provides an overview of the **Neo4J-ES-Visualizer** project conducted in the **Systems and Methods for Big and Unstructured Data** course, A.Y. 2023-2024, under the supervision of Prof. Marco Brambilla. The project was carried out by Niccolò Balestrieri, Andrea Bertogalli, and Nicolò Tombini from Politecnico di Milano, Italy.

For more detailed information, please refer to the project documentation and source code provided in this repository.
