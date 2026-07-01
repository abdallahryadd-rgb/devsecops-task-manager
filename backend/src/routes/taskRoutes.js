const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Secure ordering: match the stats endpoint BEFORE the generic ID endpoint
router.get('/stats', taskController.getStats);
router.get('/activity-logs', taskController.getActivityLogs);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/status', taskController.changeTaskStatus);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
