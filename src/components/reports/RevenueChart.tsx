import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RevenueByDateDTO } from '../../api/analytics'

interface RevenueChartProps {
  data: RevenueByDateDTO[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <span className="material-symbols-outlined text-4xl mb-2" aria-hidden="true">payments</span>
        <p>No revenue data available</p>
      </div>
    )
  }

  const formattedData = data.map(item => ({
    ...item,
    formattedAmount: `${item.net_revenue.toLocaleString()} EGP`
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#006a61" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#006a61" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="day" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const numValue = Number(value)
            return `${(numValue / 1000).toFixed(0)}K`
          }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value) => {
            const numValue = Number(value)
            return `${numValue.toLocaleString()} EGP`
          }}
        />
        <Area 
          type="monotone" 
          dataKey="net_revenue" 
          name="Revenue"
          stroke="#006a61" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
