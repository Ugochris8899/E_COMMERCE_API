const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const orderSchema = new mongoose.Schema({
   products: [
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        count: Number,
        color: String,
    },
   ],
   paymentIntent: {},
   orderStatus: {
    type: String,
    default: "Not processed",
    enum: [
        "Not processed",
        "Cash on Delivery",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered"
    ],
   },
   orderby: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: "User",
   },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

//Export the model
module.exports = Order;