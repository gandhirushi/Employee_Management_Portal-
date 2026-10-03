import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLeave } from '../hooks/useLeave';
import { useDebounce } from '../hooks/useDebounce';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import { formatDateDDMMYYYY, calculateDays } from '../utils/date';

export default function AdminLeaves() {
  const { role } = useAuth();
  const { showToast } = useToast();
  const isSuperAdmin = role === 'super_admin';

  const {
    leaves,
    loading,
    actionLoading,
    fetchLeaveRequests,
    updateLeaveStatus,
  } = useLeave();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

  // Action modals state
  const [approvingLeave, setApprovingLeave] = useState(null);
  const [rejectingLeave, setRejectingLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadLeaves = useCallback(async () => {
    try {
      await fetchLeaveRequests({
        status: statusFilter === 'ALL' ? '' : statusFilter,
        search: debouncedSearch,
      });
    } catch (err) {
      console.error('Failed to load leave requests:', err);
      showToast('Failed to load leave requests', 'error');
    }
  }, [statusFilter, debouncedSearch, fetchLeaveRequests, showToast]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  // Handle Approve (Super Admin only)
  const handleApprove = async () => {
    if (!isSuperAdmin || !approvingLeave) return;
    try {
      await updateLeaveStatus(approvingLeave.id, {
        status: 'APPROVED',
      });
      showToast(`Leave for ${approvingLeave.employeeName} approved`, 'success');
      setApprovingLeave(null);
      await loadLeaves();
    } catch (err) {
      showToast(err.message || 'Failed to approve leave', 'error');
    }
  };

  // Handle Reject (Super Admin only)
  const handleReject = async () => {
    if (!isSuperAdmin || !rejectingLeave) return;
    try {
      await updateLeaveStatus(rejectingLeave.id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim() || undefined,
      });
      showToast(`Leave for ${rejectingLeave.employeeName} rejected`, 'info');
      setRejectingLeave(null);
      setRejectionReason('');
      await loadLeaves();
    } catch (err) {
      showToast(err.message || 'Failed to reject leave', 'error');
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
          <span className="eyebrow">{isSuperAdmin ? 'Super Admin' : 'HR Admin'}</span>
          <h1>Leave Applications</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadLeaves}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="stat-grid">
        <StatCard icon={FileText} label="Total Applications" value={leaves.length} iconBg="var(--brand-100)" iconColor="var(--brand-600)" />
        <StatCard icon={Clock} label="Pending Approval" value={pendingCount} iconBg="var(--accent-100)" iconColor="#B9791A" />
        <StatCard icon={CheckCircle2} label="Approved" value={approvedCount} iconBg="var(--teal-100)" iconColor="var(--teal)" />
        <StatCard icon={XCircle} label="Rejected" value={rejectedCount} iconBg="var(--danger-100)" iconColor="var(--danger)" />
      </div>

      {/* Filter and Search Toolbar */}
      <div className="toolbar" style={{ marginTop: '20px' }}>
        <SearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Search by employee, ID, leave type, or reason..."
        />

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'ALL', label: 'All' },
            { key: 'PENDING', label: `Pending (${pendingCount})` },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`btn btn-sm ${statusFilter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Leave Applications Table */}
      {loading && leaves.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Loading leave applications...</p>
        </div>
      ) : leaves.length === 0 ? (
        <div className="card card-pad">
          <EmptyState
            icon={CalendarCheck}
            title="No leave applications found"
            description="No employee leave applications match your current search or filter criteria."
          />
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>{isSuperAdmin ? 'Actions' : 'Action Details'}</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => {
                const days = calculateDays(leave.startDate, leave.endDate);
                const isPending = leave.status === 'PENDING';

                return (
                  <tr key={leave.id}>
                    {/* Employee info */}
                    <td>
                      <div className="emp-cell">
                        <Avatar name={leave.employeeName} src={leave.profilePhoto} />
                        <div>
                          <div className="emp-name">{leave.employeeName}</div>
                          <div className="emp-email">{leave.employeeEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          background: 'var(--bg)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {leave.employeeId ? leave.employeeId.slice(0, 14) : 'N/A'}
                      </span>
                    </td>

                    {/* Leave Type */}
                    <td>
                      <span style={{ fontWeight: 600 }}>{leave.leaveType}</span>
                    </td>

                    {/* Dates */}
                    <td>
                      <div style={{ fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                        {formatDateDDMMYYYY(leave.startDate)} — {formatDateDDMMYYYY(leave.endDate)}
                      </div>
                    </td>

                    {/* Duration */}
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {days} day{days > 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Reason */}
                    <td style={{ maxWidth: '240px' }}>
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
                            marginTop: '2px',
                          }}
                        >
                          Reason: {leave.rejectionReason}
                        </div>
                      )}
                    </td>

                    {/* Applied Date */}
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {formatDateDDMMYYYY(leave.appliedDate)}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={leave.status} />
                    </td>

                    {/* Actions / Action Details */}
                    <td>
                      <div className="row-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                        {isSuperAdmin ? (
                          isPending ? (
                            <>
                              <button
                                className="btn btn-sm btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'var(--teal)' }}
                                onClick={() => setApprovingLeave(leave)}
                                title="Approve Leave"
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                onClick={() => {
                                  setRejectingLeave(leave);
                                  setRejectionReason('');
                                }}
                                title="Reject Leave"
                              >
                                <X size={14} /> Reject
                              </button>
                            </>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                                fontStyle: 'italic',
                                paddingRight: '6px',
                              }}
                            >
                              {leave.actionDate ? `Actioned ${formatDateDDMMYYYY(leave.actionDate)}` : 'Completed'}
                            </span>
                          )
                        ) : (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              color: isPending ? '#B9791A' : 'var(--text-muted)',
                              fontStyle: 'italic',
                              paddingRight: '6px',
                            }}
                          >
                            {isPending
                              ? 'Pending Super Admin approval'
                              : leave.actionDate
                              ? `Actioned ${formatDateDDMMYYYY(leave.actionDate)}`
                              : 'Completed'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Approval (Super Admin only) */}
      {isSuperAdmin && approvingLeave && (
        <div className="modal-overlay" onClick={() => !actionLoading && setApprovingLeave(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div
              className="modal-icon"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--teal-100)',
                color: 'var(--teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Check size={24} />
            </div>

            <h3 style={{ marginBottom: 8, textAlign: 'center' }}>Approve Leave Request?</h3>
            <p
              className="text-muted"
              style={{ fontSize: '0.9rem', lineHeight: 1.5, textAlign: 'center', marginBottom: 16 }}
            >
              Are you sure you want to approve the <strong>{approvingLeave.leaveType}</strong> application for{' '}
              <strong>{approvingLeave.employeeName}</strong> from{' '}
              <strong>{formatDateDDMMYYYY(approvingLeave.startDate)}</strong> to{' '}
              <strong>{formatDateDDMMYYYY(approvingLeave.endDate)}</strong>?
            </p>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setApprovingLeave(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Rejection (Super Admin only) */}
      {isSuperAdmin && rejectingLeave && (
        <div className="modal-overlay" onClick={() => !actionLoading && setRejectingLeave(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-danger">
              <AlertTriangle size={22} />
            </div>

            <h3 style={{ marginBottom: 8, textAlign: 'center' }}>Reject Leave Request</h3>
            <p
              className="text-muted"
              style={{ fontSize: '0.9rem', lineHeight: 1.5, textAlign: 'center', marginBottom: 16 }}
            >
              You are rejecting the <strong>{rejectingLeave.leaveType}</strong> application for{' '}
              <strong>{rejectingLeave.employeeName}</strong>.
            </p>

            <div className="field" style={{ textAlign: 'left', marginBottom: 18 }}>
              <label htmlFor="rejectionReason">Rejection Reason / Note (Optional)</label>
              <textarea
                id="rejectionReason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify why this leave request cannot be approved..."
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setRejectingLeave(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
