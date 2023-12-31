const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "Category",
        type: String,
        required: true,
    },
    brand:{
        type: String,
        required: true,
        // enum:["Apple", "Samsung", "Lenovo"],
    },
    quantity:{
        type: Number,
        required: true,
        // select: false,
    },
    sold:{
        type: Number,
        default:0,
        // select: false,
    },
    images:[],
 
    color:{
        type: String,
        required: true,
        // enum:["Black", "Brown", "Red"],
    },
    ratings:[{
        star: Number,
        comment: String,
        postedby:{type:mongoose.Schema.Types.ObjectId, ref: "User"},
    }],
    totalrating: {
        type:String,
        default: 0,
    },

}, 
    {timestamps: true}
);

const Product = mongoose.model("Product", productSchema);


//Export the model
module.exports = Product;