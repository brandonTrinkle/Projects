import mongoose from 'mongoose';

// Create a new schema for the History database
const historySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    stockTicker: {
        type: String,
        required: true,
    },
    shares: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    totalCost: { 
        type: Number, 
        required: function() { 
            return ['buy', 'sell'].includes(this.transactionType); 
        },
        default: function() {
            return this.shares * this.price;
        }
    },
    transactionType: {
        type: String,
        enum: ['buy', 'sell', 'deposit', 'withdraw'],
        required: true,
    },

}, { timestamps: true });

const History = mongoose.models.History || mongoose.model('History', historySchema, 'histories');

export default History;