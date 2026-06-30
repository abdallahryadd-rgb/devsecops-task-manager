const db = require('../config/database');

/**
 * Check if the database connection is healthy
 */
async function checkDatabaseHealth() {
  const result = await db.query('SELECT 1');
  return result && result.rowCount > 0;
}

/**
 * Retrieve all tasks, optionally filtered by status, ordered from newest to oldest
 */
async function getAllTasks(status) {
  let queryText = 'SELECT * FROM tasks';
  const params = [];

  if (status === 'pending' || status === 'completed') {
    queryText += ' WHERE status = $1';
    params.push(status);
  }

  queryText += ' ORDER BY created_at DESC, id DESC';

  const result = await db.query(queryText, params);
  return result.rows;
}

/**
 * Retrieve a specific task by its ID
 */
async function getTaskById(id) {
  const queryText = 'SELECT * FROM tasks WHERE id = $1';
  const result = await db.query(queryText, [id]);
  return result.rows[0] || null;
}

/**
 * Log activity helper
 */
async function logActivity(action, taskId, taskTitle) {
  try {
    const queryText = `
      INSERT INTO activity_logs (action, task_id, task_title)
      VALUES ($1, $2, $3)
    `;
    await db.query(queryText, [action, taskId, taskTitle]);
  } catch (err) {
    console.error('Failed to write activity audit log:', err.message);
  }
}

/**
 * Create a new task in the database
 */
async function createTask(title, description, priority = 'medium', due_date = null, tags = []) {
  const queryText = `
    INSERT INTO tasks (title, description, status, priority, due_date, tags, created_at, updated_at)
    VALUES ($1, $2, 'pending', $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  const result = await db.query(queryText, [title, description, priority, due_date, tags]);
  const newTask = result.rows[0];
  if (newTask) {
    await logActivity('task_created', newTask.id, newTask.title);
  }
  return newTask;
}

/**
 * Update task fields dynamically using parameterized queries
 */
async function updateTask(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return getTaskById(id);
  }

  // Construct SET clauses using only safe dynamic parameter indexing
  const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
  
  // Append standard update to updated_at
  const queryText = `
    UPDATE tasks 
    SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $${keys.length + 1} 
    RETURNING *
  `;

  const values = [...keys.map(key => fields[key]), id];
  const result = await db.query(queryText, values);
  const updatedTask = result.rows[0];
  if (updatedTask) {
    await logActivity('task_updated', updatedTask.id, updatedTask.title);
  }
  return updatedTask;
}

/**
 * Update status for a specific task
 */
async function updateTaskStatus(id, status) {
  const queryText = `
    UPDATE tasks 
    SET status = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2 
    RETURNING *
  `;
  const result = await db.query(queryText, [status, id]);
  const updatedTask = result.rows[0];
  if (updatedTask) {
    const action = status === 'completed' ? 'task_completed' : 'task_reopened';
    await logActivity(action, updatedTask.id, updatedTask.title);
  }
  return updatedTask;
}

/**
 * Delete a task by ID
 */
async function deleteTask(id) {
  const queryText = 'DELETE FROM tasks WHERE id = $1 RETURNING id, title';
  const result = await db.query(queryText, [id]);
  const deleted = result.rowCount > 0;
  if (deleted) {
    const deletedTask = result.rows[0];
    await logActivity('task_deleted', id, deletedTask?.title || 'Unknown Task');
  }
  return deleted;
}

/**
 * Calculate task statistics
 */
async function getTaskStats() {
  const queryText = `
    SELECT 
      COUNT(*)::int AS total,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0)::int AS pending,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0)::int AS completed
    FROM tasks
  `;
  const result = await db.query(queryText);
  return result.rows[0] || { total: 0, pending: 0, completed: 0 };
}

/**
 * Retrieve activity logs
 */
async function getActivityLogs(limit = 50) {
  const queryText = 'SELECT * FROM activity_logs ORDER BY created_at DESC, id DESC LIMIT $1';
  const result = await db.query(queryText, [limit]);
  return result.rows;
}

module.exports = {
  checkDatabaseHealth,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  getActivityLogs
};
