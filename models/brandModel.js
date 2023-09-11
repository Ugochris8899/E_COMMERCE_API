const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const brandSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
   
}, 
{timestamps:true},
);

const Brand = mongoose.model('Brand', brandSchema);

//Export the model
module.exports = Brand;