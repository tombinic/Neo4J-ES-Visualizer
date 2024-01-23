1) Run your Neo4j instance.
2) Run your ElasticSearch instance.
3) Go inside SMBUD-Project-23-24/server.js e modify port and credentials of your instances.
4) Download the dataset from the link provided in dump/dump.txt
5) Go inside SMBUD-Project-23-24/datasets
6) Put the the dataset (json file) in SMBUD-Project-23-24/datasets
7) Run "parseDataset.py"
8) Run "loadDatasetNeo4j.py"
9) Run "loadDatasetElastic.py"

N.B.: As explained in the report we generated a random subset of the json file due to computational limit. So it might be the case that some quries won't perform as shown in the report.

1) From CMD, go inside SMBUD-Project-23-24.
2) Run "npm install".
3) Run "npm start".
4) Go at localhost:4000.
5) Enjoy the app.

The instruction on how to use the app are on the report.