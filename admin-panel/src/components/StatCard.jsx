import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, iconColor, iconBg, trend }) {
  return (
    <div className="card stat-card">
      <div className="stat-card-top">
        <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
          <Icon size={19} />
        </div>
        {trend && (
          <span className={`stat-trend ${trend.direction}`}>
            {trend.direction === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend.label}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
