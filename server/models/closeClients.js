const mongoose = require('mongoose');
const crypto = require('crypto');

const closeClientSchema = new mongoose.Schema({
    clientName:{type: String},
    email: { type: String},
    phone: { type: String },
    role: { type: String, enum: ['client'], default: 'client' },
    managerID:{type: String, unique: false},
    managerKey:{type: String, unique: false},
    status: {type: String, enum:['new', 'in_processing', 'agreed', 'successful', 'successfulNotWork', 'notWork', 'return', 'nds','wholesale', 'cancel'], default: 'new', unique: 'new'},
    product: {type: Array},
    payment:{type: Array},
    notice:{type: String},
    selectedDate: { type: Date, default: null },
    dateOfCreated: { type: String, default: null }
});

const CloseClient = mongoose.model('CloseClient', closeClientSchema);

module.exports = CloseClient;
