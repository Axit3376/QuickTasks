
import './left-panel.css'

function LeftPanel({
  domains,
  tags,
  priorities,
  groupBy,
  setGroupBy,
  filterDomain,
  setFilterDomain,
  filterPriority,
  setFilterPriority,
  filterTags,
  setFilterTags,
  onManageDomains,
  onManageTags,
}) {
  const handleDomainClick = (domain) => {
    setFilterDomain(filterDomain === domain ? null : domain)
  }

  const handlePriorityClick = (priority) => {
    setFilterPriority(filterPriority === priority ? null : priority)
  }

  const handleTagClick = (tagId) => {
    setFilterTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  return (
    <aside className="left-panel">
      <h2 className="left-title">Views</h2>

      <div className="left-section">
        <h3 className="left-section-title">Group by</h3>
        <div className="left-pill-group">
          <button
            className={`left-pill ${groupBy === 'status' ? 'left-pill-active' : ''}`}
            type="button"
            onClick={() => setGroupBy('status')}
          >
            Work status
          </button>
          <button
            className={`left-pill ${groupBy === 'domain' ? 'left-pill-active' : ''}`}
            type="button"
            onClick={() => setGroupBy('domain')}
          >
            Domain
          </button>
          <button
            className={`left-pill ${groupBy === 'priority' ? 'left-pill-active' : ''}`}
            type="button"
            onClick={() => setGroupBy('priority')}
          >
            Priority
          </button>
        </div>
      </div>

      <div className="left-section">
        <h3 className="left-section-title">Domain</h3>
        <div className="left-pill-group">
          {domains.map((d) => (
            <button
              key={d}
              type="button"
              className={`left-pill ${filterDomain === d ? 'left-pill-active' : ''}`}
              onClick={() => handleDomainClick(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="left-section">
        <h3 className="left-section-title">Priority</h3>
        <div className="left-pill-group">
          {priorities.map((p) => (
            <button
              key={p}
              type="button"
              className={`left-pill ${filterPriority === p ? 'left-pill-active' : ''}`}
              onClick={() => handlePriorityClick(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="left-section">
        <div className="left-section-header">
          <h3 className="left-section-title">Tags</h3>
          <button
            className="left-manage-btn"
            type="button"
            onClick={onManageTags}
            title="Manage tags"
          >
            ⚙️
          </button>
        </div>
        <div className="left-tag-group">
          {tags.slice(0, 5).map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={`left-tag ${filterTags.includes(tag.id) ? 'left-tag-active' : ''}`}
              style={{
                backgroundColor: filterTags.includes(tag.id) ? tag.color + '20' : 'transparent',
                borderColor: tag.color + '40',
                color: tag.color,
              }}
              onClick={() => handleTagClick(tag.id)}
            >
              {tag.name}
            </button>
          ))}
          {tags.length === 0 && (
            <p className="left-empty-hint">No tags yet</p>
          )}
          {tags.length > 5 && (
            <p className="left-more-hint">+{tags.length - 5} more</p>
          )}
        </div>
      </div>

      <div className="left-section left-section-manage">
        <button className="left-manage-button" type="button" onClick={onManageDomains}>
          ⚙️ Manage Domains
        </button>
        <button className="left-manage-button" type="button" onClick={onManageTags}>
          🏷️ Manage Tags
        </button>
      </div>
    </aside>
  )
}

export default LeftPanel



