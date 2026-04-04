const Skill = require('../models/Skill');
const factory = require('./baseController');

exports.getAllSkills = factory.getAll(Skill);
exports.getSkill = factory.getOne(Skill);
exports.createSkill = factory.create(Skill);
exports.updateSkill = factory.update(Skill);
exports.deleteSkill = factory.delete(Skill);
