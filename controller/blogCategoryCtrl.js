const blogCategory = require("../models/blogCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createCategory = asyncHandler(async(req, res)=>{
    try {
        const newCategory = await blogCategory.create(req.body);
        res.json(newCategory);
    } catch (error) {
       throw new Error(error); 
    }
});

const updateCategory = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const updatedCategory = await blogCategory.findByIdAndUpdate(id, req.body, {new:true});
        res.json(updatedCategory);
    } catch (error) {
       throw new Error(error); 
    }
});

const getCategory = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const getaCategory = await blogCategory.findById(id);
        res.json(getaCategory);
    } catch (error) {
       throw new Error(error); 
    }
});

const getAllCategory = asyncHandler(async(req, res)=>{
    try {
        const getCategorys = await blogCategory.find();
        res.json(getCategorys);
    } catch (error) {
       throw new Error(error); 
    }
});

const deleteCategory = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deletedCategory = await blogCategory.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (error) {
       throw new Error(error); 
    }
});

module.exports = {
    createCategory,
    updateCategory,
    getCategory,
    getAllCategory,
    deleteCategory,
}