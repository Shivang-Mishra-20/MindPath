/**
 * PerformanceReviewPage.jsx
 * Generate AI performance reviews using Gemini API and edit/finalize them.
 */

import { useState, useEffect } from 'react'
import { reviewAPI, employeeAPI } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getInitials, avatarColor, formatDate } from '../utils/helpers'

const REVIEW_PERIODS = [
  'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024',
  'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025',
  'Annual 2024', 'Annual 2025',
  'Mid-Year 2024', 'Mid-Year 2025',
]

export default function PerformanceReviewPage() {
  const [reviews, setReviews] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('reviews')
  const [selectedReview, setSelectedReview] = useState(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // Generate form
  const [genForm, setGenForm] = useState({
    employee_id: '',
    period: 'Q4 2024',
    reviewer_notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [revRes, empRes] = await Promise.all([
        reviewAPI.list(),
        employeeAPI.list({ status: 'active' }),
      ])
      setReviews(revRes.data)
      setEmployees(empRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!genForm.employee_id) {
      setMessage({ type: 'error', text: 'Please select an employee.' })
      return
    }
    setGenerating(true)
    setMessage(null)
    try {
      const res = await reviewAPI.generate(genForm.employee_id, genForm.period, genForm.reviewer_notes)
      setMessage({ type: 'success', text: '✓ Performance review generated successfully.' })
      await loadData()
      // Auto-open the generated review
      setSelectedReview(res.data)
      setEditText(res.data.final_review)
      setActiveTab('reviews')
      setGenForm({ ...genForm, employee_id: '', reviewer_notes: '' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Generation failed. Check your Gemini API key.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleSelectReview = (review) => {
    setSelectedReview(review)
    setEditText(review.final_review || review.generated_review)
  }

  const handleSave = async () => {
    if (!selectedReview) return
    setSaving(true)
    try {
      const res = await reviewAPI.update(selectedReview.id, {
        final_review: editText,
        is_finalized: true,
      })
      setSelectedReview(res.data)
      setReviews((prev) => prev.map((r) => r.id === res.data.id ? res.data : r))
      setMessage({ type: 'success', text: '✓ Review saved and finalized.' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (selectedReview) {
      setEditText(selectedReview.generated_review)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading reviews..." />
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Performance AI</h1>
        <p className="page-subtitle">
          Gemini-powered performance review generation — {reviews.length} reviews created
        </p>
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

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-warm-100 rounded-xl w-fit mb-6">
        {[
          { key: 'reviews', label: `Reviews (${reviews.length})` },
          { key: 'generate', label: '✨ Generate New' },
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

      {activeTab === 'generate' ? (
        <div className="max-w-2xl">
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#528052" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-warm-900">Generate AI Review</h2>
                <p className="text-xs text-warm-500">Powered by Google Gemini</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="label">Employee *</label>
                <select
                  value={genForm.employee_id}
                  onChange={(e) => setGenForm({ ...genForm, employee_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select employee...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} — {e.department_name} | {e.job_role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Review Period *</label>
                <select
                  value={genForm.period}
                  onChange={(e) => setGenForm({ ...genForm, period: e.target.value })}
                  className="input"
                >
                  {REVIEW_PERIODS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Reviewer Notes (optional)</label>
                <textarea
                  value={genForm.reviewer_notes}
                  onChange={(e) => setGenForm({ ...genForm, reviewer_notes: e.target.value })}
                  className="input resize-none"
                  placeholder="Any specific achievements, incidents, or areas to highlight that Gemini should incorporate..."
                  rows={3}
                />
              </div>

              <button type="submit" disabled={generating} className="btn-primary w-full py-3">
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" /> Generating with Gemini...
                  </span>
                ) : '✨ Generate Performance Review'}
              </button>
            </form>
          </div>

          <div className="card mt-4 bg-sage-50 border-sage-200">
            <h3 className="text-xs font-semibold text-sage-700 mb-2">How Gemini generates reviews</h3>
            <ol className="text-xs text-sage-600 space-y-1.5">
              <li>1. Employee data is structured: role, department, satisfaction scores, attendance</li>
              <li>2. A detailed prompt is sent to Gemini Pro with context and instructions</li>
              <li>3. Gemini generates a 250-350 word professional performance review</li>
              <li>4. Review is saved and can be edited by HR before finalizing</li>
              <li>5. Falls back to a template if GEMINI_API_KEY is not configured</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Review list */}
          <div className="lg:col-span-2">
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-warm-100">
                <p className="text-xs font-medium text-warm-500">All Reviews</p>
              </div>
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-warm-400 text-sm px-4">
                  No reviews yet.<br/>
                  <button onClick={() => setActiveTab('generate')} className="text-sage-600 underline mt-1">
                    Generate your first review
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-warm-50 max-h-[600px] overflow-y-auto">
                  {reviews.map((rev) => (
                    <button
                      key={rev.id}
                      onClick={() => handleSelectReview(rev)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-warm-50 transition-colors ${
                        selectedReview?.id === rev.id ? 'bg-sage-50 border-l-2 border-sage-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                        text-white text-xs font-semibold flex-shrink-0
                                        ${avatarColor(rev.employee_name)}`}>
                          {getInitials(rev.employee_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-medium text-warm-900 truncate">{rev.employee_name}</p>
                            {rev.is_finalized && (
                              <span className="badge badge-low text-[10px] flex-shrink-0">Final</span>
                            )}
                          </div>
                          <p className="text-[11px] text-warm-500">{rev.review_period}</p>
                          <p className="text-[11px] text-warm-400 mt-0.5">{formatDate(rev.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Review editor */}
          <div className="lg:col-span-3">
            {!selectedReview ? (
              <div className="card flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="#528052" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <p className="text-warm-500 text-sm">Select a review from the list to view and edit</p>
              </div>
            ) : (
              <div className="card">
                {/* Editor header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-warm-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                                    text-white text-sm font-semibold ${avatarColor(selectedReview.employee_name)}`}>
                      {getInitials(selectedReview.employee_name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-warm-900">{selectedReview.employee_name}</p>
                      <p className="text-xs text-warm-500">{selectedReview.review_period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedReview.is_finalized && (
                      <span className="badge badge-low">Finalized</span>
                    )}
                    <span className="text-xs text-warm-400">{formatDate(selectedReview.created_at)}</span>
                  </div>
                </div>

                {/* Editor info bar */}
                <div className="flex items-center gap-2 mb-3 p-2.5 bg-sage-50 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#528052" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span className="text-xs text-sage-600">AI-generated review. Edit freely before finalizing.</span>
                </div>

                {/* Editable textarea */}
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="input min-h-80 resize-none font-sans text-sm leading-relaxed"
                  rows={14}
                />

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={handleReset}
                    className="btn-ghost text-sm"
                  >
                    ↺ Reset to AI version
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedReview(null); setEditText('') }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary text-sm flex items-center gap-1.5"
                    >
                      {saving ? <><LoadingSpinner size="sm" /> Saving...</> : '✓ Save & Finalize'}
                    </button>
                  </div>
                </div>

                {/* Reviewer notes if present */}
                {selectedReview.reviewer_notes && (
                  <div className="mt-4 pt-4 border-t border-warm-100">
                    <p className="text-xs font-medium text-warm-500 mb-1">Original reviewer notes:</p>
                    <p className="text-xs text-warm-400 italic">{selectedReview.reviewer_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
