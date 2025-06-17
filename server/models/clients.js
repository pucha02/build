const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    _id: { type: String },
    clientName:{type: String},
    email: { type: String },
    phone: { type: String },
    secondPhone: {type: String},
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

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
