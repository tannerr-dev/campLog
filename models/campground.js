const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema  ({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});
  


// vvv .post below means its post query in mongoose and mongo
CampgroundSchema.post("findOneAndDelete", async function(doc){
    // console.log("damn b")
    // console.log(doc)
    if(doc){
        await Review.deleteMany({ // colt's class says .remove but research shows it is deprecated
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema);


