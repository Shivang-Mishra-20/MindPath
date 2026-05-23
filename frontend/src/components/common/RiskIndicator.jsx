/**
 * Risk display components: Badge and progress bar.
 */

import { getRiskBadgeClass, getRiskColor, formatRiskScore } from '../../utils/helpers'

export function RiskBadge({ level }) {
  if (!level) return null
  return (
    <span className={getRiskBadgeClass(level)}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}

export function RiskBar({ score, level, showLabel = true }) {
  const color = getRiskColor(level || (score < 0.25 ? 'low' : score < 0.5 ? 'medium' : score < 0.75 ? 'high' : 'critical'))
  const percentage = Math.round((score || 0) * 100)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-warm-400">Risk Score</span>
          <span className="text-xs font-medium" style={{ color }}>{percentage}%</span>
        </div>
      )}
      <div className="risk-bar">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export function SentimentBadge({ level }) {
  const map = {
    low: 'badge-low',
    moderate: 'badge-medium',
    high: 'badge-high',
    critical: 'badge-critical',
  }
  const labels = {
    low: 'Healthy',
    moderate: 'Moderate',
    high: 'At Risk',
    critical: 'Critical',
  }
  if (!level) return null
  return (
    <span className={map[level] || 'badge-medium'}>
      {labels[level] || level}
    </span>
  )
}
