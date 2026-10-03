import { useNavigate, useLocation } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';
import { useEmployees } from '../hooks/useEmployees';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../context/ToastContext';

export default function AddEmployee() {
  const { createEmployee } = useEmployees();
  const { notify } = useNotifications();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboarding = location.state?.onboarding === true;

  const handleSubmit = async (values) => {
    try {
      const record = await createEmployee(values);

      if (!record) {
        showToast(
          "Error",
          "Failed to add employee."
        );
        return;
      }

      await notify(
        "Employee added",
        `${record.fullName} was added to ${record.department}.`,
        "employee"
      );

      showToast(
        "Employee added",
        `${record.fullName} has been added. User account created with default password Admin@123.`
      );

      // If this is the onboarding flow (from login), go to dashboard
      // Otherwise (normal admin add), go to employees list
      if (isOnboarding) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/employees");
      }
    } catch (err) {
      showToast(
        "Error",
        err.message || "Failed to add employee."
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Directory</span>
          <h1>Add employee</h1>
        </div>
      </div>
      <div className="card card-pad" style={{ maxWidth: 760 }}>
        <EmployeeForm onSubmit={handleSubmit} onCancel={() => navigate('/employees')} submitLabel="Add employee" />
      </div>
    </div>
  );
}
