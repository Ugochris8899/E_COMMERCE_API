const express = require("express");

const {
     createProduct, 
     getProduct,
     getAllProducts,
     updateProduct,
     deleteProduct,
     addToWishlist,
     rating,
     uploadImages
     } = require("../controller/productCtrl");

     const {isAdmin, authMiddleware} = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImages");

const router = express.Router();

router.post("/create", authMiddleware,isAdmin,createProduct);
router.put("/upload/:id",
authMiddleware, 
isAdmin, 
uploadPhoto.array("images", 10),
productImgResize,
 uploadImages,
);
router.get("/product/:id", getProduct);
router.get("/products", getAllProducts);
router.put("/update/:id",authMiddleware, isAdmin,updateProduct);
router.delete("/deleteproduct/:id",authMiddleware,isAdmin, deleteProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);




module.exports = router;