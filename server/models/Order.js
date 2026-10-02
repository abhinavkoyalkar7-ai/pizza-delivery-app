import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    base: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
    sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
    cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
    veggies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
    itemPrice: { type: Number, required: true },
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  orderStatus: { 
    type: String, 
    enum: ['Order Received', 'In the Kitchen', 'Sent for Delivery', 'Delivered'], 
    default: 'Order Received' 
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);