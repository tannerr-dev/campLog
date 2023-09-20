
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");


mongoose.connect('mongodb://127.0.0.1:27017/campLog', {
    useNewUrlParser: true,
     useUnifiedTopology: true
}); // useCreateIndex: true,// docs says it always acts as true now
   

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("DataBASS connected");
});

const app  = express();

app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({extended: true})) // parses the req.body from the sent form
app.use(methodOverride("_method"));
app.use(morgan('common'));

// app.use((req, res, next)=>{
//     req.requestTime = Date.now();
//     console.log(req.method, req.path);
//     next();
// })

app.get('/', (req, res)=>{
    // res.send('Hello, I am campLog');
    res.render('home');
    // console.log(`yer request date: ${req.requestTime}`);
});


app.get('/campgrounds', async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds})
});

app.get("/campgrounds/new", (req, res)=>{
    res.render("campgrounds/new")
}) //order matters, this needs to be before the /:id otherwise the 'new' will be handled as an id

app.post("/campgrounds", async (req, res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save(); 
    res.redirect(`/campgrounds/${campground._id}`)

})

app.get("/campgrounds/:id", async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/show", {campground})
 })

app.get("/campgrounds/:id/edit", async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", {campground})
})

app.put("/campgrounds/:id", async(req, res)=>{
    // res.send("it worked")
    const{ id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
})

app.delete("/campgrounds/:id", async (req, res)=>{
    const { id }= req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds")
})

app.listen(3000, ()=>{
    console.log('Listening for data waves on port 3000')
})