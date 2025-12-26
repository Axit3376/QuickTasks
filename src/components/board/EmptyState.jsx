import './empty-state.css'

function EmptyState({ groupBy }) {
  const getMessage = () => {
    if (groupBy === 'status') {
      return 'No tasks found. Create your first task above!'
    } else if (groupBy === 'priority') {
      return 'No tasks match the current filters. Try adjusting your filters or create a new task.'
    } else if (groupBy === 'domain') {
      return 'No tasks found. Add tasks with different domains to see them grouped here.'
    }
    return 'No tasks found. Create your first task above!'
  }

  const getTips = () => {
    return [
      'Use the quick add form above to create tasks',
      'Organize tasks by domain (Tech/Admin)',
      'Set priorities (Low/Mid/High) to focus on what matters',
      'Toggle task status to mark them as Done',
    ]
  }

  return (
    <div className="empty-state">
      <div className="empty-state-icon">📋</div>
      <h3 className="empty-state-title">No Tasks Yet</h3>
      <p className="empty-state-message">{getMessage()}</p>
      <div className="empty-state-tips">
        <p className="empty-state-tips-title">Quick Tips:</p>
        <ul className="empty-state-tips-list">
          {getTips().map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default EmptyState


