import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const port = 3000;
const app = express();

app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const client = new MongoClient('mongodb://localhost:27017')
await client.connect();
const db = client.db('club');
const membersCollection = db.collection('members');

app.get('/', (req, res) => {
    res.render('startpage');
})
app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/members', async (req, res) => {
    const members = await membersCollection.find({}).toArray();
    res.render('members', { members });
})

app.get('/members/sort/:sortBy', async (req, res) => {
    const members = await membersCollection.find({ "lastName": { "$exists": true } }).sort({'lastName': req.params.sortBy}).toArray();
    res.render('members', { members });
})

app.get('/members/profile/:id', async (req, res) => {
    const member = await membersCollection.findOne({ _id: ObjectId(req.params.id) });
    res.render('profile', { ...member });
})

app.get('/members/profile/change-data/:id', async (req, res) => {
    const member = await membersCollection.findOne({ _id: ObjectId(req.params.id) });
    res.render('change-data', {...member});
})

app.post('/register', async (req, res) => {
    req.body.joinedAt = new Date();
    await membersCollection.insertOne(req.body);
    res.redirect('/members');
})

app.post('/update-data/:id', async (req, res) => {
    await membersCollection.updateOne({ _id: ObjectId(req.params.id) }, { $set: req.body })
    res.redirect(`/members/profile/${req.params.id}`)
})

app.post('/delete/:id', async (req, res) => {
    await membersCollection.deleteOne({ _id: ObjectId(req.params.id) })
    res.redirect('/members');
})

app.listen(port, () => console.log(`Listening on ${port}`))