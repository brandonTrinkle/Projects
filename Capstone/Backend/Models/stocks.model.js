import mongoose from 'mongoose';

const stocksSchema = new mongoose.Schema({
  ticker: { 
    type: String, 
    required: true, 
    unique: true 
  },

  companyName: { 
    type: String, 
    required: true 
  },

  price: { 
    type: Number, 
    required: true, 
    default: 0 
  },

  high: { 
    type: Number, 
    default: 0 
  },

  low: { 
    type: 
    Number, 
    default: 0 
  },

  volume: { 
    type: Number, 
    required: true, 
    default: 0 
  },

  outstandingShares: { 
    type: Number, 
    default: null 
  },

  marketCap: { 
    type: Number, 
    default: null }, 
}, 
{ 
  timestamps: true 
});

export default mongoose.model('Stock', stocksSchema);