const Blog = require('../models/Blog');
const factory = require('./baseController');

exports.getAllBlogs = factory.getAll(Blog, 'author');
exports.getBlog = factory.getOne(Blog, 'author');
exports.createBlog = factory.create(Blog);
exports.updateBlog = factory.update(Blog);
exports.deleteBlog = factory.delete(Blog);
