import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'

interface PricingHistoryItem {
  levelNumber: number
  dateRange: { start: string; end?: string }
  monthlyFee: number
  isActive: boolean
}

interface GroupPricingCardProps {
  pricingHistory: PricingHistoryItem[]
  currency: string
}

export function GroupPricingCard({ pricingHistory, currency }: GroupPricingCardProps) {
  if (pricingHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Pricing History</h3>
        <p className="text-sm text-slate-500">No pricing history available</p>
      </div>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  }

  const currentPricing = pricingHistory.find((p) => p.isActive)
  const previousPricing = pricingHistory.filter((p) => !p.isActive)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Pricing History</h3>

      {currentPricing && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              Current
            </span>
            <span className="text-sm text-slate-500">Level {currentPricing.levelNumber}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Monthly Fee</p>
              <p className="text-lg font-bold text-slate-900">
                {currentPricing.monthlyFee} {currency}
              </p>
            </div>
          </div>
        </div>
      )}

      {previousPricing.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Previous Levels</p>
          {previousPricing.map((pricing, index) => {
            const nextPricing = previousPricing[index - 1] || currentPricing
            const monthlyDiff = nextPricing
              ? pricing.monthlyFee - nextPricing.monthlyFee
              : 0

            return (
              <div
                key={pricing.levelNumber}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    Level {pricing.levelNumber}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(pricing.dateRange.start)}
                    {pricing.dateRange.end && ` - ${formatDate(pricing.dateRange.end)}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    <DollarSign className="w-3 h-3 inline" />
                    {pricing.monthlyFee}
                  </span>
                  {monthlyDiff !== 0 && (
                    <span
                      className={`text-xs flex items-center gap-0.5 ${
                        monthlyDiff > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {monthlyDiff > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(monthlyDiff)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
