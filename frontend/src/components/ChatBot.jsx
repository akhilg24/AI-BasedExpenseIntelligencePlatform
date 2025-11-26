import React, { useState, useRef, useEffect } from 'react'
import { predictCategorySpending, predictTotalSpending, getSpendingTrend, getFutureMonthNames } from '../utils/predictions'
import './ChatBot.css'

const RECOMMENDED_PROMPTS = [
  "What's my total spending this month?",
  "Which category do I spend the most on?",
  "What will my spending on Food be in the future?",
  "Predict my spending for the next 3 months",
  "Show me my average daily spending",
  "What are my top 3 expenses?",
  "How much did I spend on Food?",
  "Give me spending tips based on my expenses"
]

function ChatBot({ expenses }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI expense assistant. Ask me anything about your spending habits, totals, categories, or get personalized tips! 💰"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Analyze expenses and generate AI response
  const analyzeExpenses = (expenses) => {
    if (expenses.length === 0) {
      return {
        total: 0,
        byCategory: {},
        averageDaily: 0,
        topExpenses: [],
        totalExpenses: 0
      }
    }

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})

    // Calculate average daily spending
    const dates = new Set(expenses.map(exp => exp.date))
    const averageDaily = total / Math.max(dates.size, 1)

    // Get top 5 expenses
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return {
      total,
      byCategory,
      averageDaily,
      topExpenses,
      totalExpenses: expenses.length
    }
  }

  const generateAIResponse = async (userMessage) => {
    const analysis = analyzeExpenses(expenses)
    
    // Simulate AI thinking with a small delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const lowerMessage = userMessage.toLowerCase()

    // Total spending queries
    if (lowerMessage.includes('total') && (lowerMessage.includes('spend') || lowerMessage.includes('amount'))) {
      return `Your total spending is **$${analysis.total.toFixed(2)}** across ${analysis.totalExpenses} expenses. That's an average of **$${analysis.averageDaily.toFixed(2)}** per day.`
    }

    // Category queries
    if (lowerMessage.includes('category') || lowerMessage.includes('most') || lowerMessage.includes('which')) {
      if (Object.keys(analysis.byCategory).length === 0) {
        return "You don't have any expenses yet. Start adding expenses to see category breakdowns!"
      }
      const sortedCategories = Object.entries(analysis.byCategory)
        .sort((a, b) => b[1] - a[1])
      const topCategory = sortedCategories[0]
      return `You spend the most on **${topCategory[0]}** with **$${topCategory[1].toFixed(2)}**. Here's your breakdown:\n\n${sortedCategories.map(([cat, amount]) => `• ${cat}: $${amount.toFixed(2)}`).join('\n')}`
    }

    // Specific category queries
    const categories = ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education', 'other']
    for (const category of categories) {
      if (lowerMessage.includes(category)) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
        const amount = analysis.byCategory[categoryName] || 0
        const count = expenses.filter(exp => exp.category === categoryName).length
        return `You've spent **$${amount.toFixed(2)}** on **${categoryName}** across ${count} ${count === 1 ? 'expense' : 'expenses'}.`
      }
    }

    // Top expenses
    if (lowerMessage.includes('top') || lowerMessage.includes('largest') || lowerMessage.includes('biggest')) {
      if (analysis.topExpenses.length === 0) {
        return "You don't have any expenses yet!"
      }
      return `Here are your top expenses:\n\n${analysis.topExpenses.map((exp, idx) => 
        `${idx + 1}. **${exp.description || exp.category}** - $${exp.amount.toFixed(2)} (${exp.category})`
      ).join('\n')}`
    }

    // Average spending
    if (lowerMessage.includes('average') || lowerMessage.includes('daily')) {
      return `Your average daily spending is **$${analysis.averageDaily.toFixed(2)}**. Based on your ${analysis.totalExpenses} expenses, you're spending about **$${(analysis.total / 30).toFixed(2)}** per day if we average over a month.`
    }

    // ML Predictions - Future spending
    if (lowerMessage.includes('predict') || lowerMessage.includes('future') || lowerMessage.includes('forecast') || lowerMessage.includes('will be')) {
      const monthsAhead = lowerMessage.includes('3') ? 3 : lowerMessage.includes('6') ? 6 : 3
      
      // Check for specific category prediction
      const categories = ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education', 'other']
      for (const category of categories) {
        if (lowerMessage.includes(category)) {
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
          const predictions = predictCategorySpending(expenses, categoryName, monthsAhead)
          const futureMonths = getFutureMonthNames(monthsAhead)
          const totalPredicted = predictions.reduce((sum, val) => sum + val, 0)
          
          const trend = getSpendingTrend(expenses, categoryName)
          let trendText = ''
          if (trend === 'increasing') trendText = '📈 Your spending on this category is increasing.'
          else if (trend === 'decreasing') trendText = '📉 Your spending on this category is decreasing.'
          else if (trend === 'stable') trendText = '➡️ Your spending on this category is stable.'
          
          return `Based on ML analysis of your spending patterns, here are predictions for **${categoryName}**:\n\n${futureMonths.map((month, idx) => 
            `• ${month}: $${predictions[idx].toFixed(2)}`
          ).join('\n')}\n\n**Total predicted**: $${totalPredicted.toFixed(2)} over ${monthsAhead} months\n\n${trendText}`
        }
      }
      
      // General prediction
      const predictions = predictTotalSpending(expenses, monthsAhead)
      const futureMonths = getFutureMonthNames(monthsAhead)
      const totalPredicted = predictions.reduce((sum, val) => sum + val, 0)
      
      return `🤖 **ML-Powered Spending Predictions** (Next ${monthsAhead} months):\n\n${futureMonths.map((month, idx) => 
        `• ${month}: $${predictions[idx].toFixed(2)}`
      ).join('\n')}\n\n**Total predicted**: $${totalPredicted.toFixed(2)}\n\n*These predictions are based on linear regression analysis of your historical spending patterns.*`
    }

    // Tips and advice
    if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('suggest') || lowerMessage.includes('recommend')) {
      const tips = []
      if (analysis.total > 1000) {
        tips.push("💡 You're spending quite a bit. Consider reviewing your expenses to identify areas where you can cut back.")
      }
      if (analysis.byCategory['Food'] > analysis.total * 0.3) {
        tips.push("🍔 Food spending is high. Try meal prepping or cooking at home more often to save money.")
      }
      if (analysis.byCategory['Entertainment'] > analysis.total * 0.2) {
        tips.push("🎬 Entertainment costs are significant. Look for free or low-cost alternatives like streaming services or local events.")
      }
      
      // Add trend-based tips
      const foodTrend = getSpendingTrend(expenses, 'Food')
      if (foodTrend === 'increasing') {
        tips.push("📈 Your Food spending is trending upward. Consider meal planning to control costs.")
      }
      
      if (tips.length === 0) {
        tips.push("✅ Your spending looks balanced! Keep tracking to maintain good financial habits.")
        tips.push("📊 Try setting a monthly budget for each category to stay on track.")
        tips.push("💰 Review your expenses weekly to catch any unnecessary spending early.")
      }
      return `Here are some personalized tips based on your spending:\n\n${tips.join('\n\n')}`
    }

    // Trend analysis
    if (lowerMessage.includes('trend') || lowerMessage.includes('increasing') || lowerMessage.includes('decreasing')) {
      const categories = ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education']
      const trendResults = []
      
      for (const category of categories) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
        const trend = getSpendingTrend(expenses, categoryName)
        if (trend !== 'insufficient_data') {
          let emoji = '➡️'
          if (trend === 'increasing') emoji = '📈'
          else if (trend === 'decreasing') emoji = '📉'
          trendResults.push(`${emoji} ${categoryName}: ${trend}`)
        }
      }
      
      if (trendResults.length > 0) {
        return `**Spending Trends Analysis:**\n\n${trendResults.join('\n')}\n\n*Based on comparing last 3 months with previous 3 months*`
      }
      return "I need at least 6 months of data to analyze trends. Add more expenses to see trend analysis!"
    }

    // General help
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
      return `I can help you with:\n\n• Total spending and averages\n• Category breakdowns\n• Top expenses\n• **ML Predictions** - Forecast future spending\n• **Trend Analysis** - See if spending is increasing/decreasing\n• Spending tips and advice\n• Analysis of specific categories\n\nTry asking:\n• "What will my spending on Food be in the future?"\n• "Predict my spending for the next 3 months"\n• "Show me spending trends"`
    }

    // Default response
    return `I can help you analyze your expenses! Try asking about:\n\n• Your total spending\n• Spending by category\n• Top expenses\n• Average daily spending\n• Personalized tips\n\nOr use one of the suggested prompts below! 💡`
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Generate AI response
    const response = await generateAIResponse(userMessage)
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }])
    setLoading(false)
  }

  const handlePromptClick = (prompt) => {
    setInput(prompt)
  }

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, idx) => {
        if (line.startsWith('•') || line.match(/^\d+\./)) {
          return <div key={idx} className="message-list-item">{line}</div>
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          const text = line.slice(2, -2)
          return <div key={idx}><strong>{text}</strong></div>
        }
        const parts = line.split(/(\*\*.*?\*\*)/g)
        return (
          <div key={idx}>
            {parts.map((part, i) => 
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={i}>{part.slice(2, -2)}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        )
      })
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <span className="chatbot-icon">🤖</span>
          <h3>AI Expense Assistant</h3>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="recommended-prompts">
        <div className="prompts-label">Suggested questions:</div>
        <div className="prompts-list">
          {RECOMMENDED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              className="prompt-button"
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSend} className="chatbot-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about your expenses..."
          className="chatbot-input"
          disabled={loading}
        />
        <button 
          type="submit" 
          className="chatbot-send-btn"
          disabled={loading || !input.trim()}
        >
          <span>Send</span>
        </button>
      </form>
    </div>
  )
}

export default ChatBot

