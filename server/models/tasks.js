const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskLine: {type: String},
    startDate: { type: String },
    endDate: { type: String },
    createdDate: { type: String },
    managerID:{type: String, unique: false},
    managerKey:{type: String, unique: false},
    taskStatus:{type: String, enum:['true', 'false'], default: 'false'}
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;