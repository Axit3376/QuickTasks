import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import Navbar from '../components/navbar/Navbar'
import LeftPanel from '../components/left-panel/LeftPanel'
import DashboardStrip from '../components/dashboard/DashboardStrip'
import Board from '../components/board/Board'
import RecentActivity from '../components/activity/RecentActivity'
import QuickStats from '../components/stats/QuickStats'
import EditTaskModal from '../components/board/EditTaskModal'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import DomainManager from '../components/settings/DomainManager'
import TagManager from '../components/settings/TagManager'
import { db } from '../firebase/firebase'
import { useAuth } from '../context/AuthContext'
import './main.css'

// Default domains and priorities
const DEFAULT_DOMAINS = ['Work', 'Admin']
const PRIORITIES = ['Low', 'Mid', 'High']

function MainPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [domains, setDomains] = useState([])
  const [tags, setTags] = useState([])
  const [newDomain, setNewDomain] = useState('')
  const [newPriority, setNewPriority] = useState(PRIORITIES[1])
  const [newDueDate, setNewDueDate] = useState('')
  const [newTags, setNewTags] = useState([])
  const [error, setError] = useState('')
  const [groupBy, setGroupBy] = useState('status') // 'status' | 'domain' | 'priority'
  const [filterDomain, setFilterDomain] = useState(null)
  const [filterPriority, setFilterPriority] = useState(null)
  const [filterTags, setFilterTags] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [showDomainManager, setShowDomainManager] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)

  // Subscribe to this user's tasks
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'tasks'), where('uid', '==', user.uid))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setTasks(next)
        setLoading(false)
      },
      () => {
        setError('Failed to load tasks')
        setLoading(false)
      },
    )
    return unsub
  }, [user])

  // Load custom domains
  useEffect(() => {
    if (!user) return
    const defaultDomains = DEFAULT_DOMAINS.map((name) => ({ name, isDefault: true }))
    const q = query(collection(db, 'userDomains'), where('uid', '==', user.uid))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const customDomains = snap.docs.map((d) => ({ id: d.id, name: d.data().name }))
        setDomains([...defaultDomains, ...customDomains])
        if (!newDomain && defaultDomains.length > 0) {
          setNewDomain(defaultDomains[0].name)
        }
      },
      (err) => {
        console.error('Error loading domains:', err)
        setDomains(defaultDomains)
        if (defaultDomains.length > 0) {
          setNewDomain(defaultDomains[0].name)
        }
      },
    )
    return unsub
  }, [user])

  // Load tags
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'userTags'), where('uid', '==', user.uid))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const userTags = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setTags(userTags)
      },
      (err) => {
        console.error('Error loading tags:', err)
      },
    )
    return unsub
  }, [user])

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!user || !newTitle.trim()) return
    setAdding(true)
    setError('')
    try {
      const taskData = {
        uid: user.uid,
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: 'Pending',
        domain: newDomain,
        priority: newPriority,
        tags: newTags,
        createdAt: serverTimestamp(),
      }
      if (newDueDate) {
        taskData.dueDate = Timestamp.fromDate(new Date(newDueDate))
      }
      await addDoc(collection(db, 'tasks'), taskData)
      setNewTitle('')
      setNewDescription('')
      setNewDueDate('')
      setNewTags([])
    } catch {
      setError('Could not add task')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Done' ? 'Pending' : 'Done'
    try {
      await updateDoc(doc(db, 'tasks', task.id), { status: nextStatus })
    } catch {
      // ignore for now; could surface toast
    }
  }

  const handleEditTask = async (taskId, updates) => {
    try {
      const updateData = { ...updates }
      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate))
      } else if (updates.dueDate === null || updates.dueDate === '') {
        updateData.dueDate = null
      }
      // Remove dueDate from updateData if it's null to properly delete it
      if (updateData.dueDate === null) {
        updateData.dueDate = null
      }
      await updateDoc(doc(db, 'tasks', taskId), updateData)
      setEditingTask(null)
    } catch (err) {
      setError('Could not update task')
      console.error('Update error:', err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId))
      setDeletingTask(null)
      setSelectedTasks((prev) => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    } catch (err) {
      setError('Could not delete task')
      console.error('Delete error:', err)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return
    try {
      const promises = Array.from(selectedTasks).map((taskId) =>
        deleteDoc(doc(db, 'tasks', taskId))
      )
      await Promise.all(promises)
      setSelectedTasks(new Set())
      setBulkMode(false)
    } catch (err) {
      setError('Could not delete tasks')
      console.error('Bulk delete error:', err)
    }
  }

  const handleBulkStatusChange = async (status) => {
    if (selectedTasks.size === 0) return
    try {
      const promises = Array.from(selectedTasks).map((taskId) =>
        updateDoc(doc(db, 'tasks', taskId), { status })
      )
      await Promise.all(promises)
      setSelectedTasks(new Set())
      setBulkMode(false)
    } catch (err) {
      setError('Could not update tasks')
      console.error('Bulk update error:', err)
    }
  }

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(filteredTasks.map((t) => t.id)))
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterDomain && t.domain !== filterDomain) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (filterTags.length > 0) {
        const taskTags = t.tags || []
        const hasMatchingTag = filterTags.some((tagId) => taskTags.includes(tagId))
        if (!hasMatchingTag) return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = t.title?.toLowerCase().includes(query)
        const matchesDescription = t.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }
      return true
    })
  }, [tasks, filterDomain, filterPriority, filterTags, searchQuery])

  const domainNames = domains.map((d) => d.name)

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <LeftPanel
          domains={domainNames}
          tags={tags}
          priorities={PRIORITIES}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          filterDomain={filterDomain}
          setFilterDomain={setFilterDomain}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterTags={filterTags}
          setFilterTags={setFilterTags}
          onManageDomains={() => setShowDomainManager(true)}
          onManageTags={() => setShowTagManager(true)}
        />
        <main className="app-main">
          <DashboardStrip tasks={filteredTasks} />

          {/* Search Bar */}
          <div className="search-bar-container">
            <input
              className="search-input"
              type="text"
              placeholder="🔍 Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                type="button"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Bulk Operations Bar */}
          {bulkMode && (
            <div className="bulk-actions-bar">
              <div className="bulk-actions-info">
                <span>{selectedTasks.size} task(s) selected</span>
                <button
                  className="bulk-action-btn"
                  type="button"
                  onClick={toggleSelectAll}
                >
                  {selectedTasks.size === filteredTasks.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="bulk-actions-buttons">
                <button
                  className="bulk-action-btn bulk-action-mark"
                  type="button"
                  onClick={() => handleBulkStatusChange('Done')}
                  disabled={selectedTasks.size === 0}
                >
                  Mark Done
                </button>
                <button
                  className="bulk-action-btn bulk-action-mark"
                  type="button"
                  onClick={() => handleBulkStatusChange('Pending')}
                  disabled={selectedTasks.size === 0}
                >
                  Mark Pending
                </button>
                <button
                  className="bulk-action-btn bulk-action-delete"
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${selectedTasks.size} task(s)?`)) {
                      handleBulkDelete()
                    }
                  }}
                  disabled={selectedTasks.size === 0}
                >
                  Delete ({selectedTasks.size})
                </button>
                <button
                  className="bulk-action-btn bulk-action-cancel"
                  type="button"
                  onClick={() => {
                    setBulkMode(false)
                    setSelectedTasks(new Set())
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <section className="add-task-card">
            <h2 className="add-task-title">Add New Task</h2>
            <form className="add-task-form" onSubmit={handleAddTask}>
              <div className="add-task-main-inputs">
                <input
                  className="add-task-input add-task-title-input"
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
                <textarea
                  className="add-task-textarea"
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="add-task-options">
                <div className="add-task-option-group">
                  <label className="add-task-label">Domain</label>
                  <select
                    className="add-task-select"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  >
                    {domainNames.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="add-task-option-group">
                  <label className="add-task-label">Priority</label>
                  <select
                    className="add-task-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="add-task-option-group">
                  <label className="add-task-label">Due Date</label>
                  <input
                    className="add-task-date-input"
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
                <div className="add-task-option-group add-task-tags-group">
                  <label className="add-task-label">Tags</label>
                  <div className="tags-selector">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        className={`tag-selector-btn ${newTags.includes(tag.id) ? 'tag-selected' : ''}`}
                        type="button"
                        style={{
                          backgroundColor: newTags.includes(tag.id) ? tag.color + '20' : 'transparent',
                          borderColor: tag.color + '40',
                          color: tag.color,
                        }}
                        onClick={() => {
                          setNewTags((prev) =>
                            prev.includes(tag.id)
                              ? prev.filter((id) => id !== tag.id)
                              : [...prev, tag.id]
                          )
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                    {tags.length === 0 && (
                      <span className="tags-empty-hint">No tags yet. Manage tags to add them.</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="add-task-actions">
                <button className="add-task-button" type="submit" disabled={adding}>
                  {adding ? 'Adding...' : '+ Add Task'}
                </button>
                <button
                  className="bulk-mode-toggle"
                  type="button"
                  onClick={() => {
                    setBulkMode(!bulkMode)
                    if (bulkMode) {
                      setSelectedTasks(new Set())
                    }
                  }}
                >
                  {bulkMode ? '✕ Exit Bulk Mode' : '☑ Bulk Operations'}
                </button>
              </div>
            </form>
            {error && <p className="add-task-error">{error}</p>}
          </section>

          {loading ? (
            <div className="tasks-loading">Loading tasks...</div>
          ) : (
            <>
            <Board
              tasks={filteredTasks}
              groupBy={groupBy}
              onToggleStatus={handleToggleStatus}
              onEditTask={setEditingTask}
              onDeleteTask={setDeletingTask}
              bulkMode={bulkMode}
              selectedTasks={selectedTasks}
              onToggleSelection={toggleTaskSelection}
              tags={tags}
            />
              <div className="app-bottom-section">
                <RecentActivity tasks={tasks} />
                <QuickStats tasks={filteredTasks} />
              </div>
            </>
          )}

          {/* Edit Task Modal */}
          {editingTask && (
            <EditTaskModal
              task={editingTask}
              domains={domainNames}
              tags={tags}
              priorities={PRIORITIES}
              onClose={() => setEditingTask(null)}
              onSave={handleEditTask}
            />
          )}

          {/* Domain Manager */}
          {showDomainManager && (
            <div className="modal-overlay" onClick={() => setShowDomainManager(false)}>
              <div onClick={(e) => e.stopPropagation()}>
                <DomainManager
                  domains={domains.filter((d) => !d.isDefault)}
                  setDomains={setDomains}
                  onClose={() => setShowDomainManager(false)}
                />
              </div>
            </div>
          )}

          {/* Tag Manager */}
          {showTagManager && (
            <div className="modal-overlay" onClick={() => setShowTagManager(false)}>
              <div onClick={(e) => e.stopPropagation()}>
                <TagManager
                  tags={tags}
                  setTags={setTags}
                  onClose={() => setShowTagManager(false)}
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {deletingTask && (
            <ConfirmationDialog
              title="Delete Task"
              message={`Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`}
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={() => handleDeleteTask(deletingTask.id)}
              onCancel={() => setDeletingTask(null)}
              danger={true}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default MainPage



