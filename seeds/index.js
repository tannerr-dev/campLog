const mongoose = require('mongoose');
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/campLog', {
    useNewUrlParser: true,
   useUnifiedTopology: true
}); // useCreateIndex: true,// docs says it always acts as true now
    

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", ()=>{
    console.log("DataBASS connected")
});
// const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async ()=>{
    await Campground.deleteMany({});
    // const c = new Campground({title: "purple field"});
    // await c.save();
    const sample = array => array[Math.floor(Math.random() * array.length)];
    for(let i =0; i<50; i++){
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground ({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,

        })
        await camp.save();
    }
}


// seedDB();
seedDB().then(()=>{
    mongoose.connection.close();
})