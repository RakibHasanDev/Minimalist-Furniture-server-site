const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const stripe = require('stripe')( )
require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


const port = process.env.PORT || 5000;
const app = express();

// console.log(process.env.STRIPE_SECRET_KEY)

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h32cfqq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const usersCollection = client.db('minimalFurniture').collection('users');
const productCollection = client.db('minimalFurniture').collection('products');
 const categoryCollection = client.db('minimalFurniture').collection('categoryCollection');
 const bookingCollection = client.db('minimalFurniture').collection('bookings');
 const reportCollection = client.db('minimalFurniture').collection('reports');
 const advertiseCollection = client.db('minimalFurniture').collection('advertise');
 const paymentCollection = client.db('minimalFurniture').collection('payments');

async function run() {

    try {

      
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

       

        
        // put user from google signin

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

        

        // get users

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

     

        //users role
      
        app.get('/allUsers/:role', async (req, res) => {
            const role = req.params.role;
            const query = { role: role };
            const data = usersCollection.find(query)
            const result = await data.toArray()
            res.send(result);
        });

      
        //get category

        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoryCollection.find(query).toArray();
            res.send(categories);
        });

        // get sellers by id

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' });
        });

        // get admin

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'Admin' });
        });

        app.get('/bookings',  async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        });

  
        app.get('/products',  async (req, res) => {
            const email = req.query.email;
            const query = { sellerEmail: email };
            const products = await productCollection.find(query).toArray();
            res.send(products);
        });
    
        app.get('/products/:name', async (req, res) => {
            const category = req.params.name;
            const query = { categoryName: category }
            const data = productCollection.find(query)
            const result = await data.toArray()
            // console.log(category)
            res.send(result)
        });
        app.get('/advertise/:advertise', async (req, res) => {
            const advertise = req.params.advertise;
            const query = { advertise: advertise };
            const data = productCollection.find(query)
            const result = await data.toArray()
            res.send(result);
        });
        app.post("/products", async (req, res) => {
            const product = req.body;
            // console.log(product);
            const result = await productCollection.insertOne(product);
            res.send(result);
        });
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);

            
            const query = {
                productId: booking.productId,
                email: booking.email
                
            }

            const alreadyBooked = await bookingCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You already have a booking for ${booking.ProductTitle}`
                return res.send({ acknowledged: false, message })
            }
            

            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });

        app.put('/users/verify/:id',  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: 'true'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        app.put('/products/advertise/:id',  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertise: 'true'
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
      
        // report start
        // Add Report Product

        app.post("/addReport", async (req, res) => {
            const reportInfo = req.body;
            // console.log(product);
            const result = await reportCollection.insertOne(reportInfo);
            res.send(result);
        });

        // Get Report
        app.get("/allReports", async (req, res) => {
            const query = {};
            const result = await reportCollection.find(query).toArray();
            res.send(result);
        });
        app.delete("/allReports/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reportCollection.deleteOne(query);
            res.send(result);
        });

        // report end 

        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);

        });

        // /*  */

        // Payments Orders
        app.get("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const orders = await bookingCollection.findOne(query);
            res.send(orders);
        });

        // create-payment-intent
        app.post("/create-payment-intent", async (req, res) => {
            const orders = req.body;
            const price = orders.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                payment_method_types: ["card"],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        //payments
        app.post("/payments", async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);
            const id = payment.bookingId;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId,
                },
            };
            const updatedResult = await bookingCollection.updateOne(
                filter,
                updatedDoc
            );
            res.send(result);
        });

        /*
        const order = req.body;
        const order = await orderCollection.updateOne(...);
        const product = await productCollection.updateOne({ _id: ObjectId(order.productId) })

        */



        // /*  */
     
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