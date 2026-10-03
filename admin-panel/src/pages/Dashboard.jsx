import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, UserPlus, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = { Active: '#12B8A6', Inactive: '#E5484D', 'On Leave': '#F2A93B' };
const BAR_COLOR = '#2D3282';

export default function Dashboard() {
  const { fetchDashboardStats } = useDashboard();
  const { role, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(role !== 'employee');

  useEffect(() => {
    if (role === 'employee') {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      const statsData = await fetchDashboardStats();
      setData(statsData);
      setLoading(false);
    }
    load();
  }, [fetchDashboardStats, role]);

  if (role === 'employee') {
    return (
      <div>
        <div className="page-header">
          <div>
            <span className="eyebrow">Employee Portal</span>
            <h1>Employee Dashboard</h1>
          </div>
        </div>

        <div className="card card-pad" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(45, 50, 130, 0.05) 0%, rgba(18, 184, 166, 0.05) 100%)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: 6 }}>Welcome back, {user?.fullName || 'Employee'}!</h2>
              <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: 600 }}>
                You are currently logged in with standard <strong>Employee</strong> permissions. You can submit and track leave applications, update your profile settings, and view company notifications.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--brand-100)', color: 'var(--brand-600)', padding: '6px 14px', borderRadius: 20, fontWeight: 600, fontSize: '0.85rem' }}>
              <ShieldCheck size={16} /> Employee Account
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>My Profile Overview</div>
          <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="info-item">
              <div className="info-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Full Name</div>
              <div className="info-value" style={{ fontWeight: 600 }}>{user?.fullName || 'Not set'}</div>
            </div>
            <div className="info-item">
              <div className="info-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email Address</div>
              <div className="info-value" style={{ fontWeight: 600 }}>{user?.email || 'Not set'}</div>
            </div>
            <div className="info-item">
              <div className="info-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Assigned Role</div>
              <div className="info-value" style={{ fontWeight: 600, color: 'var(--brand-600)' }}>Employee</div>
            </div>
            <div className="info-item">
              <div className="info-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Account Status</div>
              <div className="info-value" style={{ fontWeight: 600, color: 'var(--teal)' }}>Active</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="text-muted">Loading dashboard statistics...</p>
      </div>
    );
  }

  const { stats, byDepartment, byStatus, joiningTrend, salaryBands } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Team dashboard</h1>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={Users} label="Total employees" value={stats.total} iconBg="var(--brand-100)" iconColor="var(--brand-600)" />
        <StatCard icon={UserCheck} label="Active employees" value={stats.active} iconBg="var(--teal-100)" iconColor="var(--teal)" />
        <StatCard icon={UserX} label="Inactive employees" value={stats.inactive} iconBg="var(--danger-100)" iconColor="var(--danger)" />
        <StatCard icon={UserPlus} label="Added in last 90 days" value={stats.recent} iconBg="var(--accent-100)" iconColor="#B9791A" />
      </div>

      <div className="chart-grid">
        <ChartCard title="Employees by department" subtitle="Headcount across every team">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDepartment} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} interval={0} angle={-20} textAnchor="end" height={54} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Employees by status" subtitle="Current workforce breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {byStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#999'} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="chart-grid">
        <ChartCard title="Joining trend" subtitle="New hires and cumulative headcount by month">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={joiningTrend} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="hires" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} name="New hires" />
              <Line type="monotone" dataKey="total" stroke="#2D3282" strokeWidth={2} dot={{ r: 3 }} name="Cumulative" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Salary distribution" subtitle="Employees grouped by salary band">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salaryBands} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="band" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#12B8A6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
