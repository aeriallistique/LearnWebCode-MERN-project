const express = require('express');
const {MongoClient, ObjectId} = require('mongodb')
const multer = require('multer');
const upload = multer();
const sanitizeHTHML = require('sanitize-html');
const fse = require('fs-extra');
const sharp = require('sharp');
let db;

const path = require('path');

// initial launch make sure public/uploads folder exists
fse.ensureDirSync(path.join("public", "uploaded-photos"));


const app = express();
app.set("view engine", "ejs")
app.set("views", "./views");
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))


function passwordProtected(req, res, next){
  res.set("WWW-Authenticate", "Basic realm='Our MERN App'");
  if(req.headers.authorization == "Basic QW5kcmVpMDE6cGFzc3dvcmQ="){
    next()
  }else{
    console.log(req.headers.authorization);
    res.status(401).send("Try again.")
  }
};

app.get('/', async(req, res)=>{
  const allAnimals = await db.collection('animals').find().toArray();
  res.render('home', {allAnimals});
});

app.use(passwordProtected);

app.get('/admin', (req, res)=>{
  res.render('admin')
})

app.get('/api/animals', async(req, res)=>{
  const allAnimals = await db.collection('animals').find().toArray();
  res.json(allAnimals)
})

app.post('/create-animal',
  upload.single('photo'), 
  ourCleanUp,
  async(req, res)=>{
  console.log(req.body)

  const info = await db.collection("animals").insertOne(req.cleanData);
  const newAnimal = await db.collection("animals").findOne({_id: new ObjectId(info.insertedId)})
  res.send(newAnimal);
})

function ourCleanUp(req, res, next){
  if(typeof req.body.name != "string") req.body.name='';
  if(typeof req.body.species != "string") req.body.species='';
  if(typeof req.body._id != "string") req.body._id='';

  req.cleanData = {
    name: sanitizeHTHML(req.body.name.trim(), {allowedTags: [], allowedAttributes: {}}),
    species: sanitizeHTHML(req.body.species.trim(), {allowedTags: [], allowedAttributes: {}}),
  }

  next();
}

async function start(){
  const client = new MongoClient("mongodb://root:root@localhost:27017/AmazingMernApp?&authSource=admin");
  await client.connect()
  db = client.db()
  app.listen(3000)
}
start()

