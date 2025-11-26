import React from 'react'
import './YearSummary.css'

function YearSummary({ yearlyTotals }) {
  if (!yearlyTotals || yearlyTotals.length === 0) {
    return null
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="year-summary-container">
      <h3 className="year-summary-title">📊 Yearly Spending Summary</h3>
      <div className="year-cards">
        {yearlyTotals.map((yearData) => {
          const isCurrentYear = yearData.year === currentYear
          const avgMonthly = yearData.total / 12
          
          return (
            <div 
              key={yearData.year} 
              className={`year-card ${isCurrentYear ? 'current-year' : ''}`}
            >
              <div className="year-header">
                <span className="year-label">{yearData.year}</span>
                {isCurrentYear && <span className="current-badge">Current</span>}
              </div>
              <div className="year-total">
                <span className="year-amount">${yearData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="year-stats">
                <div className="year-stat">
                  <span className="stat-label">Total Expenses</span>
                  <span className="stat-value">{yearData.count}</span>
                </div>
                <div className="year-stat">
                  <span className="stat-label">Monthly Average</span>
                  <span className="stat-value">${avgMonthly.toFixed(2)}</span>
                </div>
              </div>
              <div className="year-categories">
                <div className="categories-label">Top Categories:</div>
                <div className="categories-list">
                  {Object.entries(yearData.byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([category, amount]) => (
                      <div key={category} className="category-item">
                        <span className="category-name">{category}</span>
                        <span className="category-amount">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default YearSummary

