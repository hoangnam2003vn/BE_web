const Product = require('../models/Product');
const Order = require('../models/Order');
const Role = require('../models/Role');
const Media = require('../models/Media');
const Comment = require('../models/Comment');
const Setting = require('../models/Setting');
const AuditLog = require('../models/AuditLog');
const factory = require('./baseController');

// Product
exports.getAllProducts = factory.getAll(Product, 'category');
exports.getOneProduct = factory.getOne(Product, 'category');
exports.createProduct = factory.create(Product);
exports.updateProduct = factory.update(Product);
exports.deleteProduct = factory.delete(Product);

// Order
exports.getAllOrders = factory.getAll(Order, ['customer', 'products.product']);
exports.getOneOrder = factory.getOne(Order, ['customer', 'products.product']);
exports.createOrder = factory.create(Order);
exports.updateOrder = factory.update(Order);
exports.deleteOrder = factory.delete(Order);

// Role
exports.getAllRoles = factory.getAll(Role);
exports.getOneRole = factory.getOne(Role);
exports.createRole = factory.create(Role);
exports.updateRole = factory.update(Role);
exports.deleteRole = factory.delete(Role);

// Setting
exports.getAllSettings = factory.getAll(Setting);
exports.updateSetting = factory.update(Setting);

// AuditLog
exports.getAllAuditLogs = factory.getAll(AuditLog, 'user');
