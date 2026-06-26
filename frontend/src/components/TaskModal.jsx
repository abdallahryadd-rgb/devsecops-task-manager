import { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

function TaskModal({ task, onClose, onSave }) {
  const isEditMode = !!task;
  const [title, setTitle] = useState(task ? (task.title || '') : '');
  const [description, setDescription] = useState(task ? (task.description || '') : '');
  const [status, setStatus] = useState(task ? (task.status || 'pending') : 'pending');
  const [priority, setPriority] = useState(task ? (task.priority || 'medium') : 'medium');
  const [dueDate, setDueDate] = useState(() => {
    if (task && task.due_date) {
      const d = new Date(task.due_date);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
    return '';
  });
  const [tagsInput, setTagsInput] = useState(task && task.tags ? task.tags.join(', ') : '');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef(null);

  // Focus title field on load
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Bind Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setValidationError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Task Title is required.');
      return;
    }
    if (trimmedTitle.length < 3) {
      setValidationError('Title must be at least 3 characters long.');
      return;
    }
    if (trimmedTitle.length > 150) {
      setValidationError('Title must not exceed 150 characters.');
      return;
    }
    if (description.length > 1000) {
      setValidationError('Description must not exceed 1000 characters.');
      return;
    }

    // Convert comma-separated tags into clean array
    const tagsArray = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      priority,
      due_date: dueDate || null,
      tags: tagsArray
    };

    if (isEditMode) {
      payload.status = status;
    }

    setIsSubmitting(true);
    try {
      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save task';
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-modal" onClick={e => e.stopPropagation()}>
        <div className="dialog-modal-header">
          <h3 className="dialog-modal-title">
            <Check size={18} style={{ color: 'var(--primary)' }} />
            {isEditMode ? 'Modify Task Details' : 'Create New Security Task'}
          </h3>
          <button className="dialog-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-modal-body">
            {/* Title field */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-title-input">
                Task Title <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                id="modal-title-input"
                type="text"
                className="form-control-input"
                placeholder="e.g. Conduct container scans"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isSubmitting}
                ref={titleInputRef}
                maxLength={151}
              />
              <div className="form-char-counter">{title.length} / 150</div>
            </div>

            {/* Description field */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-desc-input">Description</label>
              <textarea
                id="modal-desc-input"
                className="form-control-input"
                style={{ minHeight: 90, resize: 'vertical' }}
                placeholder="Provide task parameters, environment, or requirements..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={isSubmitting}
                maxLength={1001}
              />
              <div className="form-char-counter">{description.length} / 1000</div>
            </div>

            <div className="form-grid">
              {/* Priority Select */}
              <div className="form-group">
                <label className="form-label" htmlFor="modal-priority-select">Priority</label>
                <select
                  id="modal-priority-select"
                  className="form-control-input"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due date input */}
              <div className="form-group">
                <label className="form-label" htmlFor="modal-due-date">Due Date</label>
                <input
                  id="modal-due-date"
                  type="date"
                  className="form-control-input"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Tags comma-separated input */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-tags-input">Tags (comma-separated)</label>
              <input
                id="modal-tags-input"
                type="text"
                className="form-control-input"
                placeholder="e.g. SAST, pipeline, dependencies"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Status (Edit mode only) */}
            {isEditMode && (
              <div className="form-group">
                <label className="form-label" htmlFor="modal-status-select">Status</label>
                <select
                  id="modal-status-select"
                  className="form-control-input"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            {/* Validation Banner */}
            {validationError && (
              <div className="form-validation-banner">
                <span>⚠️</span> {validationError}
              </div>
            )}
          </div>

          <div className="dialog-modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
