const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h32cfqq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const usersCollection = client.db('minimalFurniture').collection('users');
const productCollection = client.db('minimalFurniture').collection('products');
 const categoryCollection = client.db('minimalFurniture').collection('categoryCollection');

async function run() {

    try {
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        

        app.put('/users', async (req, res) => {
            const email = req.body.email;
            const data = req.body;
            // console.log(data, email)
            const query = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    photoUrl: data.photoUrl,
                    verify: data.verify
                }
            };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.send(result)
            // console.log(email)
            // console.log(data)
        });
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoryCollection.find(query).toArray();
            res.send(categories);
        });

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' });
        });
        app.post("/products", async (req, res) => {
            const product = req.body;
            // console.log(product);
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

       
        app.get('/products/:name', async (req, res) => {
            const category = req.params.name;
            const query = { categoryName: category }
            const data = productCollection.find(query)
            const result = await data.toArray()
            // console.log(category)
            res.send(result)
        })
        
    }

    finally {
        
    }
    

}

run().catch(console.log);

// console.log(uri)









app.get('/', async (req, res) => {
    res.send('Minimal Furniture server is running');
})

app.listen(port, () => console.log(`Minimal Furniture running on ${port}`))