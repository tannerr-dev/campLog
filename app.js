
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');



mongoose.connect('mongodb://127.0.0.1:27017/campLog', {
    useNewUrlParser: true,
    // useCreateIndex: true,// docs says it always acts as true now
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", ()=>{
    console.log("DataBASS connected")
});

const app  = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))



app.get('/', (req, res)=>{
    // res.send('Hello, I am campLog');
    res.render('home')
})


app.get('/newcampground', async (req, res)=>{
    // const camp = new Campground({title: 'Como Park', description: 'Beautiful'});
    await camp.save();
    res.send(camp)
});





app.listen(3000, ()=>{
    console.log('Listening for data waves on port 3000')
})