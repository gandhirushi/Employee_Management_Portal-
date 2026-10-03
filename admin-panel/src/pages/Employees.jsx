import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, SlidersHorizontal } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import EmployeeTable from '../components/EmployeeTable';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { useEmployees } from '../hooks/useEmployees';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { DEPARTMENTS, POSITIONS } from '../constants/departments';

const EMPTY_FILTERS = { department: '', status: '', position: '', joinedAfter: '' };

export default function Employees() {
  const { removeEmployee, fetchFilteredEmployees } = useEmployees();
  const { showToast } = useToast();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [toDelete, setToDelete] = useState(null);
  
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadData = useCallback(async () => {
    const params = {
      search: debouncedSearch,
      department: filters.department,
      status: filters.status,
      position: filters.position,
      joinedAfter: filters.joinedAfter,
      page,
      limit: perPage,
      sortBy,
      sortOrder,
    };
    
    const data = await fetchFilteredEmployees(params);
    setEmployees(data.employees);
    setTotalCount(data.totalCount);
  }, [debouncedSearch, filters, page, perPage, sortBy, sortOrder, fetchFilteredEmployees]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  const handleSearchChange = (val) => { setSearch(val); setPage(1); };
  const handleFiltersChange = (val) => { setFilters(val); setPage(1); };
  const handleClearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };
  const handlePerPageChange = (val) => { setPerPage(val); setPage(1); };
  
  const handleSort = () => {
    let newOrder = 'asc';
    if (sortBy === 'name' && sortOrder === 'asc') {
      newOrder = 'desc';
    }
    setSortBy('name');
    setSortOrder(newOrder);
  };

  const handleDelete = async () => {
    const success = await removeEmployee(toDelete.id, toDelete.fullName);
    if (!success) {
      showToast("Error", "Failed to delete employee.");
      return;
    }
    setToDelete(null);
    loadData();
  };

  const handleRoleChanged = (id, newRole) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, role: newRole } : e))
    );
  };

  const canCreate = role === 'super_admin' || role === 'hr_admin';

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Directory</span>
          <h1>Employees</h1>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => navigate('/employees/add')}>
            <Plus size={16} /> Add employee
          </button>
        )}
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={handleSearchChange} />
        <button className="btn btn-secondary" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={handleFiltersChange}
          onClear={handleClearFilters}
          departments={DEPARTMENTS}
          positions={POSITIONS}
        />
      )}

      <EmployeeTable 
        employees={employees} 
        onDelete={setToDelete} 
        onSort={handleSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onRoleChanged={handleRoleChanged}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
        totalItems={totalCount}
      />

      <ConfirmModal
        open={!!toDelete}
        title="Delete employee?"
        description={toDelete ? `This will permanently remove ${toDelete.fullName} from the directory.` : ''}
        confirmLabel="Delete employee"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
