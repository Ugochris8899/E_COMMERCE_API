const express =  require("express");
const { 
    createUser, 
    loginUser, 
    getAllUsers,
    getUser,
    deleteUser,
    updateUser,
    blockUser,
    unBlockUser,
    handleRefreshToken,
    logOut,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
} = require("../controller/userCtrl");

const {authMiddleware, isAdmin} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", createUser);
router.put("/password",authMiddleware, updatePassword);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.get("/all-users", getAllUsers);
router.get("/refresh",handleRefreshToken);
router.get("/logout",logOut);
router.get("/oneuser/:id", authMiddleware,isAdmin, getUser);
router.delete("/deleteuser/:id", deleteUser);
router.put("/updateuser/:id",authMiddleware, updateUser);
router.put("/block-user/:id",authMiddleware, isAdmin,blockUser);
router.put("/unblock-user/:id",authMiddleware,isAdmin, unBlockUser);
router.get("/wishlist", authMiddleware, getWishlist);
router.put("/save-address", authMiddleware, saveAddress);
router.post("/cart",authMiddleware, userCart);
router.get("/cart",authMiddleware, getUserCart);
router.delete("/empty-cart",authMiddleware, emptyCart);
router.post("/cart/applycoupon",authMiddleware, applyCoupon);
router.post("/cart/cash-order",authMiddleware, createOrder);
router.get("/get-orders",authMiddleware, getOrders);
router.put("/order/update-orderStatus/:id",authMiddleware, isAdmin, updateOrderStatus);


module.exports = router;