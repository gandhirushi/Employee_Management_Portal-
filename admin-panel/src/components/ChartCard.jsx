export default function ChartCard({ title, subtitle, children, height = 260 }) {
  return (
    <div className="card card-pad">
      <div className="chart-card-title">{title}</div>
      {subtitle && <div className="chart-card-sub">{subtitle}</div>}
      <div style={{ width: '100%', height }}>{children}</div>
    </div>
  );
}
