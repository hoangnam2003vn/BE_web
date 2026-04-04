const Customer = require('../models/Customer');
const factory = require('./baseController');

exports.getAllCustomers = factory.getAll(Customer);
exports.getCustomer = factory.getOne(Customer);
exports.createCustomer = factory.create(Customer);
exports.updateCustomer = factory.update(Customer);
exports.deleteCustomer = factory.delete(Customer);
