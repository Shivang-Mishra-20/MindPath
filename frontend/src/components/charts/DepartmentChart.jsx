/**
 * DepartmentChart.jsx
 * Horizontal bar chart for headcount by department.
 */

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function DepartmentChart({ data }) {
  // Sort descending by count
  const sorted = [...(data || [])].sort((a, b) => b.emp_count - a.emp_count)

  const chartData = {
    labels: sorted.map((d) => d.name),
    datasets: [
      {
        data: sorted.map((d) => d.emp_count),
        backgroundColor: '#ccdccc',
        borderColor: '#528052',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#a4c0a4',
      },
    ],
  }

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `  ${ctx.parsed.x} employees`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 11, family: 'DM Sans' },
          color: '#9e9282',
        },
        grid: { color: '#f4f2ee' },
        border: { display: false },
      },
      y: {
        ticks: {
          font: { size: 11, family: 'DM Sans' },
          color: '#5a5048',
        },
        grid: { display: false },
        border: { display: false },
      },
    },
  }

  const height = Math.max(200, sorted.length * 36)

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
