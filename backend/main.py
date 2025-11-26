from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timedelta
import uvicorn

from database import get_db, Expense, Budget, init_db
from ml_model import ExpensePredictor

app = FastAPI(title="Personal Finance Tracker API")

# CORS middleware - needed for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup():
    init_db()
    print("Database initialized!")

# Initialize ML predictor
predictor = ExpensePredictor()

# Pydantic models for request/response
class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: str  # YYYY-MM-DD format

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: str
    description: Optional[str]
    date: str
    created_at: Optional[str] = None

class BudgetCreate(BaseModel):
    category: str
    amount: float
    month: int
    year: int

class BudgetResponse(BaseModel):
    id: int
    category: str
    amount: float
    month: int
    year: int

# Expense endpoints
@app.get("/")
async def root():
    return {"message": "Personal Finance Tracker API"}

@app.post("/expenses", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    """Create a new expense entry"""
    try:
        expense_date = datetime.strptime(expense.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # TODO: Add validation for negative amounts maybe?
    
    db_expense = Expense(
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        date=expense_date
    )
    
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    return ExpenseResponse(**db_expense.to_dict())

@app.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all expenses with optional filters"""
    query = db.query(Expense)
    
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Expense.date >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Expense.date <= end)
        except ValueError:
            pass
    
    if category:
        query = query.filter(Expense.category == category)
    
    expenses = query.order_by(Expense.date.desc()).all()
    return [ExpenseResponse(**exp.to_dict()) for exp in expenses]

@app.get("/expenses/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: int, db: Session = Depends(get_db)):
    """Get a specific expense by ID"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return ExpenseResponse(**expense.to_dict())

@app.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Delete an expense"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}

# Budget endpoints
@app.post("/budgets", response_model=BudgetResponse)
async def create_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    """Create or update a budget for a category/month"""
    # Check if budget already exists
    existing = db.query(Budget).filter(
        Budget.category == budget.category,
        Budget.month == budget.month,
        Budget.year == budget.year
    ).first()
    
    if existing:
        existing.amount = budget.amount
        db.commit()
        db.refresh(existing)
        return BudgetResponse(**existing.to_dict())
    
    db_budget = Budget(
        category=budget.category,
        amount=budget.amount,
        month=budget.month,
        year=budget.year
    )
    
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    return BudgetResponse(**db_budget.to_dict())

@app.get("/budgets", response_model=List[BudgetResponse])
async def get_budgets(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all budgets with optional filters"""
    query = db.query(Budget)
    
    if month:
        query = query.filter(Budget.month == month)
    if year:
        query = query.filter(Budget.year == year)
    
    budgets = query.all()
    return [BudgetResponse(**budget.to_dict()) for budget in budgets]

# Analytics and ML endpoints
@app.get("/analytics/summary")
async def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get spending summary and statistics"""
    query = db.query(Expense)
    
    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        query = query.filter(Expense.date >= start)
    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        query = query.filter(Expense.date <= end)
    
    expenses = query.all()
    
    if not expenses:
        return {
            "total_spent": 0,
            "total_expenses": 0,
            "average_expense": 0,
            "category_breakdown": {}
        }
    
    total = sum(exp.amount for exp in expenses)
    category_totals = {}
    
    for exp in expenses:
        category_totals[exp.category] = category_totals.get(exp.category, 0) + exp.amount
    
    return {
        "total_spent": round(total, 2),
        "total_expenses": len(expenses),
        "average_expense": round(total / len(expenses), 2),
        "category_breakdown": category_totals
    }

@app.get("/analytics/predictions")
async def get_predictions(db: Session = Depends(get_db)):
    """Get ML predictions for future spending"""
    # Get all expenses - ordered by date for proper training
    expenses = db.query(Expense).order_by(Expense.date).all()
    
    if len(expenses) == 0:
        return {
            "predictions": [0] * 7,
            "total_predicted": 0,
            "message": "Not enough data for predictions"
        }
    
    # Convert to dict format for ML model
    expense_data = [exp.to_dict() for exp in expenses]
    
    # Train model if we have enough data (need at least a week)
    if len(expense_data) >= 7:
        predictor.train(expense_data)
    # else it'll just use averages which is fine
    
    # Get predictions
    predictions = predictor.predict_next_week(expense_data)
    total_predicted = sum(predictions)
    
    # Format predictions with dates
    today = datetime.now()
    prediction_dates = []
    for i in range(7):
        future_date = today + timedelta(days=i)
        prediction_dates.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "predicted_amount": round(predictions[i], 2)
        })
    
    return {
        "predictions": prediction_dates,
        "total_predicted": round(total_predicted, 2),
        "average_daily": round(total_predicted / 7, 2)
    }

@app.get("/analytics/patterns")
async def get_patterns(db: Session = Depends(get_db)):
    """Get spending pattern analysis"""
    expenses = db.query(Expense).all()
    expense_data = [exp.to_dict() for exp in expenses]
    
    patterns = predictor.get_spending_patterns(expense_data)
    return patterns

@app.get("/analytics/budget-status")
async def get_budget_status(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Check budget status for current or specified month/year"""
    if not month or not year:
        now = datetime.now()
        month = month or now.month
        year = year or now.year
    
    # Get budgets for this month
    budgets = db.query(Budget).filter(
        Budget.month == month,
        Budget.year == year
    ).all()
    
    # Get expenses for this month
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)
    
    expenses = db.query(Expense).filter(
        Expense.date >= start_date,
        Expense.date <= end_date
    ).all()
    
    # Calculate spending by category
    spending_by_category = {}
    for exp in expenses:
        spending_by_category[exp.category] = spending_by_category.get(exp.category, 0) + exp.amount
    
    # Compare with budgets
    budget_status = []
    for budget in budgets:
        spent = spending_by_category.get(budget.category, 0)
        remaining = budget.amount - spent
        percentage = (spent / budget.amount * 100) if budget.amount > 0 else 0
        
        budget_status.append({
            "category": budget.category,
            "budget": budget.amount,
            "spent": round(spent, 2),
            "remaining": round(remaining, 2),
            "percentage_used": round(percentage, 2),
            "over_budget": spent > budget.amount
        })
    
    return {
        "month": month,
        "year": year,
        "budgets": budget_status,
        "total_budget": sum(b.amount for b in budgets),
        "total_spent": sum(spending_by_category.values())
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

