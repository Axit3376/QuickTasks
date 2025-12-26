import TaskDetails from './TaskDetails'

function TaskCard({
  task,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  bulkMode = false,
  isSelected = false,
  onToggleSelection,
  tags = [],
}) {
  return (
    <article className={`task-card ${bulkMode ? 'task-card-bulk' : ''} ${isSelected ? 'task-card-selected' : ''}`}>
      {bulkMode && (
        <div className="task-checkbox-container">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection && onToggleSelection(task.id)}
          />
        </div>
      )}
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-header-right">
          <span className={`task-pill task-pill-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
          {!bulkMode && (
            <div className="task-actions">
              <button
                className="task-action-btn task-action-edit"
                type="button"
                onClick={() => onEditTask && onEditTask(task)}
                title="Edit task"
              >
                ✏️
              </button>
              <button
                className="task-action-btn task-action-delete"
                type="button"
                onClick={() => onDeleteTask && onDeleteTask(task)}
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
      <TaskDetails
        task={task}
        onToggleStatus={onToggleStatus}
        tags={tags}
      />
    </article>
  )
}

export default TaskCard



