import { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, RefreshCw, Send, CheckCircle2, Clock, XCircle, FileText, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLeave } from '../hooks/useLeave';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { formatDateDDMMYYYY, calculateDays } from '../utils/date';
import { LEAVE_TYPES } from '../constants/departments';

export default function LeaveApplication() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    leaves,
    loading,
    submitting,
    fetchMyLeaves,
    applyLeave,
  } = useLeave();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields
  const [leaveType, setLeaveType] = useState('Work From Home');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchMyLeaves().catch((err) => {
      console.error('Failed to load leave applications:', err);
      showToast('Failed to load leave applications', 'error');
    });
  }, [fetchMyLeaves, showToast]);

  // Today's date in YYYY-MM-DD for min date
  const todayString = new Date().toISOString().slice(0, 10);
  const duration = calculateDays(startDate, endDate);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setLeaveType('Work From Home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!leaveType) {
      setFormError('Please select a leave type.');
      return;
    }
    if (!startDate) {
      setFormError('Start date is required.');
      return;
    }
    if (!endDate) {
      setFormError('End date is required.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be before the start date.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Reason for leave is required.');
      return;
    }

    try {
      await applyLeave({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });

      showToast('Leave application submitted successfully!', 'success');
      handleCloseModal();
      await fetchMyLeaves();
    } catch (err) {
      setFormError(err.message || 'Failed to submit leave application.');
      showToast(err.message || 'Failed to submit leave application', 'error');
    }
  };

  const { pendingCount, approvedCount, rejectedCount } = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    for (const l of leaves) {
      if (l.status === 'PENDING') pending++;
      else if (l.status === 'APPROVED') approved++;
      else if (l.status === 'REJECTED') rejected++;
    }
    return { pendingCount: pending, approvedCount: approved, rejectedCount: rejected };
  }, [leaves]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow">Employee Portal</span>
          <h1>Leave Application</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={15} /> Apply for Leave
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={fetchMyLeaves}
            title="Refresh status"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <StatCard icon={FileText} label="Total Applied" value={leaves.length} iconBg="var(--brand-100)" iconColor="var(--brand-600)" />
        <StatCard icon={Clock} label="Pending Review" value={pendingCount} iconBg="var(--accent-100)" iconColor="#B9791A" />
        <StatCard icon={CheckCircle2} label="Approved" value={approvedCount} iconBg="var(--teal-100)" iconColor="var(--teal)" />
        <StatCard icon={XCircle} label="Rejected" value={rejectedCount} iconBg="var(--danger-100)" iconColor="var(--danger)" />
      </div>

      {/* My Applications Table (Default View) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem' }}>My Applications ({leaves.length})</h2>
        </div>

        {loading && leaves.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: 'center', padding: '40px' }}>
            <p className="text-muted">Loading your leave applications...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="card card-pad">
            <EmptyState
              icon={Calendar}
              title="No leave applications yet"
              description="You have not submitted any leave applications. Click 'Apply for Leave' to submit your first request."
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={15} /> Apply for Leave
              </button>
            </div>
          </div>
        ) : (
          <div className="card table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => {
                  const days = calculateDays(leave.startDate, leave.endDate);
                  return (
                    <tr key={leave.id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{leave.leaveType}</span>
                      </td>
                      <td>{formatDateDDMMYYYY(leave.startDate)}</td>
                      <td>{formatDateDDMMYYYY(leave.endDate)}</td>
                      <td>
                        <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                          {days} day{days > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.86rem',
                          }}
                          title={leave.reason}
                        >
                          {leave.reason}
                        </div>
                        {leave.rejectionReason && (
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--danger)',
                              marginTop: '4px',
                              fontWeight: 500,
                            }}
                          >
                            Note: {leave.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {formatDateDDMMYYYY(leave.appliedDate)}
                      </td>
                      <td>
                        <StatusBadge status={leave.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply for Leave Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !submitting && handleCloseModal()}>
          <div className="modal-box wide" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Apply for Leave</h2>
                <p className="text-muted" style={{ fontSize: '0.88rem' }}>
                  Submit a leave application for approval.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => !submitting && handleCloseModal()}
                aria-label="Close modal"
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--danger-100)',
                  color: 'var(--danger)',
                  fontSize: '0.88rem',
                  marginBottom: '18px',
                  fontWeight: 500,
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Applicant details (read-only display) */}
              <div className="field">
                <label>Applicant</label>
                <input
                  type="text"
                  value={`${user?.fullName || 'Employee'} (${user?.email || ''})`}
                  disabled
                  style={{ opacity: 0.85, background: 'var(--bg)' }}
                />
              </div>

              {/* Leave Type */}
              <div className="field">
                <label htmlFor="leaveType">Leave Type *</label>
                <select
                  id="leaveType"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                >
                  {LEAVE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="field">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && new Date(endDate) < new Date(e.target.value)) {
                        setEndDate(e.target.value);
                      }
                    }}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    id="endDate"
                    type="date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Duration hint */}
              {duration > 0 && (
                <div
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--brand-600)',
                    marginBottom: '16px',
                    fontWeight: 600,
                  }}
                >
                  Duration: {duration} day{duration > 1 ? 's' : ''}
                </div>
              )}

              {/* Reason */}
              <div className="field">
                <label htmlFor="reason">Reason / Description *</label>
                <textarea
                  id="reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the reason for taking leave (e.g. medical appointment, family event, remote work requirements)..."
                  required
                />
              </div>

              {/* Modal actions */}
              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Send size={16} />
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
