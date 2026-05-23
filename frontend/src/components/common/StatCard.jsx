/**
 * StatCard: A metric card for the analytics dashboard.
 */

export default function StatCard({ label, value, subtitle, icon: Icon, color = 'sage', trend }) {
  const colorMap = {
    sage: 'bg-sage-50 text-sage-600',
    mint: 'bg-mint-50 text-mint-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-display font-semibold text-warm-900">{value}</p>
          {subtitle && <p className="text-xs text-warm-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium
                            ${trend.positive ? 'text-mint-600' : 'text-red-500'}`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.text}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
            <Icon />
          </div>
        )}
      </div>
    </div>
  )
}
