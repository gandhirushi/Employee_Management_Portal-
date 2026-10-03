import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, UserX } from 'lucide-react';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { useEmployees } from '../hooks/useEmployees';
import { useToast } from '../context/ToastContext';
import { formatDateDDMMYYYY } from '../utils/date';
import { useAuth } from '../context/AuthContext';

export default function EmployeeDetails() {
  const { id } = useParams();
  const { removeEmployee, getEmployeeById } = useEmployees();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getEmployeeById(id);
      setEmployee(data);
      setLoading(false);
    }
    if (id) {
      load();
    }
  }, [id, getEmployeeById]);

  if (loading) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="text-muted">Loading employee details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="card card-pad">
        <EmptyState icon={UserX} title="Employee not found" description="This employee may have already been deleted." />
      </div>
    );
  }

  const handleDelete = async () => {
  const success = await removeEmployee(
    employee.id,
    employee.fullName
  );

  if (!success) {
    showToast(
      "Error",
      "Failed to delete employee."
    );
    return;
  }

  showToast(
    "Employee deleted",
    `${employee.fullName} was removed.`
  );

  navigate("/employees");
};

  const salaryFormatted = employee.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div>
      <Link to="/employees" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
        <ArrowLeft size={15} /> Back to employees
      </Link>

      <div className="detail-grid">
        <div className="card detail-profile">
          <Avatar name={employee.fullName} src={employee.profilePhoto} size="lg" />
          <h3 style={{ marginTop: 14 }}>{employee.fullName}</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 2 }}>{employee.position}</p>
          <div style={{ marginTop: 10 }}>
            <StatusBadge status={employee.status} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            {(role === 'super_admin' || role === 'hr_admin') && (
              <button className="btn btn-secondary btn-block" onClick={() => navigate(`/employees/${employee.id}/edit`)}>
                <Pencil size={14} /> Edit
              </button>
            )}
            {role === 'super_admin' && (
              <button className="btn btn-danger btn-block" onClick={() => setConfirmOpen(true)}>
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title">Contact & role information</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label"><Mail size={12} style={{ marginRight: 4, position: 'relative', top: 2 }} />Email</div>
              <div className="info-value">{employee.email}</div>
            </div>
            <div className="info-item">
              <div className="info-label"><Phone size={12} style={{ marginRight: 4, position: 'relative', top: 2 }} />Phone</div>
              <div className="info-value">{employee.phone}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Employee ID</div>
              <div className="info-value" style={{ fontFamily: 'var(--font-mono)' }}>{employee.id}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Gender</div>
              <div className="info-value">{employee.gender}</div>
            </div>
            <div className="info-item">
              <div className="info-label"><Calendar size={12} style={{ marginRight: 4, position: 'relative', top: 2 }} />Date of birth</div>
              <div className="info-value">{formatDateDDMMYYYY(employee.dob)}</div>
            </div>
            <div className="info-item">
              <div className="info-label"><Briefcase size={12} style={{ marginRight: 4, position: 'relative', top: 2 }} />Department</div>
              <div className="info-value">{employee.department}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Position</div>
              <div className="info-value">{employee.position}</div>
            </div>
            <div className="info-item">
              <div className="info-label"><DollarSign size={12} style={{ marginRight: 4, position: 'relative', top: 2 }} />Salary</div>
              <div className="info-value">{salaryFormatted} / yr</div>
            </div>
            <div className="info-item">
              <div className="info-label">Joining date</div>
              <div className="info-value">{formatDateDDMMYYYY(employee.joiningDate)}</div>
            </div>
            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
              <div className="info-label"><MapPin size={12} style={{ marginRight: 4, position: 'relative', top: 2 }} />Address</div>
              <div className="info-value">{employee.address}</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete employee?"
        description={`This will permanently remove ${employee.fullName} from the directory.`}
        confirmLabel="Delete employee"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
