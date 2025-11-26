import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from collections import defaultdict
import pickle
import os

class ExpensePredictor:
    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
        self.is_trained = False
        # Could use a more complex model later, but linear regression works well for this
        
    def prepare_training_data(self, expenses):
        """
        Prepares data for training the model
        Takes expense history and creates features
        """
        if len(expenses) < 7:  # Need at least a week of data to make this useful
            return None, None
            
        # Group expenses by date
        daily_totals = defaultdict(float)
        for exp in expenses:
            date_key = exp['date'] if isinstance(exp['date'], str) else str(exp['date'])
            daily_totals[date_key] += exp['amount']
        
        # Sort by date
        sorted_dates = sorted(daily_totals.keys())
        
        # Create features: day of week, day of month, rolling averages
        X = []
        y = []
        
        for i in range(7, len(sorted_dates)):
            # Features: last 7 days of spending
            last_7_days = [daily_totals[sorted_dates[i-j]] for j in range(1, 8)]
            
            # Additional features
            date_obj = datetime.strptime(sorted_dates[i], '%Y-%m-%d')
            day_of_week = date_obj.weekday()
            day_of_month = date_obj.day
            
            # Combine features
            features = last_7_days + [day_of_week, day_of_month]
            X.append(features)
            y.append(daily_totals[sorted_dates[i]])
        
        return np.array(X), np.array(y)
    
    def train(self, expenses):
        """Train the model on historical expense data"""
        X, y = self.prepare_training_data(expenses)
        
        if X is None or len(X) == 0:
            self.is_trained = False
            return False
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
        return True
    
    def predict_next_week(self, expenses):
        """Predict spending for the next 7 days"""
        if not self.is_trained:
            # If not trained, use simple average
            if len(expenses) == 0:
                return [0] * 7
            
            # Get average daily spending
            daily_totals = defaultdict(float)
            for exp in expenses:
                date_key = exp['date'] if isinstance(exp['date'], str) else str(exp['date'])
                daily_totals[date_key] += exp['amount']
            
            avg_daily = sum(daily_totals.values()) / max(len(daily_totals), 1)
            return [avg_daily] * 7
        
        # Get last 7 days of data
        daily_totals = defaultdict(float)
        for exp in expenses:
            date_key = exp['date'] if isinstance(exp['date'], str) else str(exp['date'])
            daily_totals[date_key] += exp['amount']
        
        sorted_dates = sorted(daily_totals.keys())
        
        if len(sorted_dates) < 7:
            # Not enough data, use average
            avg_daily = sum(daily_totals.values()) / max(len(daily_totals), 1)
            return [avg_daily] * 7
        
        # Get last 7 days
        last_7_days = [daily_totals[sorted_dates[-i]] for i in range(1, 8)]
        
        predictions = []
        today = datetime.now()
        
        for i in range(7):
            future_date = today + timedelta(days=i)
            day_of_week = future_date.weekday()
            day_of_month = future_date.day
            
            features = last_7_days + [day_of_week, day_of_month]
            X = np.array([features])
            X_scaled = self.scaler.transform(X)
            
            pred = self.model.predict(X_scaled)[0]
            predictions.append(max(0, pred))  # Can't predict negative spending
            
            # Update last_7_days for next prediction (rolling window)
            last_7_days.pop(0)
            last_7_days.append(pred)
        
        return predictions
    
    def get_spending_patterns(self, expenses):
        """Analyze spending patterns by category and time"""
        if len(expenses) == 0:
            return {
                "category_breakdown": {},
                "monthly_trend": {},
                "average_daily": 0,
                "most_spent_category": None
            }
        
        # Category breakdown
        category_totals = defaultdict(float)
        monthly_totals = defaultdict(float)
        total_amount = 0
        
        for exp in expenses:
            category = exp.get('category', 'Other')
            amount = exp.get('amount', 0)
            category_totals[category] += amount
            total_amount += amount
            
            # Monthly totals
            date_str = exp.get('date', '')
            if date_str:
                try:
                    date_obj = datetime.strptime(date_str[:7], '%Y-%m')
                    month_key = date_obj.strftime('%Y-%m')
                    monthly_totals[month_key] += amount
                except:
                    pass
        
        # Find most spent category
        most_spent = max(category_totals.items(), key=lambda x: x[1]) if category_totals else None
        
        # Calculate average daily
        unique_dates = set()
        for exp in expenses:
            date_str = exp.get('date', '')
            if date_str:
                unique_dates.add(date_str[:10])
        
        avg_daily = total_amount / max(len(unique_dates), 1)
        
        return {
            "category_breakdown": dict(category_totals),
            "monthly_trend": dict(monthly_totals),
            "average_daily": round(avg_daily, 2),
            "most_spent_category": most_spent[0] if most_spent else None,
            "total_spent": round(total_amount, 2)
        }

