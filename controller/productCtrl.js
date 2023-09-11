const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");



const createProduct = asyncHandler(async(req, res) =>{
   try {
    if(req.body.title) {
        req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
   } catch (error) {
    throw new Error(error);
   }
});

// Update product
const updateProduct = asyncHandler(async(req, res) =>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
         }
         const productUpdate = await Product.findOneAndUpdate({_id: id}, req.body, {
            new:true,
        });
        //  console.log(productUpdate);
         res.json(productUpdate);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a product
const getProduct = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    // console.log(id);
    try {
        const getaProduct = await Product.findById(id);
        res.json({
            getaProduct
        });
    } catch (error) {
        throw new Error(error);
    }
});

 // Get all products
const getAllProducts = asyncHandler(async(req, res) =>{
    try {
         // filtering

        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el)=> delete queryObj[el]);
        // console.log(queryObj, req.query);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        // console.log(JSON.parse(queryStr));
        let query = Product.find(JSON.parse(queryStr));

        // Sorting

        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else{
            query = query.sort("-createdAt");
        }

        // Limiting the fields

        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else{
            query = query.select("-__v");
        }

        // Pagination

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page -1) * limit;
        query = query.skip(skip).limit(limit);
        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error("This page does not exists");
        }
        console.log(page,limit,skip);

        const product = await query
        res.json(product)
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a product
const deleteProduct = asyncHandler(async(req, res) =>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
         const deleteProd = await Product.findByIdAndDelete(id);
        //  console.log(productUpdate);
         res.json(deleteProd);
    } catch (error) {
        throw new Error(error);
    }
});

const addToWishlist = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    const {prodId} = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyadded = user.wishList.find((id)=> id.toString() === prodId);
        if(alreadyadded) {
            let user = await User.findByIdAndUpdate(_id, {
                $pull: {wishList: prodId},
            }, {new:true});
            res.json(user);
        }
        else {
            let user = await User.findByIdAndUpdate(_id, {
                $push: {wishList: prodId},
            }, {new:true});
            res.json(user);
        }
    } catch (error) {
        throw new Error(error);
    }
});

const rating = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    const {star, prodId, comment} = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());
    if(alreadyRated) {
        const updateRating = await Product.updateOne(
            {
            ratings: {$elemMatch: alreadyRated},
            },
            {
                $set:{"ratings.$.star":star, "ratings.$.comment":comment},
            },
            {new:true},
            );
            // res.json(updateRating);
        
    } else {
        const rateProduct = await Product.findByIdAndUpdate(prodId,
         {
            $push:{
                ratings:{
                    star: star,
                    comment: comment,
                    postedby: _id,
                }
            }
        }, 
        {new: true},
        );
        // res.json(rateProduct);
    };
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingSum = getallratings.ratings.map((item) => item.star)
    .reduce((prev, curr)=>prev + curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);
    const finalProduct = await Product.findByIdAndUpdate(
        prodId, 
        {
        totalrating: actualRating, //Update the totalRatings field
        }, 
        {new:true}
    );
    res.json(finalProduct);  
  } catch (error) {
    throw new Error(error);
  }
});

const uploadImages = asyncHandler(async(req, res)=>{
    // console.log(req.files);
    const {id} = req.params;
    validateMongoDbId(id);
    console.log(req.files);
    try {
        // const uploader = (path) => cloudinaryUploadImg(path, "images");
        const uploader = async (path) => await cloudinaryUploadImg(path, "images"); // Use async/await here
        const urls = [];
        const files = req.files;
        for(const file of files) {
            const {path} = file;
            // const newPath = uploader(path);
            const newPath = await uploader(path);
            console.log(newPath);
            urls.push(newPath);
            console.log(file);
            fs.unlinkSync(path);
            // return newPath;
           
        }
       

        const findProduct = await Product.findByIdAndUpdate(id, {
            images: urls.map(file =>{
                return file
            }),
        }, 
       
        {
            new:true
        }
        );
        res.json(findProduct);
        
    } catch (error) {
        throw new Error(error);
    }
});






module.exports = {
    createProduct,
    getProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages
};