import React, { useState } from 'react'
import './ExpenseList.css'

function ExpenseList({ expenses, onDelete, categoryTotals }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <div className="empty-icon">📊</div>
        <p>No expenses yet. Add your first expense to get started!</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Food': '#e74c3c',
      'Transport': '#3498db',
      'Entertainment': '#9b59b6',
      'Bills': '#f39c12',
      'Shopping': '#1abc9c',
      'Health': '#e67e22',
      'Education': '#27ae60',
      'Other': '#95a5a6'
    }
    return colors[category] || '#95a5a6'
  }

  // Sort by date, most recent first
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })

  // Pagination
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedExpenses = sortedExpenses.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="expense-list">
      <div className="expense-list-header">
        <h3>All Expenses</h3>
        <span className="expense-count">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedExpenses.length)} of {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </span>
      </div>
      
      <div className="expense-items">
        {paginatedExpenses.map(expense => (
          <div 
            key={expense.id} 
            className="expense-item"
            style={{ 
              borderLeftColor: getCategoryColor(expense.category),
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div className="expense-main">
              <div className="expense-left">
                <span 
                  className="category-badge" 
                  style={{ 
                    backgroundColor: getCategoryColor(expense.category) 
                  }}
                >
                  {expense.category}
                </span>
                <div className="expense-details">
                  <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                  {expense.description && (
                    <div className="expense-description">{expense.description}</div>
                  )}
                  <div className="expense-date">{formatDate(expense.date)}</div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onDelete(expense.id)}
              className="delete-btn"
              title="Delete expense"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="category-breakdown">
          <h4>Spending by Category</h4>
          <div className="category-list">
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([category, total]) => (
                <div key={category} className="category-item">
                  <div className="category-info">
                    <span 
                      className="category-dot" 
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <span className="category-name">{category}</span>
                  </div>
                  <span className="category-total">${total.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseList
