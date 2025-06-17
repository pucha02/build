const mongoose = require('mongoose');
const crypto = require('crypto');

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String, enum: ['admin'], default: 'admin' },
  adminKey: { type: String, unique: true }
});

adminSchema.pre('save', function (next) {
  // Генерируем adminKey только для пользователей с ролью "admin"
    this.adminKey = crypto.randomBytes(16).toString('hex');
  next();
});

const User = mongoose.model('User', adminSchema);

module.exports = User;
