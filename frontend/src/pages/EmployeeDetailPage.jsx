/**
 * EmployeeDetailPage.jsx
 * Full employee profile: details, attrition risk, burnout trend, and performance reviews.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { employeeAPI, analyticsAPI, burnoutAPI, reviewAPI } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { RiskBadge, RiskBar, SentimentBadge } from '../components/common/RiskIndicator'
import SentimentLineChart from '../components/charts/SentimentLineChart'
import {
  getInitials, avatarColor, formatCurrency, formatDate,
  satisfactionLabel, performanceLabel, formatSentiment
} from '../utils/helpers'

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-warm-50 last:border-0">
    <span className="text-xs text-warm-400">{label}</span>
    <span className="text-sm font-medium text-warm-800">{value ?? '—'}</span>
  </div>
)

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, burnRes, revRes] = await Promise.all([
          employeeAPI.get(id),
          burnoutAPI.list(id),
          reviewAPI.list(id),
        ])
        setEmployee(empRes.data)
        setAssessments(burnRes.data)
        setReviews(revRes.data)
      } catch (err) {
        setError('Failed to load employee data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handlePredict = async () => {
    setPredicting(true)
    try {
      const res = await analyticsAPI.predictEmployee(id)
      setPrediction(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setPredicting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading profile..." />
    </div>
  )

  if (error || !employee) return (
    <div className="card flex flex-col items-center gap-3 py-16">
      <p className="text-warm-500">{error || 'Employee not found.'}</p>
      <button className="btn-secondary" onClick={() => navigate('/employees')}>Go back</button>
    </div>
  )

  const latestAssessment = assessments[0]
  const sentimentInfo = latestAssessment ? formatSentiment(latestAssessment.sentiment_score) : null

  return (
    <div className="fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-800
                   mb-6 transition-colors"
      >
        <BackIcon /> Back to Employees
      </button>

      {/* Header card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                          text-white text-xl font-semibold flex-shrink-0 ${avatarColor(employee.full_name)}`}>
            {getInitials(employee.full_name)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-xl font-display font-semibold text-warm-900">{employee.full_name}</h1>
              <span className={`badge border text-xs ${
                employee.status === 'active' ? 'badge-low' :
                employee.status === 'on_leave' ? 'badge-medium' : 'badge-critical'
              }`}>
                {employee.status === 'on_leave' ? 'On Leave' :
                  employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
              </span>
            </div>
            <p className="text-warm-500 text-sm">{employee.job_role} · {employee.department_name || '—'}</p>
            <p className="text-warm-400 text-xs mt-1">{employee.employee_id} · {employee.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePredict}
              disabled={predicting}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {predicting ? (
                <><LoadingSpinner size="sm" /> Predicting...</>
              ) : '⚡ Run Attrition Prediction'}
            </button>
          </div>
        </div>

        {/* Prediction result banner */}
        {prediction && (
          <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between
            ${prediction.risk_level === 'critical' ? 'bg-red-50 border-red-200' :
              prediction.risk_level === 'high' ? 'bg-orange-50 border-orange-200' :
              prediction.risk_level === 'medium' ? 'bg-amber-50 border-amber-200' :
              'bg-mint-50 border-mint-200'}`}>
            <div>
              <p className="text-xs font-medium text-warm-600 mb-1">Attrition Risk Score</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-display font-bold text-warm-900">
                  {Math.round(prediction.risk_score * 100)}%
                </span>
                <RiskBadge level={prediction.risk_level} />
              </div>
              {prediction.top_factors?.length > 0 && (
                <p className="text-xs text-warm-500 mt-1">
                  Top factor: {prediction.top_factors[0]?.feature}
                </p>
              )}
            </div>
            <div className="w-32">
              <RiskBar score={prediction.risk_score} level={prediction.risk_level} />
            </div>
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Employee info */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-sm font-semibold text-warm-800 mb-3">Personal Info</h2>
            <InfoRow label="Age" value={employee.age} />
            <InfoRow label="Gender" value={employee.gender === 'M' ? 'Male' : employee.gender === 'F' ? 'Female' : 'Other'} />
            <InfoRow label="Marital Status" value={employee.marital_status} />
            <InfoRow label="Education" value={['','Below College','College','Bachelor','Master','Doctor'][employee.education]} />
            <InfoRow label="Hire Date" value={formatDate(employee.hire_date)} />
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-warm-800 mb-3">Compensation</h2>
            <InfoRow label="Monthly Income" value={formatCurrency(employee.monthly_income)} />
            <InfoRow label="Salary Hike" value={`${employee.percent_salary_hike}%`} />
            <InfoRow label="Job Level" value={`L${employee.job_level}`} />
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-warm-800 mb-3">Work Patterns</h2>
            <InfoRow label="Business Travel" value={employee.business_travel.replace(/_/g, ' ')} />
            <InfoRow label="Overtime" value={employee.overtime ? 'Yes' : 'No'} />
            <InfoRow label="Distance from Home" value={`${employee.distance_from_home} km`} />
            <InfoRow label="Companies Worked" value={employee.num_companies_worked} />
          </div>
        </div>

        {/* Middle: Satisfaction + Tenure */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-sm font-semibold text-warm-800 mb-4">Satisfaction Scores</h2>
            {[
              { label: 'Job Satisfaction', val: employee.job_satisfaction },
              { label: 'Environment', val: employee.environment_satisfaction },
              { label: 'Relationship', val: employee.relationship_satisfaction },
              { label: 'Work-Life Balance', val: employee.work_life_balance },
            ].map(({ label, val }) => (
              <div key={label} className="mb-3">
                <div className="flex justify-between text-xs text-warm-500 mb-1">
                  <span>{label}</span>
                  <span className="font-medium text-warm-700">{satisfactionLabel(val)}</span>
                </div>
                <div className="risk-bar">
                  <div
                    className="h-full rounded-full bg-sage-400 transition-all duration-500"
                    style={{ width: `${(val / 4) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-warm-800 mb-3">Tenure & Experience</h2>
            <InfoRow label="Years at Company" value={`${employee.years_at_company} yrs`} />
            <InfoRow label="In Current Role" value={`${employee.years_in_current_role} yrs`} />
            <InfoRow label="Since Last Promotion" value={`${employee.years_since_last_promotion} yrs`} />
            <InfoRow label="With Curr. Manager" value={`${employee.years_with_curr_manager} yrs`} />
            <InfoRow label="Total Working Exp." value={`${employee.total_working_years} yrs`} />
            <InfoRow label="Trainings Last Year" value={employee.training_times_last_year} />
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-warm-800 mb-3">Performance</h2>
            <InfoRow label="Rating" value={performanceLabel(employee.performance_rating)} />
            <InfoRow label="Attendance" value={`${employee.attendance_percentage}%`} />
            <div className="mt-3">
              <div className="flex justify-between text-xs text-warm-500 mb-1">
                <span>Attendance Rate</span>
                <span>{employee.attendance_percentage}%</span>
              </div>
              <div className="risk-bar">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${employee.attendance_percentage}%`,
                    backgroundColor: employee.attendance_percentage >= 90 ? '#3aa471' :
                      employee.attendance_percentage >= 75 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Burnout + Reviews */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-sm font-semibold text-warm-800 mb-3">Burnout Sentiment Trend</h2>
            <SentimentLineChart assessments={assessments} />
            {latestAssessment && (
              <div className="mt-3 pt-3 border-t border-warm-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-warm-400">Latest assessment</span>
                  <SentimentBadge level={latestAssessment.burnout_level} />
                </div>
                <p className="text-xs text-warm-500 line-clamp-2">{latestAssessment.assessment_text}</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-warm-800 mb-3">
              Performance Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-xs text-warm-400 text-center py-4">No reviews yet.<br/>Generate one from the Performance AI page.</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 3).map((rev) => (
                  <div key={rev.id} className="p-3 bg-warm-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-warm-700">{rev.review_period}</span>
                      {rev.is_finalized && (
                        <span className="badge badge-low text-[10px]">Finalized</span>
                      )}
                    </div>
                    <p className="text-xs text-warm-500 line-clamp-2">{rev.final_review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
