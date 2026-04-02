import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface StudentProgressChartProps {
  completed: number
  inProgress: number
  notStarted: number
}

export function StudentProgressChart({ completed, inProgress, notStarted }: StudentProgressChartProps) {
  const data = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Not Started', value: notStarted, color: '#e2e8f0' },
  ]

  const total = completed + inProgress + notStarted

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <span className="material-symbols-outlined text-4xl mb-2">military_tech</span>
        <p>No progress data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value: number, name: string) => {
            const percentage = ((value / total) * 100).toFixed(1)
            return [`${value} (${percentage}%)`, name]
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value: string, entry: { payload: { color: string; value: number } }) => {
            const percentage = ((entry.payload.value / total) * 100).toFixed(1)
            return `${value}: ${entry.payload.value} (${percentage}%)`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
