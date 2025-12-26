import './dashboard.css'

function DashboardStrip({ tasks }) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'Done').length
  const pending = total - done

  return (
    <section className="dash-strip">
      <DashCard label="Total Tasks" value={total} tone="neutral" />
      <DashCard label="Done" value={done} tone="success" />
      <DashCard label="Pending" value={pending} tone="warning" />
    </section>
  )
}

function DashCard({ label, value, tone }) {
  return (
    <div className={`dash-card dash-card-${tone}`}>
      <span className="dash-label">{label}</span>
      <span className="dash-value">{value}</span>
    </div>
  )
}

export default DashboardStrip



