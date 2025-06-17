const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    noticeID: { type: String },
    content: { type: String },
    noticeDate: { type: String }
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;