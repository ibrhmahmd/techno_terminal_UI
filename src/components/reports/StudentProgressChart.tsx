import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface StudentProgressChartProps {
  onTrack: number
  atRisk: number
  behind: number
}

export function StudentProgressChart({ onTrack, atRisk, behind }: StudentProgressChartProps) {
  const data = [
    { name: 'On Track', value: onTrack, color: '#006a61' },
    { name: 'At Risk', value: atRisk, color: '#f59e0b' },
    { name: 'Behind', value: behind, color: '#ef4444' },
  ]

  const total = onTrack + atRisk + behind

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <span className="material-symbols-outlined text-4xl mb-2" aria-hidden="true">military_tech</span>
        <p>No progress data available</p>
      </div>
    )
  }

  return (
    <div role="img" aria-label="Student progress distribution chart showing on track, at risk, and behind counts">
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
          formatter={(value, name) => {
            const numValue = Number(value)
            const percentage = ((numValue / total) * 100).toFixed(1)
            return [`${numValue} (${percentage}%)`, name]
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value: string, entry) => {
            const payload = entry?.payload as { value?: number } | undefined
            const numValue = Number(payload?.value ?? 0)
            const percentage = total > 0 ? ((numValue / total) * 100).toFixed(1) : '0.0'
            return `${value}: ${numValue} (${percentage}%)`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
    </div>
  )
}
