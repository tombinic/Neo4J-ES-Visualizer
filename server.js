import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import neo4j from 'neo4j-driver';
import { Client } from '@elastic/elasticsearch';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const port = process.env.PORT || 4000;
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', ''));
const elasticClient = new Client({ 
    node: 'https://localhost:9200',
    log: 'trace', // Add this line for detailed logging
    ssl: { rejectUnauthorized: false },
    auth: {
        username: 'elastic',
        password: 'OswJuTiwd5UmBpSLakbk',
      },
});

app.use(cors({ origin: ['http://localhost'] }));
app.use(express.static(__dirname));
app.use(express.json());
app.use('/boostrap', express.static(path.join(__dirname, '/public/boostrap/')));
app.use('/scripts', express.static(path.join(__dirname, '/public/scripts/')));
app.use('/style', express.static(path.join(__dirname, '/public/style/')));
app.use('/media', express.static(path.join(__dirname, '/public/media/')));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/:page", (req, res) => {
    const pagePath = path.join(__dirname, 'public', req.params.page + '.html');

    fs.access(pagePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).sendFile(path.join(__dirname, 'public', 'notfound.html'));
        } else {
            res.sendFile(pagePath);
        }
    });
});

app.get("/api/text", async (req, res) => {
    const query = decodeURIComponent(req.query.query);
    try {
        const results = await elasticClient.search({
            index: 'arxiv',
            body: JSON.parse(query)
        });

        res.json(results);
    } catch (error) {
        console.error('ElasticSearch Error:', error);
        if (error.name === 'ConnectionError') {
            res.status(503).send('Service Unavailable');
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
});

app.get("/api/graph", (req, res) => {
    const session = driver.session();
    const query = decodeURIComponent(req.query.query);
    console.log(query);
    session.run(query)
        .then(result => {
            const records = result.records.map(record => record.toObject());
            res.json(records);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error while performing the query: ' + error);
        })
        .finally(() => {
            session.close();
        });
});

app.get("/api/examples/graph", (req, res) => {
    fs.readFile('server_data/graph_queries.json', 'utf8', (error, data) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error getting default graph queries: ' + error);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.get("/api/examples/text", (req, res) => {
    fs.readFile('server_data/text_queries.json', 'utf8', (error, data) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error getting default graph queries: ' + error);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.listen(port, () => {
    console.log('ArXiv 3D Explorer');
    console.log(`Server Established and  running on Port: ${port}`);
    console.log(`http://localhost:${port}/`);
});
