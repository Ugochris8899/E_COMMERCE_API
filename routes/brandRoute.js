const express = require("express");
const router = express.Router();

const {createBrand, updateBrand,getBrand, getAllBrand, deleteBrand} = require("../controller/brandCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/createbrand",authMiddleware, isAdmin, createBrand);
router.put("/updatebrand/:id",authMiddleware, isAdmin, updateBrand);
router.get("/getbrand/:id",authMiddleware, isAdmin, getBrand);
router.get("/getallbtrand",authMiddleware, isAdmin, getAllBrand);
router.delete("/deletebrand/:id",authMiddleware, isAdmin, deleteBrand);


module.exports = router;