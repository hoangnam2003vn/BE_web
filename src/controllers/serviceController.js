const Service = require('../models/Service');
const factory = require('./baseController');

exports.getAllServices = factory.getAll(Service);
exports.getService = factory.getOne(Service);
exports.createService = factory.create(Service);
exports.updateService = factory.update(Service);
exports.deleteService = factory.delete(Service);
