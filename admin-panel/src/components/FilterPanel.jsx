export default function FilterPanel({ filters, onChange, onClear, departments, positions }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="card filter-panel">
      <div className="field">
        <label>Department</label>
        <select value={filters.department} onChange={set('department')}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Status</label>
        <select value={filters.status} onChange={set('status')}>
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
      <div className="field">
        <label>Position</label>
        <select value={filters.position} onChange={set('position')}>
          <option value="">All positions</option>
          {positions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Joined after</label>
        <input type="date" value={filters.joinedAfter} onChange={set('joinedAfter')} />
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>Clear filters</button>
      </div>
    </div>
  );
}
