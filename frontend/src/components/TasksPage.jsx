import { useState } from 'react';
import { 
  List, 
  Kanban, 
  Search, 
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Calendar,
  Tag
} from 'lucide-react';

function TasksPage({ 
  tasks, 
  isLoading, 
  searchTerm, 
  setSearchTerm,
  onStatusChange, 
  onDelete, 
  onEditTask,
  onOpenCreateModal 
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all', 'low', 'medium', 'high'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title', 'priority', 'due_date'

  // Confirm delete states tracked per task ID
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('newest');
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // 1. Filtering
  let filteredTasks = tasks.filter(task => {
    // Search term check
    const matchesSearch = searchTerm ? (
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : true;

    // Status filter
    const matchesStatus = statusFilter === 'all' ? true : task.status === statusFilter;

    // Priority filter
    const matchesPriority = priorityFilter === 'all' ? true : task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 2. Sorting
  filteredTasks.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'priority') {
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      return weightB - weightA; // High priority first
    }
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    }
    return 0;
  });

  // Split tasks for Kanban Columns
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const handleDeleteTrigger = (e, id) => {
    e.stopPropagation();
    setDeletingTaskId(id);
  };

  const handleDeleteConfirm = async (e, id) => {
    e.stopPropagation();
    await onDelete(id);
    setDeletingTaskId(null);
  };

  const handleToggleStatus = (e, id, currentStatus) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    onStatusChange(id, nextStatus);
  };

  const handleEditTrigger = (e, task) => {
    e.stopPropagation();
    onEditTask(task);
  };

  const renderCard = (task) => {
    const isConfirmingDelete = deletingTaskId === task.id;

    if (isConfirmingDelete) {
      return (
        <div key={task.id} className="task-item-card delete-confirm-panel animate-scale-up" style={{ borderColor: 'var(--error)' }}>
          <div className="delete-confirm-title">Are you sure you want to delete this task?</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>"{task.title}"</p>
          <div className="delete-confirm-buttons">
            <button 
              className="btn btn-danger btn-sm"
              onClick={(e) => handleDeleteConfirm(e, task.id)}
            >
              Yes, Delete
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={(e) => { e.stopPropagation(); setDeletingTaskId(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div 
        key={task.id} 
        className={`task-item-card priority-${task.priority || 'medium'} status-${task.status}`}
        onClick={() => onEditTask(task)}
      >
        <div className="task-card-header">
          <h3 className="task-card-title">{task.title}</h3>
          <div className="task-card-badges">
            <span className={`task-badge-pill priority-${task.priority || 'medium'}`}>
              {task.priority || 'medium'}
            </span>
            <span className={`task-badge-pill status-${task.status}`}>
              {task.status}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}

        {task.tags && Array.isArray(task.tags) && task.tags.length > 0 && (
          <div className="task-card-tags-list">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="task-card-tag">
                <Tag size={10} style={{ marginRight: '2px', display: 'inline-block', verticalAlign: 'middle' }} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="task-card-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span>Created: {formatDate(task.created_at)}</span>
            {task.due_date && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-main)', fontWeight: 550 }}>
                <Calendar size={12} /> Due: {formatDate(task.due_date)}
              </span>
            )}
          </div>
          
          <div className="task-card-actions">
            <button 
              className="task-card-action-btn complete"
              title={task.status === 'completed' ? 'Reopen task' : 'Complete task'}
              onClick={(e) => handleToggleStatus(e, task.id, task.status)}
            >
              {task.status === 'completed' ? <Clock size={16} /> : <CheckCircle size={16} />}
            </button>
            <button 
              className="task-card-action-btn edit"
              title="Edit details"
              onClick={(e) => handleEditTrigger(e, task)}
            >
              <Edit2 size={15} />
            </button>
            <button 
              className="task-card-action-btn delete"
              title="Delete task"
              onClick={(e) => handleDeleteTrigger(e, task.id)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search & Filters Controls Bar */}
      <section className="glass-panel tasks-control-bar">
        <div className="tasks-filter-group">
          {/* Status select filter */}
          <select 
            className="tasks-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority select filter */}
          <select 
            className="tasks-select-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          {/* Sorting filter */}
          <select 
            className="tasks-select-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Alphabetical (A-Z)</option>
            <option value="priority">Priority Order</option>
            <option value="due_date">Due Date</option>
          </select>

          {/* Reset button */}
          {(statusFilter !== 'all' || priorityFilter !== 'all' || sortBy !== 'newest' || searchTerm) && (
            <button 
              className="btn btn-secondary" 
              onClick={resetFilters}
              style={{ padding: '0.45rem 0.85rem' }}
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>
          )}
        </div>

        {/* View mode buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {filteredTasks.length} Results
          </span>

          <div className="view-mode-toggle">
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
              List
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <Kanban size={16} />
              Kanban
            </button>
          </div>
        </div>
      </section>

      {/* Main View Area */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-panel empty-state-card">
          <div className="empty-state-icon-box">
            <Search size={32} />
          </div>
          <h4 className="empty-state-title">No tasks found</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Try modifying your keywords or filters, or add a new task.
          </p>
          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <Plus size={16} /> Add Task
          </button>
        </div>
      ) : viewMode === 'list' ? (
        // List Layout
        <div className="tasks-list-layout">
          {filteredTasks.map(task => renderCard(task))}
        </div>
      ) : (
        // Kanban Layout (2 columns: Pending and Completed)
        <div className="tasks-kanban-layout">
          {/* Pending Column */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span className="kanban-column-title" style={{ color: 'var(--pending)' }}>
                <Clock size={16} /> Pending Items
              </span>
              <span className="kanban-column-badge">{pendingTasks.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingTasks.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No pending tasks.
                </div>
              ) : (
                pendingTasks.map(task => renderCard(task))
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="kanban-column" style={{ gridColumn: 'span 2' }}>
            <div className="kanban-column-header">
              <span className="kanban-column-title" style={{ color: 'var(--success)' }}>
                <CheckCircle size={16} /> Completed & Verified
              </span>
              <span className="kanban-column-badge">{completedTasks.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {completedTasks.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', gridColumn: 'span 2' }}>
                  No completed tasks.
                </div>
              ) : (
                completedTasks.map(task => renderCard(task))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;
