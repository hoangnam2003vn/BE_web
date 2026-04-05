const Tag = require('../models/Tag');
const factory = require('./baseController');

exports.getAllTags = factory.getAll(Tag);
exports.getTag = factory.getOne(Tag);
exports.createTag = factory.create(Tag);
exports.updateTag = factory.update(Tag);
exports.deleteTag = factory.delete(Tag);
