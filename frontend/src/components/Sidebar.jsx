import { 
  Shield, 
  LayoutDashboard, 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen,
  setIsMobileOpen
}) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  ];

  const handleItemClick = (id) => {
    setActiveTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <Shield className="sidebar-item-icon" style={{ color: 'var(--primary)', width: 28, height: 28 }} />
        {!isCollapsed && (
          <div className="sidebar-brand-name">
            <span>Task Manager</span>
            <span className="sidebar-brand-sub">Task Platform</span>
          </div>
        )}
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }}
                title={item.label}
              >
                <Icon className="sidebar-item-icon" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end' }}>
        {/* Collapse Button */}
        <button 
          className="sidebar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
