import TaskCard from './TaskCard'

function Column({
  title,
  tasks,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  bulkMode = false,
  selectedTasks = new Set(),
  onToggleSelection,
  tags = [],
}) {
  return (
    <div className="board-column">
      <div className="board-column-header">
        <span className="board-column-title">{title}</span>
        <span className="board-column-count">{tasks.length}</span>
      </div>
      <div className="board-column-body">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleStatus={onToggleStatus}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            bulkMode={bulkMode}
            isSelected={selectedTasks.has(task.id)}
            onToggleSelection={onToggleSelection}
            tags={tags}
          />
        ))}
        {tasks.length === 0 && (
          <div className="board-column-empty">No tasks in this column.</div>
        )}
      </div>
    </div>
  )
}

export default Column



