## 🎯 Project Overview

This project uses historical stock market data to build a machine learning model that predicts stock closing prices and provides an interactive dashboard for visualization and analysis.

The dashboard supports multiple stocks and allows users to explore historical trends, model predictions, trading volume, volatility, and yearly price distributions.


---

## 🌐 Live Demo

**Dashboard Link:**
[Open Dashboard](https://major-project-8thsemester.onrender.com)

---

## 🚀 How to Run This Project Locally

### Step 1 — Clone the Repository

```bash
git clone <your-github-repository-url>
cd Major_Project_8thSemester
```

### Step 2 — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3 — Run the Dashboard

```bash
cd dashboard
python app.py
```

### Step 4 — Open in Browser

```text
http://localhost:8050
```

The dashboard will automatically download stock data from Yahoo Finance and display interactive charts.

---

## 📊 Project Workflow

```
Step 1: Data Collection
    └── Download historical stock data using yfinance

Step 2: Data Exploration (EDA)
    └── Analyze stock trends, visualize patterns, study volatility,
        check statistics and understand the dataset before ML

Step 3: Data Preprocessing
    └── Clean missing values, scale data, create useful features
        (Moving Averages, Daily Range, etc.), and prepare
        the dataset for machine learning

Step 4: Model Building
    └── Train Linear Regression model to predict closing prices
    └── Evaluate using MAE and R² Score

Step 5: Visualization
    └── Plot actual vs predicted prices
    └── Create interactive charts using Plotly

Step 6: Dashboard
    └── Multi-stock Dash web application
    └── Interactive visualizations and prediction lookup
```

---

## 📈 Supported Stocks

| Company                   | Ticker      |
| ------------------------- | ----------- |
| Apple Inc.                | AAPL        |
| Microsoft                 | MSFT        |
| Google (Alphabet)         | GOOGL       |
| Reliance Industries       | RELIANCE.NS |
| Tata Consultancy Services | TCS.NS      |

---

## 📊 Dashboard Features

* 📈 Historical Price Chart with 50-Day & 200-Day Moving Averages
* 🤖 Actual vs Predicted Price Comparison
* 📊 Trading Volume Analysis
* 📏 Daily Volatility (High − Low Range)
* 📅 Yearly Price Distribution Box Plots
* 🔮 Date-wise Prediction Viewer
* 📌 Multi-Stock Selection Support

---

## 📉 Evaluation Metrics Explained

* **MAE (Mean Absolute Error)** — Average prediction error (lower is better)
* **R² Score** — Indicates how well the model explains stock price variation (closer to 1 is better)

---

## ☁️ Deployment

The dashboard is deployed on **Render** and can be accessed directly through the live link above.

---
