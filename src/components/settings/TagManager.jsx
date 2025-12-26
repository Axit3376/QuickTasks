import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { useAuth } from '../../context/AuthContext'
import './tag-manager.css'

const TAG_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Lime', value: '#84cc16' },
]

function TagManager({ tags, setTags, onClose }) {
  const { user } = useAuth()
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value)
  const [editingTag, setEditingTag] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleAddTag = async () => {
    if (!newTagName.trim() || tags.some((t) => t.name === newTagName.trim())) return
    try {
      await addDoc(collection(db, 'userTags'), {
        uid: user.uid,
        name: newTagName.trim(),
        color: newTagColor,
        createdAt: new Date(),
      })
      setNewTagName('')
      setNewTagColor(TAG_COLORS[0].value)
    } catch (err) {
      console.error('Error adding tag:', err)
    }
  }

  const handleDeleteTag = async (tagId) => {
    try {
      await deleteDoc(doc(db, 'userTags', tagId))
    } catch (err) {
      console.error('Error deleting tag:', err)
    }
  }

  const handleUpdateTag = async () => {
    if (!editName.trim()) return
    try {
      await updateDoc(doc(db, 'userTags', editingTag.id), {
        name: editName.trim(),
        color: editColor,
      })
      setEditingTag(null)
      setEditName('')
      setEditColor('')
    } catch (err) {
      console.error('Error updating tag:', err)
    }
  }

  return (
    <div className="tag-manager">
      <div className="tag-manager-header">
        <h3>Manage Tags</h3>
        <button className="tag-manager-close" type="button" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="tag-manager-content">
        <div className="tag-add-section">
          <input
            className="tag-input"
            type="text"
            placeholder="Tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <div className="tag-color-picker">
            {TAG_COLORS.map((color) => (
              <button
                key={color.value}
                className={`tag-color-option ${newTagColor === color.value ? 'tag-color-selected' : ''}`}
                type="button"
                style={{ backgroundColor: color.value }}
                onClick={() => setNewTagColor(color.value)}
                title={color.name}
              />
            ))}
          </div>
          <button className="tag-add-btn" type="button" onClick={handleAddTag}>
            Add Tag
          </button>
        </div>
        <div className="tag-list">
          {tags.map((tag) => (
            <div key={tag.id} className="tag-item">
              {editingTag?.id === tag.id ? (
                <>
                  <input
                    className="tag-edit-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateTag()}
                    autoFocus
                  />
                  <div className="tag-color-picker-small">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`tag-color-option-small ${editColor === color.value ? 'tag-color-selected' : ''}`}
                        type="button"
                        style={{ backgroundColor: color.value }}
                        onClick={() => setEditColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <button
                    className="tag-action-btn tag-save-btn"
                    type="button"
                    onClick={handleUpdateTag}
                  >
                    ✓
                  </button>
                  <button
                    className="tag-action-btn tag-cancel-btn"
                    type="button"
                    onClick={() => {
                      setEditingTag(null)
                      setEditName('')
                      setEditColor('')
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="tag-preview"
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color,
                      borderColor: tag.color + '40',
                    }}
                  >
                    {tag.name}
                  </span>
                  <div className="tag-actions">
                    <button
                      className="tag-action-btn tag-edit-btn"
                      type="button"
                      onClick={() => {
                        setEditingTag(tag)
                        setEditName(tag.name)
                        setEditColor(tag.color)
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="tag-action-btn tag-delete-btn"
                      type="button"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {tags.length === 0 && (
            <p className="tag-empty">No tags yet. Create your first tag!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TagManager

