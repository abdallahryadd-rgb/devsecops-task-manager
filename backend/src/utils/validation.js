/**
 * Helper to validate integer IDs.
 * PostgreSQL SERIAL IDs are positive non-zero integers.
 */
function validateId(id) {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed) || parsed.toString() !== String(id) || parsed <= 0) {
    return {
      isValid: false,
      message: 'Invalid task ID. ID must be a positive integer.'
    };
  }
  return { isValid: true, id: parsed };
}

/**
 * Validate task creation input.
 */
function validateCreateTask(data) {
  const errors = [];
  let title = data.title;
  let description = data.description;
  let priority = data.priority;
  let due_date = data.due_date;
  let tags = data.tags;

  // Title validation
  if (title === undefined || title === null) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (typeof title !== 'string') {
    errors.push({ field: 'title', message: 'Title must be a string' });
  } else {
    title = title.trim();
    if (title.length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters long' });
    } else if (title.length > 150) {
      errors.push({ field: 'title', message: 'Title must not exceed 150 characters' });
    }
  }

  // Description validation
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else if (description.length > 1000) {
      errors.push({ field: 'description', message: 'Description must not exceed 1000 characters' });
    }
  }

  // Priority validation
  if (priority !== undefined && priority !== null) {
    if (typeof priority !== 'string') {
      errors.push({ field: 'priority', message: 'Priority must be a string' });
    } else {
      priority = priority.trim().toLowerCase();
      if (priority !== 'low' && priority !== 'medium' && priority !== 'high') {
        errors.push({ field: 'priority', message: "Priority must be 'low', 'medium', or 'high'" });
      }
    }
  } else {
    priority = 'medium';
  }

  // Due date validation
  if (due_date !== undefined && due_date !== null && due_date !== '') {
    const timestamp = Date.parse(due_date);
    if (isNaN(timestamp)) {
      errors.push({ field: 'due_date', message: 'Due date must be a valid date' });
    } else {
      due_date = new Date(timestamp).toISOString().split('T')[0];
    }
  } else {
    due_date = null;
  }

  // Tags validation
  if (tags !== undefined && tags !== null) {
    if (!Array.isArray(tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array of strings' });
    } else {
      const cleanTags = [];
      for (let i = 0; i < tags.length; i++) {
        if (typeof tags[i] !== 'string') {
          errors.push({ field: 'tags', message: 'Each tag must be a string' });
          break;
        }
        const cleaned = tags[i].trim().substring(0, 50);
        if (cleaned.length > 0) {
          cleanTags.push(cleaned);
        }
      }
      if (cleanTags.length > 10) {
        errors.push({ field: 'tags', message: 'Cannot have more than 10 tags' });
      }
      tags = cleanTags;
    }
  } else {
    tags = [];
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      title: typeof title === 'string' ? title.trim() : title,
      description: typeof description === 'string' ? description : '',
      priority,
      due_date,
      tags
    }
  };
}

/**
 * Validate task update input.
 */
function validateUpdateTask(data) {
  const errors = [];
  const updatedData = {};

  // Title validation (optional in PUT, but if provided must follow rules)
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push({ field: 'title', message: 'Title must be a string' });
    } else {
      const trimmedTitle = data.title.trim();
      if (trimmedTitle.length < 3) {
        errors.push({ field: 'title', message: 'Title must be at least 3 characters long' });
      } else if (trimmedTitle.length > 150) {
        errors.push({ field: 'title', message: 'Title must not exceed 150 characters' });
      } else {
        updatedData.title = trimmedTitle;
      }
    }
  }

  // Description validation (optional)
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else if (data.description.length > 1000) {
      errors.push({ field: 'description', message: 'Description must not exceed 1000 characters' });
    } else {
      updatedData.description = data.description;
    }
  }

  // Status validation (optional)
  if (data.status !== undefined) {
    if (data.status !== 'pending' && data.status !== 'completed') {
      errors.push({ field: 'status', message: "Status must be either 'pending' or 'completed'" });
    } else {
      updatedData.status = data.status;
    }
  }

  // Priority validation (optional)
  if (data.priority !== undefined) {
    if (typeof data.priority !== 'string') {
      errors.push({ field: 'priority', message: 'Priority must be a string' });
    } else {
      const priorityVal = data.priority.trim().toLowerCase();
      if (priorityVal !== 'low' && priorityVal !== 'medium' && priorityVal !== 'high') {
        errors.push({ field: 'priority', message: "Priority must be 'low', 'medium', or 'high'" });
      } else {
        updatedData.priority = priorityVal;
      }
    }
  }

  // Due date validation (optional)
  if (data.due_date !== undefined) {
    if (data.due_date === null || data.due_date === '') {
      updatedData.due_date = null;
    } else {
      const timestamp = Date.parse(data.due_date);
      if (isNaN(timestamp)) {
        errors.push({ field: 'due_date', message: 'Due date must be a valid date' });
      } else {
        updatedData.due_date = new Date(timestamp).toISOString().split('T')[0];
      }
    }
  }

  // Tags validation (optional)
  if (data.tags !== undefined) {
    if (data.tags === null) {
      updatedData.tags = [];
    } else if (!Array.isArray(data.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array of strings' });
    } else {
      const cleanTags = [];
      for (let i = 0; i < data.tags.length; i++) {
        if (typeof data.tags[i] !== 'string') {
          errors.push({ field: 'tags', message: 'Each tag must be a string' });
          break;
        }
        const cleaned = data.tags[i].trim().substring(0, 50);
        if (cleaned.length > 0) {
          cleanTags.push(cleaned);
        }
      }
      if (cleanTags.length > 10) {
        errors.push({ field: 'tags', message: 'Cannot have more than 10 tags' });
      } else {
        updatedData.tags = cleanTags;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: updatedData
  };
}

/**
 * Validate status update input.
 */
function validateStatusUpdate(data) {
  const errors = [];

  if (data.status === undefined || data.status === null) {
    errors.push({ field: 'status', message: 'Status is required' });
  } else if (data.status !== 'pending' && data.status !== 'completed') {
    errors.push({ field: 'status', message: "Status must be either 'pending' or 'completed'" });
  }

  return {
    isValid: errors.length === 0,
    errors,
    status: data.status
  };
}

module.exports = {
  validateId,
  validateCreateTask,
  validateUpdateTask,
  validateStatusUpdate
};
