/**
 * BurnoutBarChart.jsx
 * Bar chart showing burnout level distribution.
 */

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function BurnoutBarChart({ data }) {
  const { low = 0, moderate = 0, high = 0, critical = 0 } = data || {}

  const chartData = {
    labels: ['Healthy', 'Moderate', 'At Risk', 'Critical'],
    datasets: [
      {
        label: 'Employees',
        data: [low, moderate, high, critical],
        backgroundColor: ['#bbead1', '#fde68a', '#fed7aa', '#fecaca'],
        borderColor: ['#3aa471', '#f59e0b', '#f97316', '#ef4444'],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
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
          label: (ctx) => `  ${ctx.parsed.y} employees`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'DM Sans' }, color: '#9e9282' },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 11, family: 'DM Sans' },
          color: '#9e9282',
        },
        grid: { color: '#f4f2ee' },
        border: { display: false },
      },
    },
  }

  return (
    <div style={{ height: 220 }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
