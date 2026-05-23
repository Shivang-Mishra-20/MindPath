/**
 * BurnoutPage.jsx
 * Submit weekly burnout assessments and monitor team sentiment/burnout trends.
 */

import { useState, useEffect } from 'react'
import { burnoutAPI, employeeAPI } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { SentimentBadge } from '../components/common/RiskIndicator'
import { formatDate, formatSentiment, burnoutColor, getInitials, avatarColor } from '../utils/helpers'
import BurnoutBarChart from '../components/charts/BurnoutBarChart'

function getCurrentWeek() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7)
  return { week, year: now.getFullYear() }
}

export default function BurnoutPage() {
  const [assessments, setAssessments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // overview | submit
  const [message, setMessage] = useState(null)

  // Form state
  const [form, setForm] = useState({
    employee: '',
    assessment_text: '',
    week_number: getCurrentWeek().week,
    year: getCurrentWeek().year,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [aRes, eRes] = await Promise.all([
        burnoutAPI.list(),
        employeeAPI.list({ status: 'active' }),
      ])
      setAssessments(aRes.data)
      setEmployees(eRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employee || !form.assessment_text.trim()) {
      setMessage({ type: 'error', text: 'Please select an employee and enter assessment text.' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      await burnoutAPI.submit(form)
      setMessage({ type: 'success', text: '✓ Assessment submitted and analyzed successfully.' })
      setForm({ ...form, assessment_text: '', employee: '' })
      await loadData()
      setActiveTab('overview')
    } catch (err) {
      const errMsg = err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail || 'Submission failed.'
      setMessage({ type: 'error', text: errMsg })
    } finally {
      setSubmitting(false)
    }
  }

  // Aggregate burnout distribution
  const burnoutDist = assessments.reduce(
    (acc, a) => { if (a.burnout_level) acc[a.burnout_level] = (acc[a.burnout_level] || 0) + 1; return acc },
    { low: 0, moderate: 0, high: 0, critical: 0 }
  )

  // Critical/high burnout alerts
  const alerts = assessments.filter((a) => a.burnout_level === 'critical' || a.burnout_level === 'high')

  const PROMPT_SUGGESTIONS = [
    "This week I felt overwhelmed with deadlines and couldn't disconnect after hours. My energy levels are very low.",
    "Had a productive week! Finished my tasks, collaborated well with the team. Feeling motivated and balanced.",
    "Struggling with unclear expectations from management. Feeling anxious and stressed about upcoming reviews.",
    "Great week overall. Good work-life balance, completed projects, team was supportive.",
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading burnout data..." />
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Burnout Monitor</h1>
        <p className="page-subtitle">
          NLP-powered sentiment analysis — {assessments.length} assessments recorded
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-warm-100 rounded-xl w-fit mb-6">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'submit', label: '+ Submit Assessment' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white text-warm-900 shadow-card'
                : 'text-warm-500 hover:text-warm-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-5 p-3 rounded-xl border text-sm ${
          message.type === 'success'
            ? 'bg-mint-50 border-mint-200 text-mint-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {activeTab === 'overview' ? (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { level: 'low', label: 'Healthy', color: 'text-mint-600' },
              { level: 'moderate', label: 'Moderate', color: 'text-amber-600' },
              { level: 'high', label: 'At Risk', color: 'text-orange-600' },
              { level: 'critical', label: 'Critical', color: 'text-red-600' },
            ].map(({ level, label, color }) => (
              <div key={level} className="card text-center">
                <p className="text-xs text-warm-400 mb-1">{label}</p>
                <p className={`text-3xl font-display font-bold ${color}`}>
                  {burnoutDist[level] || 0}
                </p>
                <p className="text-xs text-warm-400">assessments</p>
              </div>
            ))}
          </div>

          {/* Chart + Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h2 className="text-sm font-semibold text-warm-800 mb-4">Burnout Distribution</h2>
              <BurnoutBarChart data={burnoutDist} />
            </div>

            <div className="card">
              <h2 className="text-sm font-semibold text-warm-800 mb-3">
                {alerts.length > 0 ? `⚠️ ${alerts.length} Active Alerts` : 'Active Alerts'}
              </h2>
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <span className="text-2xl">🌿</span>
                  <p className="text-sm text-warm-400">No critical or high-risk employees detected.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.map((a) => (
                    <div key={a.id} className={`p-3 rounded-xl border ${
                      a.burnout_level === 'critical' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center
                                          text-white text-[10px] font-bold flex-shrink-0
                                          ${avatarColor(a.employee_name)}`}>
                            {getInitials(a.employee_name)}
                          </div>
                          <span className="text-xs font-medium text-warm-800">{a.employee_name}</span>
                        </div>
                        <SentimentBadge level={a.burnout_level} />
                      </div>
                      <p className="text-[11px] text-warm-500 line-clamp-2 pl-8">{a.assessment_text}</p>
                      <p className="text-[10px] text-warm-400 pl-8 mt-0.5">
                        Week {a.week_number}/{a.year} · Score: {parseFloat(a.sentiment_score).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent assessments table */}
          <div className="card overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-warm-100">
              <h2 className="text-sm font-semibold text-warm-800">Recent Assessments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-warm-50 border-b border-warm-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-warm-500">Employee</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Week</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Sentiment</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Score</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Burnout Level</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-warm-500">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.slice(0, 20).map((a) => {
                    const sent = formatSentiment(a.sentiment_score)
                    return (
                      <tr key={a.id} className="border-b border-warm-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center
                                            text-white text-[10px] font-bold ${avatarColor(a.employee_name)}`}>
                              {getInitials(a.employee_name)}
                            </div>
                            <span className="text-xs font-medium text-warm-800">{a.employee_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-warm-500">Wk {a.week_number}/{a.year}</td>
                        <td className={`px-4 py-3 text-xs font-medium ${sent.color}`}>{sent.text}</td>
                        <td className="px-4 py-3 text-xs font-mono text-warm-600">
                          {parseFloat(a.sentiment_score).toFixed(3)}
                        </td>
                        <td className="px-4 py-3">
                          <SentimentBadge level={a.burnout_level} />
                        </td>
                        <td className="px-4 py-3 text-xs text-warm-400 max-w-xs">
                          <span className="line-clamp-1">{a.assessment_text}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {assessments.length === 0 && (
                <div className="text-center py-12 text-warm-400 text-sm">
                  No assessments yet. Submit one using the "Submit Assessment" tab.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Submit assessment form */
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-base font-semibold text-warm-900 mb-1">Weekly Burnout Assessment</h2>
            <p className="text-sm text-warm-500 mb-6">
              Employee describes their weekly experience. The AI analyzes sentiment to detect burnout signals.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Employee selector */}
              <div>
                <label className="label">Employee *</label>
                <select
                  value={form.employee}
                  onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select employee...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} — {e.department_name} ({e.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Week/Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Week Number</label>
                  <input
                    type="number"
                    min="1" max="53"
                    value={form.week_number}
                    onChange={(e) => setForm({ ...form, week_number: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Year</label>
                  <input
                    type="number"
                    min="2020" max="2030"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>

              {/* Assessment text */}
              <div>
                <label className="label">Assessment Text *</label>
                <textarea
                  value={form.assessment_text}
                  onChange={(e) => setForm({ ...form, assessment_text: e.target.value })}
                  className="input min-h-32 resize-none"
                  placeholder="Describe how the employee felt this week — their energy level, stress, workload, team dynamics, and overall wellbeing..."
                  rows={5}
                  required
                />
                <p className="text-xs text-warm-400 mt-1">
                  {form.assessment_text.length} characters · NLP model analyzes tone and sentiment
                </p>
              </div>

              {/* Sample prompts */}
              <div>
                <p className="text-xs font-medium text-warm-500 mb-2">Sample inputs (click to use):</p>
                <div className="space-y-2">
                  {PROMPT_SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm({ ...form, assessment_text: suggestion })}
                      className="w-full text-left text-xs p-3 bg-warm-50 border border-warm-100
                                 rounded-xl text-warm-600 hover:bg-sage-50 hover:border-sage-200
                                 transition-colors line-clamp-2"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" /> Analyzing sentiment...
                  </span>
                ) : '🧠 Submit & Analyze'}
              </button>
            </form>
          </div>

          {/* How it works */}
          <div className="card mt-4 bg-sage-50 border-sage-200">
            <h3 className="text-xs font-semibold text-sage-700 mb-2">How it works</h3>
            <ol className="text-xs text-sage-600 space-y-1.5">
              <li>1. HR enters the employee's weekly self-assessment text</li>
              <li>2. DistilBERT sentiment model analyzes the tone (-1 to +1)</li>
              <li>3. Score is mapped to burnout level: Healthy / Moderate / At Risk / Critical</li>
              <li>4. Results are stored and visualized in the dashboard</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
