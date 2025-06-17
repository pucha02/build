const mongoose = require('mongoose');
const crypto = require('crypto');

const managerSchema = new mongoose.Schema({
    nameManager: {type: String},
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ['manager', 'admin'], default: 'manager' },
    adminKey: { type: String, unique: false },
    managerKey: { type: String, unique: false },
    managerID:{type: String, unique: false},
    photo: { type: String }
});

managerSchema.pre('save', function (next) {
    // Генерируем adminKey только для пользователей с ролью "admin"
    if (this.role === 'admin') {
        this.adminKey = crypto.randomBytes(16).toString('hex');
        this.managerID = this.adminKey
    } 
    if (this.role === 'manager') {
        this.managerID = crypto.randomBytes(16).toString('hex');
    } 

    next();
});


const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;
