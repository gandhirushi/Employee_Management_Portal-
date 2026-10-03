import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';
import EmptyState from '../components/EmptyState';
import { useEmployees } from '../hooks/useEmployees';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../context/ToastContext';
import { UserX } from 'lucide-react';

export default function EditEmployee() {
  const { id } = useParams();
  const { getEmployeeById, replaceEmployee } = useEmployees();
  const { notify } = useNotifications();
  const { showToast } = useToast();
  const navigate = useNavigate();
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

  const handleSubmit = async (values) => {
  const record = await replaceEmployee(
    id,
    values
  );

  if (!record) {
    showToast(
      "Error",
      "Failed to update employee."
    );
    return;
  }

  await notify(
    "Employee updated",
    `${values.fullName}'s profile was updated.`,
    "employee"
  );

  showToast(
    "Employee updated",
    `${values.fullName}'s details were saved.`
  );

  navigate(`/employees/${id}`);
};

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Directory</span>
          <h1>Edit employee</h1>
        </div>
      </div>
      <div className="card card-pad" style={{ maxWidth: 760 }}>
        <EmployeeForm
          initialValues={employee}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/employees/${id}`)}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
