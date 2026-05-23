/**
 * DashboardPage.jsx
 * Main analytics overview dashboard.
 */

import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import AttritionDonutChart from '../components/charts/AttritionDonutChart'
import BurnoutBarChart from '../components/charts/BurnoutBarChart'
import DepartmentChart from '../components/charts/DepartmentChart'

// Icons
const PeopleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await analyticsAPI.dashboard()
        setStats(response.data)
      } catch (err) {
        setError('Failed to load dashboard data.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500">{error}</p>
        <button className="btn-secondary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  const { employee_overview, attrition_risk_distribution, burnout_distribution,
          department_breakdown, average_scores } = stats || {}

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics Overview</h1>
        <p className="page-subtitle">
          Real-time workforce health — {employee_overview?.total || 0} employees across {department_breakdown?.length || 0} departments
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Employees"
          value={employee_overview?.total ?? '—'}
          subtitle={`${employee_overview?.active ?? 0} active`}
          icon={PeopleIcon}
          color="sage"
        />
        <StatCard
          label="High Risk"
          value={employee_overview?.high_risk ?? '—'}
          subtitle="Attrition risk"
          icon={AlertIcon}
          color="red"
        />
        <StatCard
          label="On Leave"
          value={employee_overview?.on_leave ?? '—'}
          subtitle="Currently absent"
          icon={HeartIcon}
          color="amber"
        />
        <StatCard
          label="Avg Performance"
          value={average_scores?.performance_rating
            ? `${(average_scores.performance_rating / 4 * 100).toFixed(0)}%`
            : '—'}
          subtitle="Team average"
          icon={StarIcon}
          color="mint"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-sm font-semibold text-warm-800 mb-4">Attrition Risk Distribution</h2>
          {attrition_risk_distribution ? (
            <AttritionDonutChart data={attrition_risk_distribution} />
          ) : (
            <p className="text-warm-400 text-sm text-center py-8">No prediction data yet.<br/>Run predictions from Attrition page.</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-warm-800 mb-4">Burnout Level Breakdown</h2>
          {burnout_distribution ? (
            <BurnoutBarChart data={burnout_distribution} />
          ) : (
            <p className="text-warm-400 text-sm text-center py-8">No assessment data yet.</p>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department breakdown chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-warm-800 mb-4">Headcount by Department</h2>
          {department_breakdown?.length > 0 ? (
            <DepartmentChart data={department_breakdown} />
          ) : (
            <p className="text-warm-400 text-sm text-center py-8">No department data.</p>
          )}
        </div>

        {/* Average scores */}
        <div className="card">
          <h2 className="text-sm font-semibold text-warm-800 mb-4">Avg Scores (out of 4)</h2>
          <div className="space-y-4">
            {average_scores && Object.entries({
              'Job Satisfaction': average_scores.job_satisfaction,
              'Work-Life Balance': average_scores.work_life_balance,
              'Performance': average_scores.performance_rating,
              'Attendance': (average_scores.attendance / 25), // normalize 100 → 4
            }).map(([label, val]) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-warm-500 mb-1">
                  <span>{label}</span>
                  <span className="font-medium text-warm-800">{val?.toFixed(1) ?? '—'}</span>
                </div>
                <div className="risk-bar">
                  <div
                    className="h-full rounded-full bg-sage-400 transition-all duration-700"
                    style={{ width: `${Math.min((val / 4) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
