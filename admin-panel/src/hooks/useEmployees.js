import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { employeeService } from "../services/employeeService";

export function useEmployees() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(
    async (params = {}) => {
      if (!token) return { employees: [], totalCount: 0 };
      setLoading(true);
      setError(null);
      try {
        const result = await employeeService.getAll(token, params);
        const empList = result?.employees || [];
        const count = result?.totalCount || 0;
        setEmployees(empList);
        setTotalCount(count);
        return { employees: empList, totalCount: count };
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setError(err.message || "Failed to fetch employees");
        return { employees: [], totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const getEmployeeById = useCallback(
    async (id) => {
      if (!token || !id) return null;
      setLoading(true);
      setError(null);
      try {
        const result = await employeeService.getById(token, id);
        const record = result?.employee || null;
        setEmployee(record);
        return record;
      } catch (err) {
        console.error("Failed to fetch employee by id:", err);
        setError(err.message || "Failed to fetch employee");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const createEmployee = useCallback(
    async (data) => {
      if (!token) throw new Error("Cannot create employee: user is not logged in.");
      setLoading(true);
      setError(null);
      try {
        const result = await employeeService.create(token, data);
        const record = result?.employee || null;
        if (record) {
          setEmployees((prev) => [record, ...prev]);
          setTotalCount((c) => c + 1);
        }
        return record;
      } catch (err) {
        console.error("Failed to create employee:", err);
        setError(err.message || "Failed to create employee");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const updateEmployee = useCallback(
    async (id, patch) => {
      if (!token || !id) return null;
      setLoading(true);
      setError(null);
      try {
        const result = await employeeService.update(token, id, patch);
        const record = result?.employee || null;
        if (record) {
          setEmployees((prev) =>
            prev.map((e) => (e.id === id ? record : e))
          );
          setEmployee(record);
        }
        return record;
      } catch (err) {
        console.error("Failed to update employee:", err);
        setError(err.message || "Failed to update employee");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const updateEmployeeFull = useCallback(
    async (id, data) => {
      if (!token || !id) return null;
      setLoading(true);
      setError(null);
      try {
        const result = await employeeService.updateFull(token, id, data);
        const record = result?.employee || null;
        if (record) {
          setEmployees((prev) =>
            prev.map((e) => (e.id === id ? record : e))
          );
          setEmployee(record);
        }
        return record;
      } catch (err) {
        console.error("Failed to fully update employee:", err);
        setError(err.message || "Failed to update employee");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const updateEmployeeRole = useCallback(
    async (id, role) => {
      if (!token || !id) return null;
      setLoading(true);
      setError(null);
      try {
        const result = await employeeService.updateRole(token, id, role);
        const record = result?.employee || null;
        if (record) {
          setEmployees((prev) =>
            prev.map((e) => (e.id === id ? { ...e, role: record.role } : e))
          );
        }
        return record;
      } catch (err) {
        console.error("Failed to update role:", err);
        setError(err.message || "Failed to update role");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const deleteEmployee = useCallback(
    async (id) => {
      if (!token || !id) return false;
      setLoading(true);
      setError(null);
      try {
        await employeeService.remove(token, id);
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        setTotalCount((c) => Math.max(0, c - 1));
        return true;
      } catch (err) {
        console.error("Failed to delete employee:", err);
        setError(err.message || "Failed to delete employee");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const onboardEmployee = useCallback(
    async (data) => {
      if (!token) throw new Error("Cannot onboard: user is not logged in.");
      setLoading(true);
      setError(null);
      try {
        const result = await employeeService.onboard(token, data);
        return result;
      } catch (err) {
        console.error("Failed to onboard employee:", err);
        setError(err.message || "Failed to onboard employee");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return {
    employees,
    setEmployees,
    employee,
    setEmployee,
    totalCount,
    loading,
    error,
    fetchEmployees,
    fetchFilteredEmployees: fetchEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    editEmployee: updateEmployee,
    updateEmployeeFull,
    replaceEmployee: updateEmployeeFull,
    updateEmployeeRole,
    changeEmployeeRole: updateEmployeeRole,
    deleteEmployee,
    removeEmployee: deleteEmployee,
    onboardEmployee,
  };
}

export default useEmployees;
