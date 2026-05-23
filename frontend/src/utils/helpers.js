/**
 * Shared utility functions for MindPath frontend.
 */

/**
 * Format risk level to display badge class
 */
export const getRiskBadgeClass = (level) => {
  const map = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    critical: 'badge-critical',
  }
  return map[level] || 'badge-medium'
}

/**
 * Format risk score (0-1) to percentage string
 */
export const formatRiskScore = (score) => {
  return `${Math.round(score * 100)}%`
}

/**
 * Get color for risk bar fill
 */
export const getRiskColor = (level) => {
  const map = {
    low: '#3aa471',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  }
  return map[level] || '#f59e0b'
}

/**
 * Map numeric satisfaction score to label
 */
export const satisfactionLabel = (score) => {
  const map = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High' }
  return map[score] || 'N/A'
}

/**
 * Map numeric performance rating to label
 */
export const performanceLabel = (score) => {
  const map = { 1: 'Low', 2: 'Good', 3: 'Excellent', 4: 'Outstanding' }
  return map[score] || 'N/A'
}

/**
 * Map burnout level to color
 */
export const burnoutColor = (level) => {
  const map = {
    low: '#3aa471',
    moderate: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  }
  return map[level] || '#9e9282'
}

/**
 * Format sentiment score to readable string
 */
export const formatSentiment = (score) => {
  if (score >= 0.3) return { text: 'Positive', color: 'text-mint-600' }
  if (score >= -0.1) return { text: 'Neutral', color: 'text-yellow-600' }
  if (score >= -0.5) return { text: 'Negative', color: 'text-orange-600' }
  return { text: 'Very Negative', color: 'text-red-600' }
}

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get initials from full name
 */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Format currency (Indian Rupees)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Generate a deterministic avatar background color from a string
 */
export const avatarColor = (str = '') => {
  const colors = [
    'bg-sage-400', 'bg-mint-400', 'bg-teal-400',
    'bg-cyan-400', 'bg-emerald-400', 'bg-green-500',
  ]
  const index = str.charCodeAt(0) % colors.length
  return colors[index]
}

/**
 * Truncate text to specified length
 */
export const truncate = (text, length = 100) => {
  if (!text) return ''
  return text.length > length ? `${text.substring(0, length)}...` : text
}
