# 🤖 AI-Based Expense Intelligence Platform

An intelligent, AI-powered expense tracking application that helps you understand and predict your spending patterns. Powered by machine learning algorithms including linear regression, moving averages, and trend analysis. This platform leverages advanced AI/ML techniques to predict future spending patterns, analyze historical trends, and provide intelligent financial insights. Built with React, featuring real-time data processing, natural language processing for conversational queries, and predictive analytics for forecasting expenses across categories. Get personalized recommendations, visualize trends spanning up to 2 years, and make smarter financial decisions - all running entirely in your browser with zero backend requirements.

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)

## 📱 Application

AI-Based Expense Intelligence Platform is an advanced financial management tool that combines intuitive expense tracking with cutting-edge AI/ML capabilities. Navigate through 24 months of historical data using an interactive calendar, analyze spending trends, and receive intelligent predictions about your future expenses. The platform uses machine learning algorithms (linear regression, moving averages, trend analysis) to forecast spending patterns, identify trends, and provide actionable financial insights through natural language processing and predictive analytics.

**Key Highlights:**
- 🚀 **Zero Backend**: Runs entirely client-side using localStorage
- 🤖 **AI/ML Predictions**: Forecast future spending using machine learning algorithms
- 📅 **2-Year Calendar**: Navigate through 24 months of expense history
- 📊 **Historical Analysis**: Track and analyze up to 2 years of spending data
- ⚡ **Real-Time**: Instant updates and live calculations
- 🎨 **Modern Design**: Beautiful gradient UI with smooth animations
- 💡 **Smart Recommendations**: AI-powered insights and personalized tips

## ✨ Features

### Core Functionality
- **📝 Expense Management**
  - Add, view, and delete expenses with ease
  - Categorize expenses (Food, Transport, Entertainment, Bills, Shopping, Health, Education, Other)
  - Optional descriptions for detailed tracking
  - Date-based organization

- **💰 Real-Time Totals**
  - Total spending across all expenses
  - Today's spending calculation
  - Total expense count
  - Live updates as you add/remove expenses

- **📊 Category Analytics**
  - Visual category breakdown
  - Color-coded categories for easy identification
  - Spending totals per category
  - Sorted by spending amount

### AI-Powered Features
- **🤖 Intelligent Chatbot**
  - Ask questions about your expenses in natural language
  - Get instant insights and analysis
  - Personalized spending tips and recommendations
  - Recommended prompts for common queries

- **💡 Smart Analysis**
  - Total spending calculations
  - Average daily spending
  - Category comparisons
  - Top expense identification
  - Budget recommendations

### User Experience
- **🎨 Beautiful UI**
  - Modern gradient design
  - Smooth animations and transitions
  - Responsive layout (desktop & mobile)
  - Intuitive user interface

- **💾 Data Persistence**
  - Automatic saving to localStorage
  - Data persists between sessions
  - No server or database required
  - Works completely offline

- **📦 Sample Data**
  - Pre-loaded sample expenses for quick testing
  - Easy demo data loading
  - Clear all functionality with confirmation

## 🛠️ Tools Used

### Frontend Framework & Build Tools
- **React 18.2.0** - Modern UI library for building interactive user interfaces
- **Vite 5.0** - Next-generation frontend build tool for fast development
- **JavaScript (ES6+)** - Modern JavaScript features and syntax

### Styling & UI
- **CSS3** - Custom styling with modern features
  - CSS Grid & Flexbox for layouts
  - CSS Animations & Transitions
  - Gradient backgrounds
  - Responsive design patterns

### Data Management
- **localStorage API** - Client-side data persistence
- **React Hooks** - useState, useEffect for state management
- **React Context** - Component communication (if needed)

### AI & Machine Learning
- **Linear Regression** - Predictive modeling for future spending forecasts
- **Moving Averages** - Data smoothing and trend analysis
- **Trend Analysis Algorithms** - Identify increasing/decreasing spending patterns
- **Pattern Matching Algorithms** - Natural language understanding for chatbot queries
- **Predictive Analytics** - Category-specific and total spending predictions
- **Data Analysis Functions** - Expense calculation, aggregation, and statistical analysis
- **Smart Recommendations** - AI-powered personalized financial tips and insights

### Development Tools
- **npm** - Package management
- **Git** - Version control
- **ESLint** - Code quality (via Vite)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Start tracking your expenses!

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## 📖 Usage Guide

### Adding Expenses
1. Click the **"+ Add New Expense"** button
2. Fill in the expense details:
   - Amount (required)
   - Category (select from dropdown)
   - Description (optional)
   - Date
3. Click **"Add Expense"** to save

### Using the AI Chatbot
1. Scroll to the chatbot at the bottom
2. Click on any recommended prompt, or type your own question
3. Get instant insights about your spending
4. Ask questions like:
   - "What's my total spending?"
   - "Which category do I spend the most on?"
   - "Show me my top expenses"
   - "Give me spending tips"

### Loading Sample Data
- Click **"📊 Load 2 Years Sample Data"** to add 730 days of demo expenses
- Perfect for testing and exploring features
- Includes realistic spending patterns across 2 years
- Use **"🗑️ Clear All"** to remove all expenses

### Managing Expenses
- View expenses with pagination (10 per page) - sorted by date (newest first)
- Navigate through months using the calendar picker
- View yearly spending summaries at the top
- Delete individual expenses by clicking the × button
- See category breakdown at the bottom of the list
- All changes save automatically

## 📁 Project Structure

```
PersonalFinanceTracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ExpenseForm.jsx      # Expense input form
│   │   │   ├── ExpenseForm.css      # Form styling
│   │   │   ├── ExpenseList.jsx      # Expense list display with pagination
│   │   │   ├── ExpenseList.css      # List styling
│   │   │   ├── ChatBot.jsx          # AI chatbot with ML predictions
│   │   │   ├── ChatBot.css          # Chatbot styling
│   │   │   ├── MonthPicker.jsx      # Calendar month selector
│   │   │   ├── MonthPicker.css      # Month picker styling
│   │   │   ├── YearSummary.jsx      # Yearly spending summary
│   │   │   └── YearSummary.css      # Year summary styling
│   │   ├── utils/
│   │   │   ├── sampleData.js        # 2-year sample expense data generator
│   │   │   └── predictions.js      # ML prediction algorithms (linear regression, moving averages)
│   │   ├── App.jsx                  # Main application component
│   │   ├── App.css                  # Main app styling
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── index.html                   # HTML template
│   ├── package.json                 # Dependencies
│   ├── vite.config.js               # Vite configuration
│   └── .gitignore                   # Git ignore rules
├── backend/                          # (Optional - not used in current version)
└── README.md                         # This file
```

## 🎯 Key Features in Detail

### Real-Time Updates
- Expenses appear instantly when added
- Totals recalculate automatically
- No page refresh required
- Smooth slide-in animations

### AI Chatbot Capabilities
- Natural language expense queries with NLP
- Category-specific analysis and predictions
- Spending pattern recognition using ML algorithms
- Personalized financial advice based on trends
- Top expense identification
- Average spending calculations
- **ML-Powered Predictions**: "What will my spending on Food be in the future?"
- **Multi-Month Forecasts**: Predict spending for next 3-6 months
- **Trend Analysis**: Identify increasing/decreasing spending patterns
- **ML-Powered Predictions**: "What will my spending on Food be in the future?"
- **Multi-Month Forecasts**: Predict spending for next 3-6 months
- **Trend Analysis**: Identify increasing/decreasing spending patterns

### Category System
- 8 predefined categories
- Color-coded visual identification
- Category-based spending totals
- Easy category filtering (via chatbot)

### Data Persistence
- Automatic localStorage saving
- Data survives browser restarts
- No external dependencies
- Privacy-focused (all data stays local)

## 🔧 Customization

### Adding New Categories
Edit `frontend/src/components/ExpenseForm.jsx`:
```javascript
const CATEGORIES = [
  'Food',
  'Transport',
  // Add your categories here
]
```

### Changing Category Colors
Edit `frontend/src/components/ExpenseList.jsx`:
```javascript
const getCategoryColor = (category) => {
  const colors = {
    'Food': '#e74c3c',
    // Customize colors here
  }
}
```

## 🌐 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

## 📝 Notes

- **Data Storage**: All data is stored locally in your browser's localStorage
- **Privacy**: No data is sent to any server - everything stays on your device
- **Offline**: Works completely offline after initial load
- **Data Loss**: Clearing browser data will remove all expenses

## 🚧 Future Enhancements

Potential features for future versions:
- 📊 Advanced charts and graphs
- 📅 Date range filtering
- 🔍 Search functionality
- 💾 Export to CSV/PDF
- 💰 Budget setting and tracking
- 🌍 Multiple currency support
- 📱 Progressive Web App (PWA) support
- 🔄 Data import/export
- 📈 Spending trends and predictions

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Akhil Gadde**
- GitHub: [@akhilg24](https://github.com/akhilg24)
- Email: akhilgadde99@gmail.com

## 🙏 Acknowledgments

- Built with React and Vite
- Inspired by modern financial tracking applications
- Designed for simplicity and user experience

---

⭐ **Star this repo if you find it helpful!**
