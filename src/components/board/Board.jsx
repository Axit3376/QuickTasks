import Column from './Column'
import EmptyState from './EmptyState'
import './board.css'

const STATUS_COLUMNS = ['Pending', 'Done']
const PRIORITY_COLUMNS = ['High', 'Mid', 'Low']

function Board({
  tasks,
  groupBy = 'status',
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  bulkMode = false,
  selectedTasks = new Set(),
  onToggleSelection,
  tags = [],
}) {
  let columnKeys = []

  if (groupBy === 'status') {
    columnKeys = STATUS_COLUMNS
  } else if (groupBy === 'priority') {
    columnKeys = PRIORITY_COLUMNS
  } else if (groupBy === 'domain') {
    const domains = Array.from(new Set(tasks.map((t) => t.domain))).sort()
    columnKeys = domains
  }

  if (tasks.length === 0) {
    return (
      <section className="board board-empty">
        <EmptyState groupBy={groupBy} />
      </section>
    )
  }

  return (
    <section className="board">
      {columnKeys.map((key) => (
        <Column
          key={key}
          title={key}
          tasks={tasks.filter((t) => {
            if (groupBy === 'status') return t.status === key
            if (groupBy === 'priority') return t.priority === key
            if (groupBy === 'domain') return t.domain === key
            return false
          })}
          onToggleStatus={onToggleStatus}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          bulkMode={bulkMode}
          selectedTasks={selectedTasks}
          onToggleSelection={onToggleSelection}
          tags={tags}
        />
      ))}
    </section>
  )
}

export default Board



