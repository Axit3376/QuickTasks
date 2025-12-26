import './activity.css'

function RecentActivity({ tasks }) {
  // Sort tasks by createdAt (most recent first), limit to 5
  const recentTasks = [...tasks]
    .sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0)
      const bTime = b.createdAt?.toDate?.() || new Date(0)
      return bTime - aTime
    })
    .slice(0, 5)

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (recentTasks.length === 0) {
    return (
      <div className="activity-card">
        <h3 className="activity-title">Recent Activity</h3>
        <p className="activity-empty">No tasks yet. Create your first task!</p>
      </div>
    )
  }

  return (
    <div className="activity-card">
      <h3 className="activity-title">Recent Activity</h3>
      <div className="activity-list">
        {recentTasks.map((task) => (
          <div key={task.id} className="activity-item">
            <div className="activity-item-main">
              <span className="activity-task-title">{task.title}</span>
              <span className="activity-time">{formatTime(task.createdAt)}</span>
            </div>
            <div className="activity-item-meta">
              <span className={`activity-badge activity-domain-${task.domain.toLowerCase()}`}>
                {task.domain}
              </span>
              <span className={`activity-badge activity-priority-${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
              <span className={`activity-status activity-status-${task.status.toLowerCase()}`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivity


