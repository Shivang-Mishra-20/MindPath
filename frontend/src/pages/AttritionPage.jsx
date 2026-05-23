/**
 * AttritionPage.jsx
 * Attrition risk prediction dashboard: run predictions, view all employee risk scores.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsAPI, employeeAPI } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { RiskBadge, RiskBar } from '../components/common/RiskIndicator'
import { getInitials, avatarColor, formatRiskScore } from '../utils/helpers'
import AttritionDonutChart from '../components/charts/AttritionDonutChart'

export default function AttritionPage() {
  const navigate = useNavigate()
  const [predictions, setPredictions] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [runningAll, setRunningAll] = useState(false)
  const [sortBy, setSortBy] = useState('risk_score') // risk_score | name
  const [filterLevel, setFilterLevel] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [predRes, empRes] = await Promise.all([
        analyticsAPI.attritionList(),
        employeeAPI.list({ status: 'active' }),
      ])
      setPredictions(predRes.data)
      setEmployees(empRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePredictAll = async () => {
    setRunningAll(true)
    setMessage('')
    try {
      const res = await analyticsAPI.predictAll()
      setMessage(`✓ Predictions complete for ${res.data.total} employees.`)
      await loadData()
    } catch (err) {
      setMessage('Failed to run predictions. Please try again.')
    } finally {
      setRunningAll(false)
    }
  }

  // Aggregate risk distribution for chart
  const riskDistribution = predictions.reduce(
    (acc, p) => { acc[p.risk_level] = (acc[p.risk_level] || 0) + 1; return acc },
    { low: 0, medium: 0, high: 0, critical: 0 }
  )

  // Filter + sort
  const filtered = predictions
    .filter((p) => !filterLevel || p.risk_level === filterLevel)
    .sort((a, b) => {
      if (sortBy === 'risk_score') return b.risk_score - a.risk_score
      return (a.employee_name || '').localeCompare(b.employee_name || '')
    })

  const highRisk = predictions.filter((p) => p.risk_level === 'high' || p.risk_level === 'critical')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading attrition data..." />
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Attrition Risk</h1>
          <p className="page-subtitle">
            ML-powered flight-risk scores — {employees.length} active employees
          </p>
        </div>
        <button
          onClick={handlePredictAll}
          disabled={runningAll}
          className="btn-primary flex items-center gap-2 text-sm flex-shrink-0"
        >
          {runningAll ? (
            <><LoadingSpinner size="sm" /> Running predictions...</>
          ) : '⚡ Predict All Employees'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl border text-sm ${
          message.startsWith('✓') ? 'bg-mint-50 border-mint-200 text-mint-700' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {message}
        </div>
      )}

      {predictions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 bg-sage-50 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#528052" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="font-medium text-warm-800 mb-1">No predictions yet</p>
            <p className="text-sm text-warm-400">Click "Predict All Employees" to run the ML model on your workforce.</p>
          </div>
          <button onClick={handlePredictAll} disabled={runningAll} className="btn-primary">
            {runningAll ? 'Running...' : 'Run Attrition Analysis'}
          </button>
        </div>
      ) : (
        <>
          {/* Top: summary + chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Summary cards */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { level: 'critical', label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' },
                { level: 'high', label: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-50' },
                { level: 'medium', label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50' },
                { level: 'low', label: 'Low Risk', color: 'text-mint-600', bg: 'bg-mint-50' },
              ].map(({ level, label, color, bg }) => (
                <div
                  key={level}
                  className={`card cursor-pointer border-2 transition-all ${
                    filterLevel === level ? 'border-sage-400' : 'border-transparent'
                  }`}
                  onClick={() => setFilterLevel(filterLevel === level ? '' : level)}
                >
                  <p className="text-xs text-warm-400 mb-1">{label}</p>
                  <p className={`text-3xl font-display font-bold ${color}`}>
                    {riskDistribution[level] || 0}
                  </p>
                  <p className="text-xs text-warm-400">employees</p>
                </div>
              ))}
            </div>

            {/* Donut chart */}
            <div className="card">
              <h2 className="text-sm font-semibold text-warm-800 mb-2">Risk Distribution</h2>
              <AttritionDonutChart data={riskDistribution} />
            </div>
          </div>

          {/* High risk alert strip */}
          {highRisk.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-700">
                  {highRisk.length} employees require immediate attention
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {highRisk.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/employees/${p.employee}`)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200
                               rounded-xl text-xs text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold ${avatarColor(p.employee_name)}`}>
                      {getInitials(p.employee_name)}
                    </span>
                    {p.employee_name}
                    <span className="font-bold">{formatRiskScore(p.risk_score)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Table controls */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-warm-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-warm-200 rounded-lg px-2 py-1.5 bg-white text-warm-700"
              >
                <option value="risk_score">Risk Score</option>
                <option value="name">Name</option>
              </select>
              {filterLevel && (
                <button
                  onClick={() => setFilterLevel('')}
                  className="text-xs text-sage-600 hover:text-sage-800 underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <span className="text-xs text-warm-400">{filtered.length} employees</span>
          </div>

          {/* Predictions table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-warm-50 border-b border-warm-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-warm-500">Employee</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Department</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Risk Score</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Level</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Top Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-warm-50 hover:bg-warm-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/employees/${p.employee}`)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                                          text-white text-[10px] font-semibold flex-shrink-0
                                          ${avatarColor(p.employee_name)}`}>
                            {getInitials(p.employee_name)}
                          </div>
                          <div>
                            <p className="font-medium text-warm-900 text-xs">{p.employee_name}</p>
                            <p className="text-warm-400 text-[10px]">{p.employee_id_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-warm-600">{p.department || '—'}</td>
                      <td className="px-4 py-3 text-xs text-warm-600">{p.job_role || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <RiskBar score={p.risk_score} level={p.risk_level} showLabel={false} />
                          </div>
                          <span className="text-xs font-medium text-warm-700">{formatRiskScore(p.risk_score)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={p.risk_level} />
                      </td>
                      <td className="px-4 py-3 text-xs text-warm-500">
                        {p.top_factors?.[0]?.feature || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
