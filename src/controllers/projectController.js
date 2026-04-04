const Project = require('../models/Project');
const factory = require('./baseController');

exports.getAllProjects = factory.getAll(Project, ['category', 'tags']);
exports.getProject = factory.getOne(Project, ['category', 'tags']);
exports.createProject = factory.create(Project);
exports.updateProject = factory.update(Project);
exports.deleteProject = factory.delete(Project);
