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