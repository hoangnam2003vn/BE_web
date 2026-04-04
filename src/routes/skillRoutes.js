const express = require('express');
const router = express.Router();
const controller = require('../controllers/skillController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', controller.getAllSkills);
router.get('/:id', controller.getSkill);

// Admin only
router.use(auth, authorize('admin'));
router.post('/', controller.createSkill);
router.patch('/:id', controller.updateSkill);
router.delete('/:id', controller.deleteSkill);

module.exports = router;
