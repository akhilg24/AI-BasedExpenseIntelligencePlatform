import React, { useState, useEffect, useMemo } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ChatBot from './components/ChatBot'
import MonthPicker from './components/MonthPicker'
import YearSummary from './components/YearSummary'
import { getSampleExpenses, getExpensesForMonth, getAvailableMonths, getYearlyTotals } from './utils/sampleData'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [hasLoadedSamples, setHasLoadedSamples] = useState(false)
  
  // Month picker state
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())

  // Load expenses from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses')
    const hasSamples = localStorage.getItem('hasLoadedSamples')
    
    if (savedExpenses) {
      try {
        const parsed = JSON.parse(savedExpenses)
        setExpenses(parsed)
        setHasLoadedSamples(hasSamples === 'true')
      } catch (err) {
        console.error('Error loading expenses:', err)
      }
    }
  }, [])

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  const handleAddExpense = (expenseData) => {
    const newExpense = {
      id: Date.now(), // Simple ID generation
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      createdAt: new Date().toISOString()
    }
    
    // Add to beginning of array for real-time feel
    setExpenses(prev => [newExpense, ...prev])
    setShowForm(false)
  }

  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== id))
    }
  }

  const handleLoadSamples = () => {
    if (window.confirm('Load sample expenses for the last 2 years? This will add demo data to your tracker.')) {
      const samples = getSampleExpenses()
      setExpenses(prev => [...samples, ...prev])
      setHasLoadedSamples(true)
      localStorage.setItem('hasLoadedSamples', 'true')
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) {
      setExpenses([])
      setHasLoadedSamples(false)
      localStorage.removeItem('hasLoadedSamples')
    }
  }

  // Get available months
  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses])

  // Calculate yearly totals
  const yearlyTotals = useMemo(() => getYearlyTotals(expenses), [expenses])

  // Filter expenses by selected month
  const filteredExpenses = useMemo(() => {
    return getExpensesForMonth(expenses, selectedYear, selectedMonth)
  }, [expenses, selectedYear, selectedMonth])

  // Check if viewing current month
  const isCurrentMonth = selectedYear === currentDate.getFullYear() && 
                         selectedMonth === currentDate.getMonth()

  // Calculate totals (for selected month or all)
  const displayExpenses = isCurrentMonth ? expenses : filteredExpenses
  
  const totalAmount = displayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const todayTotal = expenses
    .filter(exp => {
      const expDate = new Date(exp.date).toDateString()
      const today = new Date().toDateString()
      return expDate === today
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  // Category breakdown (for selected month)
  const categoryTotals = displayExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {})

  const handleMonthChange = (year, month) => {
    setSelectedYear(year)
    setSelectedMonth(month)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>🤖 AI-Based Expense Intelligence Platform</h1>
          <p className="header-description">
            Powered by machine learning algorithms including linear regression, moving averages, and trend analysis. 
            This platform leverages advanced AI/ML techniques to predict future spending patterns, analyze historical trends, 
            and provide intelligent financial insights. Built with React, featuring real-time data processing, 
            natural language processing for conversational queries, and predictive analytics for forecasting expenses across categories.
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {/* Year Summary */}
          {yearlyTotals.length > 0 && (
            <YearSummary yearlyTotals={yearlyTotals} />
          )}

          {/* Month Picker */}
          <MonthPicker
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
            availableMonths={availableMonths}
          />

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card total">
              <div className="card-icon">💵</div>
              <div className="card-content">
                <div className="card-label">
                  {isCurrentMonth ? 'Total Spent' : `Spent in ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}`}
                </div>
                <div className="card-value">${totalAmount.toFixed(2)}</div>
              </div>
            </div>
            <div className="summary-card today">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <div className="card-label">Today</div>
                <div className="card-value">${todayTotal.toFixed(2)}</div>
              </div>
            </div>
            <div className="summary-card count">
              <div className="card-icon">📝</div>
              <div className="card-content">
                <div className="card-label">
                  {isCurrentMonth ? 'Total Expenses' : 'Expenses This Month'}
                </div>
                <div className="card-value">{displayExpenses.length}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-row">
            {!showForm ? (
              <button 
                onClick={() => setShowForm(true)}
                className="btn-add-expense"
              >
                <span className="btn-icon">+</span>
                Add New Expense
              </button>
            ) : (
              <ExpenseForm 
                onSubmit={handleAddExpense}
                onCancel={() => setShowForm(false)}
              />
            )}

            {!hasLoadedSamples && (
              <button 
                onClick={handleLoadSamples}
                className="btn-load-samples"
              >
                📊 Load 2 Years Sample Data
              </button>
            )}

            {expenses.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="btn-clear-all"
              >
                🗑️ Clear All
              </button>
            )}
          </div>

          {/* Expense List - Updates in real-time */}
          <ExpenseList 
            expenses={displayExpenses}
            onDelete={handleDeleteExpense}
            categoryTotals={categoryTotals}
          />

          {/* AI Chatbot */}
          <ChatBot expenses={expenses} />
        </div>
      </main>
    </div>
  )
}

export default App
