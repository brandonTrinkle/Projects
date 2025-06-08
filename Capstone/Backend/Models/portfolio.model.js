import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, ref: 'User' 
    }, 
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true },
    stocks: [
        {
            companyName: { 
                type: String, 
                required: true 
            },
            ticker: { 
                type: String, 
                required: true }, 
            shares: { 
                type: Number, 
                required: true, 
                default: 0
            },
            price: {
                type: Number,
                required: true,
                default: 0
            }, 
        },
    ],
    availableFunds: { 
        type: Number, 
        required: true, 
        default: 0 }, 
}, 
{ 
    timestamps: true 
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
