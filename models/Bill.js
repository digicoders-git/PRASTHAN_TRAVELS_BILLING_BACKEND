const mongoose = require('mongoose');

const billSchema = mongoose.Schema({
  billNo: {
    type: String,
    required: true,
    unique: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientAddress: String,
  clientContact: String,
  clientGSTIN: String, // GST registration number (if any)
  items: [
    {
      description: String,
      hsnCode: String,
      qty: Number,
      rate: Number,
      gstRate: Number, // Percentage (e.g., 5, 12, 18, 28)
      cgst: Number,
      sgst: Number,
      igst: Number,
      total: Number,
    }
  ],
  totalQty: Number,
  totalTax: Number,
  cgstAmount: Number,
  sgstAmount: Number,
  igstAmount: Number,
  subTotal: Number,
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Pending'],
    default: 'Pending',
  },
  isGstEnabled: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Bill', billSchema);
