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
import './domain-manager.css'

const DEFAULT_DOMAINS = ['Work', 'Admin']
const TAG_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

function DomainManager({ domains, setDomains, onClose }) {
  const { user } = useAuth()
  const [newDomain, setNewDomain] = useState('')
  const [editingDomain, setEditingDomain] = useState(null)
  const [editValue, setEditValue] = useState('')

  const handleAddDomain = async () => {
    if (!newDomain.trim() || domains.includes(newDomain.trim())) return
    try {
      await addDoc(collection(db, 'userDomains'), {
        uid: user.uid,
        name: newDomain.trim(),
        createdAt: new Date(),
      })
      setNewDomain('')
    } catch (err) {
      console.error('Error adding domain:', err)
    }
  }

  const handleDeleteDomain = async (domainName) => {
    if (DEFAULT_DOMAINS.includes(domainName)) return // Can't delete defaults
    try {
      const domainDoc = domains.find((d) => d.name === domainName)
      if (domainDoc && domainDoc.id) {
        await deleteDoc(doc(db, 'userDomains', domainDoc.id))
      }
    } catch (err) {
      console.error('Error deleting domain:', err)
    }
  }

  const handleUpdateDomain = async () => {
    if (!editValue.trim()) return
    try {
      const domainDoc = domains.find((d) => d.name === editingDomain)
      if (domainDoc && domainDoc.id) {
        await updateDoc(doc(db, 'userDomains', domainDoc.id), {
          name: editValue.trim(),
        })
        setEditingDomain(null)
        setEditValue('')
      }
    } catch (err) {
      console.error('Error updating domain:', err)
    }
  }

  return (
    <div className="domain-manager">
      <div className="domain-manager-header">
        <h3>Manage Domains</h3>
        <button className="domain-manager-close" type="button" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="domain-manager-content">
        <div className="domain-add-section">
          <input
            className="domain-input"
            type="text"
            placeholder="Add new domain..."
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
          />
          <button className="domain-add-btn" type="button" onClick={handleAddDomain}>
            Add
          </button>
        </div>
        <div className="domain-list">
          {DEFAULT_DOMAINS.map((domain) => (
            <div key={domain} className="domain-item domain-item-default">
              <span>{domain}</span>
              <span className="domain-badge-default">Default</span>
            </div>
          ))}
          {domains
            .filter((d) => !DEFAULT_DOMAINS.includes(d.name))
            .map((domain) => (
              <div key={domain.id || domain.name} className="domain-item">
                {editingDomain === domain.name ? (
                  <>
                    <input
                      className="domain-edit-input"
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateDomain()}
                      autoFocus
                    />
                    <button
                      className="domain-action-btn domain-save-btn"
                      type="button"
                      onClick={handleUpdateDomain}
                    >
                      ✓
                    </button>
                    <button
                      className="domain-action-btn domain-cancel-btn"
                      type="button"
                      onClick={() => {
                        setEditingDomain(null)
                        setEditValue('')
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span>{domain.name}</span>
                    <div className="domain-actions">
                      <button
                        className="domain-action-btn domain-edit-btn"
                        type="button"
                        onClick={() => {
                          setEditingDomain(domain.name)
                          setEditValue(domain.name)
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="domain-action-btn domain-delete-btn"
                        type="button"
                        onClick={() => handleDeleteDomain(domain.name)}
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default DomainManager

