import { 
  Plus, 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp
} from 'lucide-react';

function OverviewPage({ 
  stats, 
  tasks, 
  onOpenCreateModal, 
  onViewTasks 
}) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Calculate Tasks created in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const tasksCreatedLast7Days = tasks.filter(t => new Date(t.created_at) >= sevenDaysAgo).length;

  // SVG Chart Dimensions & Computations
  const maxVal = Math.max(stats.total, stats.completed, stats.pending, 5);
  const chartHeight = 150;
  
  const totalBarHeight = (stats.total / maxVal) * chartHeight;
  const completedBarHeight = (stats.completed / maxVal) * chartHeight;
  const pendingBarHeight = (stats.pending / maxVal) * chartHeight;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <section className="glass-panel welcome-banner">
        <div className="welcome-info">
          <h1>Welcome Back, DevOps Engineer</h1>
          <p>Deploy pipeline monitoring status: all checks passed. Keep task metrics aligned.</p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={onOpenCreateModal} style={{ backgroundColor: 'white', color: 'var(--primary)' }}>
            <Plus size={16} />
            Create Task
          </button>
          <button className="btn btn-secondary" onClick={onViewTasks} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <CheckSquare size={16} />
            View Tasks Board
          </button>
        </div>
      </section>

      {/* Statistics Cards Grid */}
      <section className="stats-grid">
        {/* Total Tasks */}
        <div className="glass-panel stat-card total">
          <div className="stat-card-icon-box">
            <FileText size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Tasks</span>
            <span className="stat-desc">Security log entries</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="glass-panel stat-card pending">
          <div className="stat-card-icon-box">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
            <span className="stat-desc">Active items</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="glass-panel stat-card completed">
          <div className="stat-card-icon-box">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
            <span className="stat-desc">Successfully closed</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="glass-panel stat-card rate">
          <div className="stat-card-icon-box">
            <TrendingUp size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{completionRate}%</span>
            <span className="stat-label">Success Rate</span>
            <span className="stat-desc">Completion efficiency</span>
          </div>
        </div>
      </section>

      {/* Dashboard Analytics Grid */}
      <section className="dashboard-details-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* Custom SVG Graph Card */}
        <div className="glass-panel">
          <div className="chart-card-header">
            <h3 className="chart-title">Tasks Analytics (Real Data)</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created past 7 days: {tasksCreatedLast7Days}</div>
          </div>
          
          {/* SVG Visual Bars */}
          <div className="custom-chart-container">
            <div className="chart-bar-column">
              <div className="chart-bar-fill primary" style={{ height: `${totalBarHeight}px` }}>
                <div className="chart-bar-tooltip">Total: {stats.total}</div>
              </div>
              <span className="chart-label">Total Tasks</span>
            </div>

            <div className="chart-bar-column">
              <div className="chart-bar-fill success" style={{ height: `${completedBarHeight}px` }}>
                <div className="chart-bar-tooltip">Completed: {stats.completed}</div>
              </div>
              <span className="chart-label">Completed</span>
            </div>

            <div className="chart-bar-column">
              <div className="chart-bar-fill pending" style={{ height: `${pendingBarHeight}px` }}>
                <div className="chart-bar-tooltip">Pending: {stats.pending}</div>
              </div>
              <span className="chart-label">Pending</span>
            </div>
          </div>

          {/* Sub legends */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.25rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', backgroundColor: 'var(--primary)' }} />
              <span>Total Tasks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', backgroundColor: 'var(--success)' }} />
              <span>Completed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', backgroundColor: 'var(--pending)' }} />
              <span>Pending</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OverviewPage;
