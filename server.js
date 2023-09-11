const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/prodCategoryRoute");
const brandRouter = require("./routes/brandRoute");
const blogcategoryRouter = require("./routes/blogcategoryRoute");
const couponRouter = require("./routes/couponRoute");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { notFound, errorHandler } = require('./middlewares/errorHandler');
dbConnect();
app.use(morgan("dev"));
app.use(express.json());

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/coupon", couponRouter);

app.use(notFound);
app.use(errorHandler);
// app.use((err, req, res, next) => {
//     console.error(err); // Log the error for debugging purposes

//     res.status(500).json({ error: 'Something went wrong' });
// });

app.listen(PORT, ()=>{
    console.log(`Server is running at PORT ${PORT}`);
})