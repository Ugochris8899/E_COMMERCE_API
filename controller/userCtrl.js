const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const { generateToken } = require("../config/jwtToken");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const {generateRefreshToken} = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("../controller/emailCtrl");
const crypto = require('crypto');





const createUser = asyncHandler(async(req, res) =>{
    const email = req.body.email;
    const findUser = await User.findOne({email:email});
    if(!findUser) {
        // Create a new user
        const newUser =await User.create(req.body);
        res.json(newUser);
    }
    else {
        throw new Error ("User already exists")
    }
});

const loginUser = asyncHandler(async(req, res) =>{
    const {email, password} = req.body;
    // console.log(email, password);
    // Check if user exist or not
    const findUser = await User.findOne({email});
    if(findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(findUser.id, {
            refreshToken: refreshToken,
        },
        {new:true}
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findUser?._id,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            role: findUser?.role,
            token: generateToken(findUser?._id)
        });
    } else {
        throw new Error("Invalid credentials")
    }
});

const loginAdmin = asyncHandler(async(req, res) =>{
    const {email, password} = req.body;
    // console.log(email, password);
    // Check if user exist or not
    const findAdmin = await User.findOne({email});
    if(findAdmin.role !== "Admin") throw new Error("Not authorized");
    if(findAdmin && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateAdmin = await User.findByIdAndUpdate(findAdmin.id, {
            refreshToken: refreshToken,
        },
        {new:true}
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            firstName: findAdmin?.firstName,
            lastName: findAdmin?.lastName,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            role: findAdmin?.role,
            token: generateToken(findAdmin?._id)
        });
    } else {
        throw new Error("Invalid credentials")
    }
});

// Handle refresh token
const handleRefreshToken = asyncHandler(async(req, res)=>{
    const cookie = req.cookies;
    console.log(cookie);
    if(!cookie.refreshToken) throw new Error ("No refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error ("No refresh token present in the db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) =>{
        if(err || user.id !== decoded.id) {
            throw new Error("There's something wrong with refresh token")
        } 
        const accessToken = generateToken(user?._id);
        res.json({accessToken});
    });
});

// Log out function
const logOut = asyncHandler(async(req, res) =>{
    const cookie = req.cookies;
    if(!cookie.refreshToken) throw new Error ("No refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204);  //Forbidden
    }
    await User.findOneAndUpdate({refreshToken}, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204);   //Forbidden
});

// Update a user
const updateUser =asyncHandler(async(req, res) =>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstName:req?.body?.firstName,
            lastName:req?.body?.lastName,
            email:req?.body?.email,
            mobile:req?.body?.mobile
        }, {new: true})
        res.json(updatedUser)
    } catch (error) {
        throw new Error(error);
    }
});

// Get all users
const getAllUsers = asyncHandler(async(req, res) =>{
    try {
        const getUsers = await User.find(); 
        res.json(getUsers)
    } catch (error) {
        throw new Error(error);
    }
});

// Get a single user
const getUser = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    // console.log(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a user
const deleteUser = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    // console.log(id);
    try {
        const deleteUser = await User.findByIdAndDelete(id);
        res.json({
            deleteUser
        });
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(id,{
            isBlocked: true
        }, 
        {new: true },
        );
        res.json({
            message:"user blocked",
            data: block,
        });
    } catch (error) {
        throw new Error(error)
    }
});



const unBlockUser = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const unblockUser = await User.findByIdAndUpdate(id,{
            isBlocked: false
        }, 
        {new: true },
        );
        res.json({
            message:"user unblocked",
            data: unblockUser,
        });
        
    } catch (error) {
        throw new Error(error)
    }
});

const updatePassword = asyncHandler(async(req, res) =>{
    // console.log(req.body);
   const {_id} = req.user;
   const {password} = req.body;
   validateMongoDbId(_id);
   const user = await User.findById(_id);
   if(password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
   }
   else {
    res.json(user);
   }
});

const forgotPasswordToken = asyncHandler(async(req, res) =>{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new Error("User not found with this email");
    try {
        const token = await user.createPasswordRestToken();
        await user.save();
        const resetURL = `Hi, please follow this link to reset your password. This link is valid till 10 minutes from now <a href= "http://localhost:5000/api/user/reset-password/${token}">Click Here</>`;
        const data = {
            to: email,
            Text:"Hey user",
            subject: "Forgort Password Link",
            html: resetURL,
        };
        sendEmail(data);
        console.log(token);
        res.json(token);
    } catch (error) {
        throw new Error (error.message);
        // console.log(error);
    }
});

const resetPassword = asyncHandler(async(req, res) =>{
    const {password} = req.body;
    const {token} = req.params; 
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now()},
    });
    if(!user) throw new Error ("Token expired, please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

const getWishlist = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    try{
        const findUser = await User.findById(_id).populate("wishList");
        res.json(findUser);
    }catch (error) {
        throw new Error(error)
    }
});

// Save user address
const saveAddress = asyncHandler(async(req, res, next)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(_id,
             {
            address:req?.body?.address,
            },
          {new: true}
          );
        res.json(updatedUser)
    } catch (error) {
        throw new Error(error);
    }
});


const userCart = asyncHandler(async(req, res)=>{
    const {cart} = req.body;
    const {_id} = req.user;
    // console.log(req.user);
     validateMongoDbId(_id);
    try {
        let products = [];
        const user = await User.findById(_id);
        // checks if user already have product in cart
        const alreadyExistCart = await Cart.findOne({orderby:user._id});
        // const alreadyExistCart = await Cart.findOne({ orderby: user._id }).lean(false);

        // if(alreadyExistCart) {
        //   await alreadyExistCart.remove();
        //    }
       for(let i = 0; i < cart.length; i++) {
            let object = {};
            object.Product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for(let i = 0; i < products.length; i ++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }
        // console.log(products, cartTotal);
        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,
        }).save();
        res.json(newCart);
    } catch (error) {
       throw new Error(error);
    }
});


const getUserCart = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const cart = await Cart.findOne({orderby:_id})
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }

});


const emptyCart = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const user = await User.findOne({_id});
        const cart = await Cart.findOneAndRemove({orderby: user._id});
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});


const applyCoupon = asyncHandler(async(req, res)=>{
    const {coupon} = req.body;
    const {_id} = req.user;
    validateMongoDbId(_id);
    const validCoupon = await Coupon.findOne({name: coupon});
    if(validCoupon === null) {
        throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({_id});
    let {products, cartTotal} = await Cart.findOne({orderby: user._id}).populate(
        "products.Product"
        );
        let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount)/100).toFixed(2);
        await Cart.findOneAndUpdate({orderby: user._id}, {totalAfterDiscount}, {new:true});
        res.json(totalAfterDiscount);
});


const createOrder = asyncHandler(async(req, res)=>{
    const {COD, couponApplied} = req.body;
    const {_id} = req.user;
    validateMongoDbId(_id);
  try {
    if(!COD) throw new Error("Create cash order failed");
    const user = await User.findById({_id});
    let userCart = await Cart.findOne({orderby: user._id});
    let finalAmount = 0;
    if(couponApplied && userCart.totalAfterDiscount) {
        finalAmount = userCart.totalAfterDiscount;
    } else {
        finalAmount = userCart.cartTotal;
    }
    let newOrder = await new Order({
        products: userCart.products,
        paymentIntent:{
            id: uniqid(),
            method: "COD",
            amount: finalAmount,
            status: "Cash on Delivery",
            created: Date.now(),
            currency: "usd",
        },
        orderby: user._id,
        orderStatus: "Cash on Delivery"
    }).save();
    let update = userCart.products.map((item)=>{
        return {
            updateOne:{
                filter:{_id: item.Product._id},
                update: {$inc: {quantity: - item.count, sold: + item.count}}
            }
        }
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({message: "Success"});
  } catch (error) {
    throw new Error(error);
  }
});


const getOrders = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const userOrders = await Order.findOne({orderby:_id})
        .populate("products.product").exec();
        res.json(userOrders);
    } catch (error) {
        throw new Error(error);
    }
});


const updateOrderStatus = asyncHandler(async(req, res)=>{
    const {status} = req.body;
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const updateOrderStatus = await Order.findByIdAndUpdate(id, 
            {
                orderStatus:status,
                paymentIntent: {
                    status: status,
                }
    
            }, 
            {new: true}
            );
            res.json(updateOrderStatus);
    } catch (error) {
        throw new Error(error);
    }
});






module.exports = {
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
    updateOrderStatus,
};