import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import OverviewPage from './components/OverviewPage';
import TasksPage from './components/TasksPage';
import TaskModal from './components/TaskModal';
import ToastContainer from './components/Toast';
import taskApi from './services/taskApi';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'light';
  });

  // Core Data states
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  // UI state controls
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Toast notifier
  const addToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);


  // Fetch Stats counts
  const loadStats = useCallback(async () => {
    try {
      const response = await taskApi.getTaskStats();
      if (response && response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err.message);
    }
  }, []);

  // Fetch Tasks
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await taskApi.getTasks();
      if (response && response.success) {
        setTasks(response.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Could not fetch task records from API', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);


  // Master refresh trigger
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      loadStats(),
      loadTasks()
    ]);
  }, [loadStats, loadTasks]);

  // 1. Initial configuration: theme loading & data pulling
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAllData();
  }, [theme, refreshAllData]);

  // Theme Toggler
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    addToast(`Switched to ${nextTheme} theme`, 'info');
  };

  // CRUD callbacks
  const handleCreateTaskSubmit = async (taskPayload) => {
    try {
      const response = await taskApi.createTask(taskPayload);
      if (response && response.success) {
        addToast('Security task created successfully!', 'success');
        refreshAllData();
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error occurred while creating task';
      addToast(msg, 'error');
      throw err;
    }
  };

  const handleUpdateTaskSubmit = async (taskPayload) => {
    if (!editingTask) return false;
    try {
      const response = await taskApi.updateTask(editingTask.id, taskPayload);
      if (response && response.success) {
        addToast('Task details modified successfully!', 'success');
        refreshAllData();
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error occurred while updating task';
      addToast(msg, 'error');
      throw err;
    }
  };

  const handleStatusToggle = async (id, statusValue) => {
    try {
      const response = await taskApi.updateTaskStatus(id, statusValue);
      if (response && response.success) {
        addToast(`Task marked as ${statusValue}!`, 'success');
        refreshAllData();
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error toggling task status';
      addToast(msg, 'error');
      return false;
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await taskApi.deleteTask(id);
      if (response && response.success) {
        addToast('Task log removed from server', 'success');
        refreshAllData();
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error deleting task';
      addToast(msg, 'error');
      return false;
    }
  };

  // Tabbed components selector
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            stats={stats}
            tasks={tasks}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onViewTasks={() => setActiveTab('tasks')}
          />
        );
      case 'tasks':
        return (
          <TasksPage
            tasks={tasks}
            isLoading={isLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onStatusChange={handleStatusToggle}
            onDelete={handleDeleteTask}
            onEditTask={setEditingTask}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        );
      default:
        return (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Select an action from the navigation sidebar.
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Workspace Frame */}
      <div className="app-content">
        <Navbar
          activeTab={activeTab}
          theme={theme}
          toggleTheme={toggleTheme}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="view-workspace">
          {renderTabContent()}
        </main>
      </div>

      {/* Task Creation Modal */}
      {isCreateModalOpen && (
        <TaskModal
          key="new-task"
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateTaskSubmit}
        />
      )}

      {/* Task Editing Modal */}
      {editingTask && (
        <TaskModal
          key={`edit-${editingTask.id}`}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTaskSubmit}
        />
      )}

      {/* Toast Alert Popups */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;
