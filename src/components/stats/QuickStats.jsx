import './stats.css'

function QuickStats({ tasks }) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'Done').length
  const pending = total - done
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

  // Domain breakdown
  const domainBreakdown = tasks.reduce((acc, task) => {
    acc[task.domain] = (acc[task.domain] || 0) + 1
    return acc
  }, {})

  // Priority breakdown
  const priorityBreakdown = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1
    return acc
  }, {})

  if (total === 0) {
    return (
      <div className="stats-card">
        <h3 className="stats-title">Quick Stats</h3>
        <p className="stats-empty">No data yet</p>
      </div>
    )
  }

  return (
    <div className="stats-card">
      <h3 className="stats-title">Quick Stats</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Completion Rate</span>
          <span className="stat-value-large">{completionRate}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">By Domain</span>
          <div className="stat-breakdown">
            {Object.entries(domainBreakdown).map(([domain, count]) => (
              <span key={domain} className="stat-breakdown-item">
                {domain}: {count}
              </span>
            ))}
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-label">By Priority</span>
          <div className="stat-breakdown">
            {Object.entries(priorityBreakdown).map(([priority, count]) => (
              <span key={priority} className={`stat-breakdown-item stat-priority-${priority.toLowerCase()}`}>
                {priority}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickStats

