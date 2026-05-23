/**
 * EmployeesPage.jsx
 * Employee directory with search, filter, and navigation to detail.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeAPI } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getInitials, avatarColor, formatCurrency, performanceLabel } from '../utils/helpers'

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const STATUS_COLORS = {
  active: 'bg-mint-50 text-mint-700 border-mint-200',
  on_leave: 'bg-amber-50 text-amber-700 border-amber-200',
  terminated: 'bg-red-50 text-red-600 border-red-200',
}

export default function EmployeesPage() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          employeeAPI.list(),
          employeeAPI.departments(),
        ])
        setEmployees(empRes.data)
        setDepartments(deptRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Client-side filtering
  const filtered = employees.filter((emp) => {
    const matchSearch = !search ||
      emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      emp.job_role.toLowerCase().includes(search.toLowerCase())
    const matchDept = !deptFilter || emp.department_name === deptFilter
    const matchStatus = !statusFilter || emp.status === statusFilter
    return matchSearch && matchDept && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading employees..." />
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{filtered.length} of {employees.length} employees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or role..."
              className="input pl-9"
            />
          </div>

          {/* Department filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full sm:w-36"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Employee grid */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-warm-400">No employees match your filters.</p>
          <button className="btn-secondary" onClick={() => { setSearch(''); setDeptFilter(''); setStatusFilter('') }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="card-hover cursor-pointer"
              onClick={() => navigate(`/employees/${emp.id}`)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                                text-white text-sm font-semibold flex-shrink-0 ${avatarColor(emp.full_name)}`}>
                  {getInitials(emp.full_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-warm-900 truncate text-sm">{emp.full_name}</h3>
                    <span className={`badge border text-xs flex-shrink-0 ${STATUS_COLORS[emp.status]}`}>
                      {emp.status === 'on_leave' ? 'On Leave' : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-warm-500 truncate">{emp.job_role}</p>
                  <p className="text-xs text-warm-400">{emp.department_name} · {emp.employee_id}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-warm-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-warm-400">Tenure</p>
                  <p className="text-sm font-medium text-warm-800">{emp.years_at_company}y</p>
                </div>
                <div>
                  <p className="text-xs text-warm-400">Attendance</p>
                  <p className="text-sm font-medium text-warm-800">{emp.attendance_percentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-warm-400">Performance</p>
                  <p className="text-sm font-medium text-warm-800">{performanceLabel(emp.performance_rating)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
