function TaskDetails({ task, onToggleStatus, tags = [] }) {
  const getDueDateInfo = () => {
    if (!task.dueDate) return null
    try {
      const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate)
      if (isNaN(dueDate.getTime())) return null
      const now = new Date()
      const diffTime = dueDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return {
        date: dueDate,
        daysLeft: diffDays,
        isOverdue: diffDays < 0,
        isDueSoon: diffDays >= 0 && diffDays <= 1,
      }
    } catch {
      return null
    }
  }

  const dueDateInfo = getDueDateInfo()
  const taskTags = tags.filter((tag) => (task.tags || []).includes(tag.id))

  return (
    <div className="task-details">
      {task.description && <p className="task-desc">{task.description}</p>}
      {dueDateInfo && (
        <div className={`task-due-date ${dueDateInfo.isOverdue ? 'task-due-overdue' : dueDateInfo.isDueSoon ? 'task-due-soon' : ''}`}>
          📅 Due: {dueDateInfo.date.toLocaleDateString()}
          {dueDateInfo.isOverdue && <span className="task-due-badge">Overdue</span>}
          {dueDateInfo.isDueSoon && !dueDateInfo.isOverdue && (
            <span className="task-due-badge">Due Soon</span>
          )}
        </div>
      )}
      {taskTags.length > 0 && (
        <div className="task-tags">
          {taskTags.map((tag) => (
            <span
              key={tag.id}
              className="task-tag"
              style={{
                backgroundColor: tag.color + '20',
                borderColor: tag.color + '40',
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <div className="task-meta">
        <span className="task-meta-badge">{task.domain}</span>
        <button
          type="button"
          className={`task-meta-status task-meta-status-${task.status.toLowerCase()}`}
          onClick={() => onToggleStatus && onToggleStatus(task)}
        >
          {task.status}
        </button>
      </div>
    </div>
  )
}

export default TaskDetails



