import { useState, useRef } from 'react';
import { validateEmployee, formatIndianPhone } from '../utils/validation';
import { Camera, Trash2 } from 'lucide-react';
import Avatar from './Avatar';
import { DEPARTMENTS, STATUSES } from '../constants/departments';

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  gender: '',
  dob: '',
  department: '',
  position: '',
  salary: '',
  joiningDate: '',
  status: 'Active',
  address: '',
};

function getRawPhoneDigits(phone) {
  if (!phone) return '';
  if (phone.startsWith('+91')) {
    return phone.slice(3).trim();
  }
  return phone;
}


export default function EmployeeForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save employee' }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialValues?.profilePhoto || null);
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValues((v) => ({ ...v, profilePhoto: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatIndianPhone(rawVal);
    setValues((v) => ({ ...v, phone: formatted || rawVal }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedPhone = formatIndianPhone(values.phone);
    const updatedValues = { ...values, phone: formattedPhone };
    const validationErrors = validateEmployee(updatedValues);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit({ ...updatedValues, salary: Number(values.salary), photoFile: selectedFile});
    }
  };

  const field = (key, label, type = 'text', extra = {}) => (
    <div className={`field ${errors[key] ? 'has-error' : ''}`}>
      <label htmlFor={key}>{label}</label>
      <input id={key} type={type} value={values[key]} onChange={set(key)} {...extra} />
      {errors[key] && <div className="error-text">{errors[key]}</div>}
    </div>
  );
  
  return (
    <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
          <Avatar name={values.fullName || 'New Employee'} src={previewUrl} size="lg" />
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: 'var(--brand-600, #2D3282)',
            color: '#fff',
            borderRadius: '50%',
            padding: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <Camera size={14} />
          </div>
        </div>
        <div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
            Choose photo
          </button>
          {previewUrl && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleRemovePhoto} style={{ color: 'var(--danger)', marginLeft: 8 }}>
              <Trash2 size={14} /> Remove
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: 4 }}>JPG, PNG or WEBP (Max 5MB)</p>
        </div>
      </div>
      <div className="field-row">
        {field('fullName', 'Full name')}
        {field('email', 'Email address', 'email')}
      </div>
      <div className="field-row">
        <div className={`field ${errors.phone ? 'has-error' : ''}`}>
          <label htmlFor="phone">Phone number</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 12px',
              height: '38px',
              backgroundColor: 'var(--surface-subtle, #f3f4f6)',
              border: '1px solid var(--border, #d1d5db)',
              borderRight: 'none',
              borderRadius: '6px 0 0 6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--text-muted, #4b5563)',
              userSelect: 'none'
            }}>
              +91
            </span>
            <input
              id="phone"
              type="tel"
              style={{ borderRadius: '0 6px 6px 0' }}
              placeholder="9876543210"
              value={getRawPhoneDigits(values.phone)}
              onChange={handlePhoneChange}
            />
          </div>
          {errors.phone && <div className="error-text">{errors.phone}</div>}
        </div>
        <div className={`field ${errors.gender ? 'has-error' : ''}`}>
          <label htmlFor="gender">Gender</label>
          <select id="gender" value={values.gender} onChange={set('gender')}>
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <div className="error-text">{errors.gender}</div>}
        </div>
      </div>
      <div className="field-row">
        {field('dob', 'Date of birth', 'date')}
        {field('joiningDate', 'Joining date', 'date')}
      </div>
      <div className="field-row">
        <div className={`field ${errors.department ? 'has-error' : ''}`}>
          <label htmlFor="department">Department</label>
          <select id="department" value={values.department} onChange={set('department')}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <div className="error-text">{errors.department}</div>}
        </div>
        {field('position', 'Position')}
      </div>
      <div className="field-row">
        {field('salary', 'Annual salary (USD)', 'number', { min: 0, step: 1000 })}
        <div className={`field ${errors.status ? 'has-error' : ''}`}>
          <label htmlFor="status">Status</label>
          <select id="status" value={values.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.status && <div className="error-text">{errors.status}</div>}
        </div>
      </div>
      <div className={`field ${errors.address ? 'has-error' : ''}`}>
        <label htmlFor="address">Address</label>
        <textarea id="address" rows={3} value={values.address} onChange={set('address')} />
        {errors.address && <div className="error-text">{errors.address}</div>}
      </div>
      <div className="modal-actions" style={{ marginTop: 10 }}>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
