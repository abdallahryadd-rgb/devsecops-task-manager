import { 
  Sun, 
  Moon, 
  Search, 
  Plus, 
  Menu 
} from 'lucide-react';

function Navbar({ 
  activeTab, 
  theme, 
  toggleTheme, 
  searchTerm, 
  setSearchTerm, 
  onOpenCreateModal, 
  isMobileOpen, 
  setIsMobileOpen 
}) {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Overview Dashboard';
      case 'tasks':
        return 'Tasks Management';
      default:
        return 'Task Manager';
    }
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button 
          className="navbar-toggle-sidebar"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <Menu size={22} />
        </button>
        <h2 className="navbar-page-title">{getPageTitle()}</h2>
      </div>

      <div className="navbar-right">
        {/* Search input available on Overview & Tasks tab */}
        {(activeTab === 'overview' || activeTab === 'tasks') && (
          <div className="navbar-search-wrapper">
            <Search className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="navbar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Task quick creation button */}
        <button 
          className="btn btn-primary" 
          onClick={onOpenCreateModal}
          style={{ padding: '0.45rem 1rem', borderRadius: '20px' }}
        >
          <Plus size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>New Task</span>
        </button>

        {/* Light / Dark Mode Toggle */}
        <button 
          className="navbar-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>


        {/* User profile widget */}
        <div className="navbar-profile-menu">
          <div className="profile-avatar">SA</div>
          <span className="profile-name" style={{ display: 'inline-block' }}>Student Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
