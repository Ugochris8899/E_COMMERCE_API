const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const blogcategorySchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
   
}, 
{timestamps:true},
);

const blogCategory = mongoose.model('Blogcategory', blogcategorySchema);

//Export the model
module.exports = blogCategory;