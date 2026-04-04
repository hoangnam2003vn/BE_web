const Category = require('../models/Category');
const factory = require('./baseController');

exports.getAllCategories = factory.getAll(Category);
exports.getCategory = factory.getOne(Category);
exports.createCategory = factory.create(Category);
exports.updateCategory = factory.update(Category);
exports.deleteCategory = factory.delete(Category);
