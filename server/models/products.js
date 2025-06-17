const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
    name:{type: String},
    cost:{type: String},
    count:{type: String}
});

const Product = mongoose.model('Product', productsSchema);

module.exports = Product;