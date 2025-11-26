// Generate comprehensive sample expense data for the last 2 years
export const getSampleExpenses = () => {
  const today = new Date()
  const expenses = []
  let idCounter = 1001

  const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Education', 'Other']
  
  // Category-specific descriptions
  const descriptions = {
    'Food': ['Lunch at restaurant', 'Grocery shopping', 'Coffee and breakfast', 'Dinner with friends', 'Fast food', 'Takeout', 'Snacks', 'Brunch', 'Food delivery'],
    'Transport': ['Uber ride', 'Gas station', 'Public transport', 'Parking fee', 'Taxi', 'Car maintenance', 'Bus ticket', 'Train ticket'],
    'Entertainment': ['Movie tickets', 'Concert', 'Streaming subscription', 'Video games', 'Books', 'Theater', 'Sports event', 'Hobby supplies'],
    'Bills': ['Electricity bill', 'Internet bill', 'Phone bill', 'Water bill', 'Insurance', 'Rent', 'Utilities', 'Subscription'],
    'Shopping': ['New headphones', 'Clothing', 'Electronics', 'Home goods', 'Shoes', 'Accessories', 'Gifts', 'Online purchase'],
    'Health': ['Gym membership', 'Pharmacy', 'Doctor visit', 'Vitamins', 'Fitness equipment', 'Medical supplies'],
    'Education': ['Online course', 'Books', 'Workshop', 'Software license', 'Tutoring', 'Course materials'],
    'Other': ['Miscellaneous', 'Service fee', 'Bank charge', 'Donation', 'Repair', 'Other expense']
  }

  // Generate expenses for the last 730 days (2 years)
  for (let dayOffset = 0; dayOffset < 730; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const month = date.getMonth()
    
    // Vary expense frequency - more expenses on weekends, fewer on weekdays
    const baseExpenseCount = isWeekend ? 2 : 1
    const expenseCount = Math.random() < 0.7 ? baseExpenseCount : 0
    
    // Seasonal variations
    let seasonalMultiplier = 1
    if (month === 11 || month === 0) { // Dec, Jan - holiday season
      seasonalMultiplier = 1.3
    } else if (month === 6 || month === 7) { // July, Aug - summer
      seasonalMultiplier = 1.2
    }

    for (let i = 0; i < expenseCount; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const categoryDescriptions = descriptions[category]
      const description = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)]
      
      // Category-specific amount ranges
      let amount
      switch(category) {
        case 'Food':
          amount = (Math.random() * 50 + 5) * seasonalMultiplier
          break
        case 'Transport':
          amount = Math.random() * 40 + 8
          break
        case 'Entertainment':
          amount = Math.random() * 80 + 10
          break
        case 'Bills':
          amount = Math.random() * 150 + 50
          break
        case 'Shopping':
          amount = Math.random() * 200 + 20
          break
        case 'Health':
          amount = Math.random() * 100 + 15
          break
        case 'Education':
          amount = Math.random() * 120 + 25
          break
        default:
          amount = Math.random() * 60 + 10
      }

      expenses.push({
        id: idCounter++,
        amount: Math.round(amount * 100) / 100,
        category,
        description,
        date: dateStr,
        createdAt: new Date().toISOString()
      })
    }
  }

  // Sort by date (newest first)
  return expenses.sort((a, b) => new Date(b.date) - new Date(a.date))
}

// Get expenses for a specific month and year
export const getExpensesForMonth = (expenses, year, month) => {
  return expenses.filter(exp => {
    const expDate = new Date(exp.date)
    return expDate.getFullYear() === year && expDate.getMonth() === month
  })
}

// Get all unique months with expenses
export const getAvailableMonths = (expenses) => {
  const months = new Set()
  expenses.forEach(exp => {
    const date = new Date(exp.date)
    months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
  })
  return Array.from(months).sort().reverse() // Newest first
}

// Get expenses for a specific year
export const getExpensesForYear = (expenses, year) => {
  return expenses.filter(exp => {
    const expDate = new Date(exp.date)
    return expDate.getFullYear() === year
  })
}

// Get all unique years with expenses
export const getAvailableYears = (expenses) => {
  const years = new Set()
  expenses.forEach(exp => {
    const date = new Date(exp.date)
    years.add(date.getFullYear())
  })
  return Array.from(years).sort((a, b) => b - a) // Newest first
}

// Calculate yearly totals
export const getYearlyTotals = (expenses) => {
  const yearlyData = {}
  
  expenses.forEach(exp => {
    const date = new Date(exp.date)
    const year = date.getFullYear()
    
    if (!yearlyData[year]) {
      yearlyData[year] = {
        total: 0,
        count: 0,
        byCategory: {}
      }
    }
    
    yearlyData[year].total += exp.amount
    yearlyData[year].count += 1
    yearlyData[year].byCategory[exp.category] = (yearlyData[year].byCategory[exp.category] || 0) + exp.amount
  })
  
  // Convert to array and sort by year (newest first)
  return Object.entries(yearlyData)
    .map(([year, data]) => ({
      year: parseInt(year),
      total: Math.round(data.total * 100) / 100,
      count: data.count,
      byCategory: data.byCategory
    }))
    .sort((a, b) => b.year - a.year)
}
