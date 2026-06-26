const taskService = require('../services/taskService');
const {
  validateId,
  validateCreateTask,
  validateUpdateTask,
  validateStatusUpdate
} = require('../utils/validation');

/**
 * Health check controller
 */
async function healthCheck(req, res, next) {
  try {
    const isHealthy = await taskService.checkDatabaseHealth();
    if (!isHealthy) {
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        database: 'disconnected',
        message: 'Database connection is not available'
      });
    }
    return res.status(200).json({
      success: true,
      status: 'healthy',
      database: 'connected'
    });
  } catch (error) {
    // Return 503 if database check throws
    console.error('Health check database connection failure:', error.message);
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      message: 'Database connection could not be established'
    });
  }
}

/**
 * Get all tasks (optional status filter)
 */
async function getTasks(req, res, next) {
  try {
    const { status } = req.query;
    
    // If status filter is passed, validate it
    if (status && status !== 'pending' && status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'status', message: "Status filter must be 'pending' or 'completed'" }]
      });
    }

    const tasks = await taskService.getAllTasks(status);
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get task by ID
 */
async function getTaskById(req, res, next) {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'id', message: idValidation.message }]
      });
    }

    const task = await taskService.getTaskById(idValidation.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create task
 */
async function createTask(req, res, next) {
  try {
    const validation = validateCreateTask(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { title, description, priority, due_date, tags } = validation.data;
    const newTask = await taskService.createTask(title, description, priority, due_date, tags);
    
    return res.status(201).json({
      success: true,
      data: newTask
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get recent activity logs
 */
async function getActivityLogs(req, res, next) {
  try {
    const logs = await taskService.getActivityLogs();
    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update task
 */
async function updateTask(req, res, next) {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'id', message: idValidation.message }]
      });
    }

    const validation = validateUpdateTask(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Ensure they provided at least one field to update
    if (Object.keys(validation.data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'body', message: 'At least one field (title, description, status) must be provided for update' }]
      });
    }

    const updatedTask = await taskService.updateTask(idValidation.id, validation.data);
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Change task status (PATCH /tasks/:id/status)
 */
async function changeTaskStatus(req, res, next) {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'id', message: idValidation.message }]
      });
    }

    const validation = validateStatusUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const updatedTask = await taskService.updateTaskStatus(idValidation.id, validation.status);
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete task
 */
async function deleteTask(req, res, next) {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'id', message: idValidation.message }]
      });
    }

    const deleted = await taskService.deleteTask(idValidation.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get statistics
 */
async function getStats(req, res, next) {
  try {
    const stats = await taskService.getTaskStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  healthCheck,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  changeTaskStatus,
  deleteTask,
  getStats,
  getActivityLogs
};
