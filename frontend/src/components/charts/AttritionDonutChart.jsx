/**
 * AttritionDonutChart.jsx
 * Donut chart showing attrition risk distribution using Chart.js
 */

import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function AttritionDonutChart({ data }) {
  const { low = 0, medium = 0, high = 0, critical = 0 } = data || {}
  const total = low + medium + high + critical

  const chartData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: [low, medium, high, critical],
        backgroundColor: ['#3aa471', '#f59e0b', '#f97316', '#ef4444'],
        borderColor: ['#fff', '#fff', '#fff', '#fff'],
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: { size: 12, family: 'DM Sans' },
          color: '#5a5048',
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0
            return `  ${ctx.label}: ${ctx.parsed} (${pct}%)`
          },
        },
      },
    },
  }

  return (
    <div className="relative">
      <div style={{ height: 240 }}>
        <Doughnut data={chartData} options={options} />
      </div>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ paddingBottom: 40 }}>
        <span className="text-2xl font-display font-semibold text-warm-900">{total}</span>
        <span className="text-xs text-warm-400">employees</span>
      </div>
    </div>
  )
}
