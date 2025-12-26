import { useState, useEffect } from 'react'
import './edit-modal.css'

function EditTaskModal({ task, domains, priorities, onClose, onSave }) {
  const getInitialDueDate = () => {
    if (!task.dueDate) return ''
    try {
      if (task.dueDate.toDate) {
        return task.dueDate.toDate().toISOString().split('T')[0]
      }
      return new Date(task.dueDate).toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const [title, setTitle] = useState(task.title || '')
  const [description, setDescription] = useState(task.description || '')
  const [domain, setDomain] = useState(task.domain || domains[0])
  const [priority, setPriority] = useState(task.priority || priorities[1])
  const [dueDate, setDueDate] = useState(getInitialDueDate())
  const [selectedTags, setSelectedTags] = useState(task.tags || [])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const initialDueDate = getInitialDueDate()
    setDueDate(initialDueDate)
    setTitle(task.title || '')
    setDescription(task.description || '')
    setDomain(task.domain || domains[0])
    setPriority(task.priority || priorities[1])
    setSelectedTags(task.tags || [])
  }, [task.id, task.dueDate, domains, priorities])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim(),
        domain,
        priority,
        dueDate: dueDate || null,
        tags: selectedTags,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Task</h2>
          <button className="modal-close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            Title *
            <input
              className="modal-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="modal-label">
            Description
            <textarea
              className="modal-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </label>
          <div className="modal-row">
            <label className="modal-label">
              Domain
              <select className="modal-select" value={domain} onChange={(e) => setDomain(e.target.value)}>
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="modal-label">
              Priority
              <select className="modal-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="modal-label">
              Due Date
              <input
                className="modal-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
          </div>
          <div className="modal-row modal-row-full">
            <label className="modal-label">Tags</label>
            <div className="modal-tags-selector">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  className={`modal-tag-btn ${selectedTags.includes(tag.id) ? 'modal-tag-selected' : ''}`}
                  type="button"
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color + '20' : 'transparent',
                    borderColor: tag.color + '40',
                    color: tag.color,
                  }}
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                    )
                  }}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <span className="modal-tags-empty">No tags available</span>
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button className="modal-button modal-button-cancel" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="modal-button modal-button-save" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskModal

