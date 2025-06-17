const mongoose = require('mongoose');

const buyersSchema = new mongoose.Schema({
    name:{type: String},
    phone:{type: String},
    email: { type: String, unique: true },
    notice:{type: String},
    role: { type: String, enum: ['buyer', 'client'], default: 'buyer' },
    managerID:{type: String, unique: false},
    managerKey:{type: String, unique: false},
    adminKey:{type: String, unique: false}
});

const Buyer = mongoose.model('Buyer', buyersSchema);

module.exports = Buyer;