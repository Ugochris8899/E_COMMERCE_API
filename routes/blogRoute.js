const express = require("express");
const router = express.Router();

const {createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog,disLikeBlog,uploadImages } = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");


router.post("/create-blog",authMiddleware,isAdmin, createBlog);
router.put("/upload/:id",
authMiddleware, 
isAdmin, 
uploadPhoto.array("images", 10),
blogImgResize,
 uploadImages,
);
router.put("/update-blog/:id",authMiddleware,isAdmin, updateBlog);
router.get("/getOne-blog/:id", getBlog);
router.get("/getBlogs", getAllBlogs);
router.delete("/delete-blog/:id",authMiddleware,isAdmin, deleteBlog);
router.put("/likes",authMiddleware, likeBlog);
router.put("/dislikes",authMiddleware, disLikeBlog);




module.exports = router;