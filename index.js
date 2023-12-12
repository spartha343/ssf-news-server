require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares 
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.byx3n24.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const categoryCollection = client.db('ssfNews').collection('categories');
        const newsCollection = client.db('ssfNews').collection('news');
        const userCollection = client.db('ssfNews').collection('users');

        app.get('/categories', async (req, res) => {
            const query = {};
            const options = {
                sort: {
                    categoryId: 1
                }
            };
            const categories = await categoryCollection.find(query, options).toArray();
            res.send(categories);
        })

        app.get('/categories/:id', async (req, res) => {
            let id = parseInt(req.params.id);
            let query = { categoryId: id };
            if (!id) {
                id = 0;
                query = {};
            }
            const options = {
                sort: {
                    date: -1
                }
            }
            const news = await newsCollection.find(query, options).toArray();
            res.send(news)
        })

        app.get('/news-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const news = await newsCollection.findOne(query);
            res.send(news);
        })

        app.get('/news-by-same-author/:id', async (req, res) => {
            const id = req.params.id;
            const query = { userId: id };
            const options = {
                sort: {
                    date: -1
                }
            }
            const newsBySameAuthor = await newsCollection.find(query, options).toArray();
            res.send(newsBySameAuthor);
        })

        app.post('/post-news', async (req, res) => {
            const news = req.body;
            const result = await newsCollection.insertOne(news);
            result.categoryId = news.categoryId;
            res.send(result);
        })

        app.patch('/update-news/:id', async (req, res) => {
            const id = req.params.id;
            const updatedNews = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    ...updatedNews
                }
            };
            const result = await newsCollection.updateOne(filter, updatedDoc, options);
            result.categoryId = updatedNews.categoryId;
            res.send(result);
        })

        app.delete('/delete-news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await newsCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const options = {};
            const users = await userCollection.find(query, options).toArray();
            res.send(users);
        })

        app.get('/user-role/:id', async (req, res) => {
            const id = req.params.id;
            const query = { userId: id };
            const options = {
                projection: { _id: 0, role: 1 }
            };
            const result = await userCollection.findOne(query, options);
            res.send(result);
        })

        app.patch('/user-role/:id', async (req, res) => {
            const id = req.params.id;
            const role = req.body.newRole;
            const filter = { userId: id };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
    }
    finally {
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from SSF server.')
})

app.listen(port, () => {
    console.log(`SSF server is running perfectly on port: ${port}`);
})