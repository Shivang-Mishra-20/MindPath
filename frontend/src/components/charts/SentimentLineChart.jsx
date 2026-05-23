/**
 * SentimentLineChart.jsx
 * Line chart showing sentiment score trend over weeks.
 */

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function SentimentLineChart({ assessments }) {
  // Sort oldest first
  const sorted = [...(assessments || [])].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  ).slice(-10) // last 10

  const labels = sorted.map((a) => `Wk ${a.week_number}`)
  const scores = sorted.map((a) => parseFloat(a.sentiment_score || 0).toFixed(2))

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sentiment Score',
        data: scores,
        borderColor: '#528052',
        backgroundColor: 'rgba(82,128,82,0.08)',
        pointBackgroundColor: scores.map((s) =>
          s >= 0.3 ? '#3aa471' : s >= -0.1 ? '#f59e0b' : '#ef4444'
        ),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = parseFloat(ctx.parsed.y)
            const mood = val >= 0.3 ? 'Positive' : val >= -0.1 ? 'Neutral' : 'Negative'
            return `  Score: ${ctx.parsed.y} (${mood})`
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 11, family: 'DM Sans' }, color: '#9e9282' },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        min: -1,
        max: 1,
        ticks: {
          font: { size: 11, family: 'DM Sans' },
          color: '#9e9282',
          callback: (v) => v.toFixed(1),
        },
        grid: { color: '#f4f2ee' },
        border: { display: false },
      },
    },
  }

  if (!sorted.length) {
    return (
      <div className="flex items-center justify-center h-32 text-warm-400 text-sm">
        No assessment data yet
      </div>
    )
  }

  return (
    <div style={{ height: 180 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
