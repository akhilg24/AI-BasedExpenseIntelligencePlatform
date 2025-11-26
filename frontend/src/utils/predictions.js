// ML Prediction utilities for expense forecasting

// Simple linear regression for trend analysis
function linearRegression(x, y) {
  const n = x.length
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0

  for (let i = 0; i < n; i++) {
    sumX += x[i]
    sumY += y[i]
    sumXY += x[i] * y[i]
    sumXX += x[i] * x[i]
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

// Calculate moving average
function movingAverage(data, window) {
  const result = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = data.slice(start, i + 1)
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length
    result.push(avg)
  }
  return result
}

// Predict future spending for a category
export const predictCategorySpending = (expenses, category, monthsAhead = 3) => {
  // Filter expenses for the category
  const categoryExpenses = expenses.filter(exp => exp.category === category)
  
  if (categoryExpenses.length < 3) {
    // Not enough data, return average
    const avg = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0) / Math.max(categoryExpenses.length, 1)
    return Array(monthsAhead).fill(avg || 0)
  }

  // Group by month
  const monthlyData = {}
  categoryExpenses.forEach(exp => {
    const date = new Date(exp.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + exp.amount
  })

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort()
  const amounts = sortedMonths.map(month => monthlyData[month])

  if (amounts.length < 2) {
    return Array(monthsAhead).fill(amounts[0] || 0)
  }

  // Use linear regression for trend
  const x = amounts.map((_, i) => i)
  const { slope, intercept } = linearRegression(x, amounts)

  // Calculate moving average for smoothing
  const window = Math.min(3, Math.floor(amounts.length / 2))
  const smoothed = movingAverage(amounts, window)
  const lastSmoothed = smoothed[smoothed.length - 1]

  // Predict future months
  const predictions = []
  for (let i = 1; i <= monthsAhead; i++) {
    const trendValue = intercept + slope * (amounts.length + i - 1)
    // Combine trend with recent average (weighted)
    const prediction = (trendValue * 0.4) + (lastSmoothed * 0.6)
    predictions.push(Math.max(0, Math.round(prediction * 100) / 100))
  }

  return predictions
}

// Predict total spending for future months
export const predictTotalSpending = (expenses, monthsAhead = 3) => {
  // Group by month
  const monthlyData = {}
  expenses.forEach(exp => {
    const date = new Date(exp.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + exp.amount
  })

  const sortedMonths = Object.keys(monthlyData).sort()
  const amounts = sortedMonths.map(month => monthlyData[month])

  if (amounts.length < 2) {
    const avg = amounts[0] || 0
    return Array(monthsAhead).fill(avg)
  }

  // Linear regression
  const x = amounts.map((_, i) => i)
  const { slope, intercept } = linearRegression(x, amounts)

  // Moving average
  const window = Math.min(3, Math.floor(amounts.length / 2))
  const smoothed = movingAverage(amounts, window)
  const lastSmoothed = smoothed[smoothed.length - 1]

  const predictions = []
  for (let i = 1; i <= monthsAhead; i++) {
    const trendValue = intercept + slope * (amounts.length + i - 1)
    const prediction = (trendValue * 0.4) + (lastSmoothed * 0.6)
    predictions.push(Math.max(0, Math.round(prediction * 100) / 100))
  }

  return predictions
}

// Get spending trend (increasing, decreasing, stable)
export const getSpendingTrend = (expenses, category = null) => {
  const filtered = category 
    ? expenses.filter(exp => exp.category === category)
    : expenses

  if (filtered.length < 6) {
    return 'insufficient_data'
  }

  // Group by month
  const monthlyData = {}
  filtered.forEach(exp => {
    const date = new Date(exp.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + exp.amount
  })

  const sortedMonths = Object.keys(monthlyData).sort()
  const amounts = sortedMonths.map(month => monthlyData[month])

  if (amounts.length < 3) {
    return 'insufficient_data'
  }

  // Compare last 3 months with previous 3 months
  const recent = amounts.slice(-3)
  const previous = amounts.slice(-6, -3)

  if (previous.length === 0) {
    return 'insufficient_data'
  }

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length

  const change = ((recentAvg - previousAvg) / previousAvg) * 100

  if (change > 10) return 'increasing'
  if (change < -10) return 'decreasing'
  return 'stable'
}

// Get month names for predictions
export const getFutureMonthNames = (monthsAhead = 3) => {
  const months = []
  const today = new Date()
  for (let i = 1; i <= monthsAhead; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
    months.push(date.toLocaleString('default', { month: 'long', year: 'numeric' }))
  }
  return months
}

