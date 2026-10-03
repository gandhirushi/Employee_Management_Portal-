import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, Users, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { formatDateDDMMYYYY } from '../utils/date';
import { useAuth } from '../context/AuthContext';
import { useEmployees } from '../hooks/useEmployees';
import { useNotifications } from '../hooks/useNotifications';
import { useChat } from '../hooks/useChat';

export default function EmployeeTable({ employees, onDelete, onSort, sortBy, sortOrder, onRoleChanged }) {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { updateEmployeeRole } = useEmployees();
  const { notify } = useNotifications();
  const { openChatWithEmployee } = useChat();

  const canChat = role === 'super_admin' || role === 'hr_admin' || role === 'manager';

  if (employees.length === 0) {
    return (
      <div className="card card-pad">
        <EmptyState
          icon={Users}
          title="No employees found"
          description="Try adjusting your search or filters, or add a new employee."
        />
      </div>
    );
  }

  return (
    <div className="card table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={onSort} style={{ cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Employee
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </div>
            </th>
            <th>Department</th>
            <th>Position</th>
            <th>Role</th>
            <th>Joining date</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
                            {/* 1. Employee */}
              <td>
                <div
                  className="emp-cell"
                  style={{ cursor: canChat && emp.email !== user?.email ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (canChat && emp.email !== user?.email) {
                      openChatWithEmployee(emp);
                    }
                  }}
                  title={canChat && emp.email !== user?.email ? `Click to chat with ${emp.fullName}` : undefined}
                >
                  <Avatar name={emp.fullName} src={emp.profilePhoto} />
                  <div>
                    <div className="emp-name">{emp.fullName}</div>
                    <div className="emp-email">{emp.email}</div>
                  </div>
                </div>
              </td>
              
              {/* 2. Department */}
              <td>{emp.department}</td>
              
              {/* 3. Position */}
              <td>{emp.position}</td>
              
              {/* 4. Role (This was shifted previously) */}
              <td>
                {role === 'super_admin' ? (
                  <select 
                    value={emp.role || 'employee'} 
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      const updated = await updateEmployeeRole(emp.id, newRole);
                      if (updated) {
                        await notify(
                          "Role updated",
                          `${emp.fullName}'s role is now ${newRole.replace('_', ' ')}.`,
                          "employee"
                        );
                        if (onRoleChanged) {
                          onRoleChanged(emp.id, newRole);
                        }
                      }
                    }}
                    style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  >
                    <option value='employee'>Employee</option>
                    <option value='manager'>Manager</option>
                    <option value='hr_admin'>HR Admin</option>
                  </select>
                ) : (
                  <span>
                    {emp.role ? emp.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Employee'}
                  </span>
                )}
              </td>
              
              {/* 5. Joining Date */}
              <td>{formatDateDDMMYYYY(emp.joiningDate)}</td>
              
              {/* 6. Status */}
              <td><StatusBadge status={emp.status} /></td>
              
              {/* 7. Actions */}
              <td>
                <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                  {canChat && emp.email !== user?.email && (
                    <button
                      className="btn btn-ghost btn-icon chat-action-btn"
                      title={`Chat with ${emp.fullName}`}
                      onClick={() => openChatWithEmployee(emp)}
                    >
                      <MessageSquare size={16} color="var(--brand)" />
                    </button>
                  )}

                  <button className="btn btn-ghost btn-icon" title="View" onClick={() => navigate(`/employees/${emp.id}`)}>
                    <Eye size={16} />
                  </button>
                  
                  {(role === 'super_admin' || role === 'hr_admin') && (
                    <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => navigate(`/employees/${emp.id}/edit`)}>
                      <Pencil size={16} />
                    </button>
                  )}
                  
                  {role === 'super_admin' && (
                    <button className="btn btn-ghost btn-icon" title="Delete" onClick={() => onDelete(emp)}>
                      <Trash2 size={16} color="var(--danger)" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
