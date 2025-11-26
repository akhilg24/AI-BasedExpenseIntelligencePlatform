import React, { useState } from 'react'
import './MonthPicker.css'

function MonthPicker({ selectedYear, selectedMonth, onMonthChange, availableMonths }) {
  const [isOpen, setIsOpen] = useState(false)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Generate years (current year back to 2 years ago)
  const years = []
  for (let i = 0; i <= 2; i++) {
    years.push(currentYear - i)
  }

  // Check if a month has data
  const hasData = (year, month) => {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    return availableMonths.includes(monthKey)
  }

  const handleMonthSelect = (year, month) => {
    onMonthChange(year, month)
    setIsOpen(false)
  }

  const formatSelected = () => {
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return 'Current Month'
    }
    return `${months[selectedMonth]} ${selectedYear}`
  }

  return (
    <div className="month-picker-container">
      <button 
        className="month-picker-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="calendar-icon">📅</span>
        <span className="month-text">{formatSelected()}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="month-picker-dropdown">
          <div className="month-picker-header">
            <h4>Select Month</h4>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="month-picker-content">
            {years.map(year => (
              <div key={year} className="year-section">
                <div className="year-header">{year}</div>
                <div className="months-grid">
                  {months.map((month, monthIndex) => {
                    const isSelected = selectedYear === year && selectedMonth === monthIndex
                    const hasExpenses = hasData(year, monthIndex)
                    const isFuture = year > currentYear || (year === currentYear && monthIndex > currentMonth)
                    
                    return (
                      <button
                        key={monthIndex}
                        className={`month-option ${isSelected ? 'selected' : ''} ${hasExpenses ? 'has-data' : ''} ${isFuture ? 'future' : ''}`}
                        onClick={() => !isFuture && handleMonthSelect(year, monthIndex)}
                        disabled={isFuture}
                        title={isFuture ? 'Future month' : hasExpenses ? `${month} ${year} - Has expenses` : `${month} ${year} - No data`}
                      >
                        <span className="month-name">{month.substring(0, 3)}</span>
                        {hasExpenses && <span className="data-indicator">●</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="month-picker-footer">
            <button 
              className="current-month-btn"
              onClick={() => handleMonthSelect(currentYear, currentMonth)}
            >
              Go to Current Month
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="month-picker-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default MonthPicker

