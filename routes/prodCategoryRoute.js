const express = require("express");
const router = express.Router();

const {createCategory, updateCategory,getCategory, getAllCategory, deleteCategory} = require("../controller/prodCategoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/createcategory",authMiddleware, isAdmin, createCategory);
router.put("/updatecategory/:id",authMiddleware, isAdmin, updateCategory);
router.get("/getcategory/:id",authMiddleware, isAdmin, getCategory);
router.get("/getallcategory",authMiddleware, isAdmin, getAllCategory);
router.delete("/deletecategory/:id",authMiddleware, isAdmin, deleteCategory);


module.exports = router;