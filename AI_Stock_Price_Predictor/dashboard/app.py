# ============================================
# AI Stock Price Predictor - Dashboard
# Multi-Stock | All 5 Charts 
# ============================================

import dash
from dash import dcc, html, Input, Output
import plotly.graph_objects as go
import pandas as pd
import numpy as np
import pickle
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error

# ── 1. STOCK LIST ───────────────────────────
STOCKS = {
    'AAPL':        'Apple Inc.',
    'RELIANCE.NS': 'Reliance Industries',
    'TCS.NS':      'Tata Consultancy Services',
    'GOOGL':       'Google (Alphabet)',
    'MSFT':        'Microsoft',
}

# ── 2. FUNCTION TO LOAD & TRAIN ANY STOCK ───
def get_stock_data(ticker):

    print("=" * 50)
    print("Downloading:", ticker)

    df = yf.download(
    ticker,
    period="10y",
    progress=False,
    threads=False
)

    print("Ticker:", ticker)
    print("Shape:", df.shape)
    print(df.tail())

    if len(df) > 0:
        print(df.head())
    else:
        print("DATAFRAME IS EMPTY")

    if df.empty:
        raise Exception(f"No data returned for {ticker}")

    # Handle MultiIndex from newer yfinance
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    print("Columns After Flattening:")
    print(df.columns.tolist())

    required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']

    missing = [col for col in required_cols if col not in df.columns]

    if missing:
        raise Exception(f"Missing columns: {missing}")

    df = df[required_cols].copy()

    print("Shape After Selecting Columns:", df.shape)

    df.index = pd.to_datetime(df.index)

    # Features
    df['MA_50'] = df['Close'].rolling(50).mean()
    df['MA_200'] = df['Close'].rolling(200).mean()
    df['Daily_Range'] = df['High'] - df['Low']
    df['Year'] = df.index.year

    print("Shape Before dropna:", df.shape)

    df = df.dropna()

    print("Shape After dropna:", df.shape)

    if len(df) == 0:
        raise Exception(
            "DataFrame became empty after dropna(). "
            "Check downloaded columns/data."
        )

    features = [
        'Open',
        'High',
        'Low',
        'Volume',
        'MA_50',
        'MA_200',
        'Daily_Range'
    ]

    X = df[features]
    y = df['Close']

    print("X Shape:", X.shape)

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    model = LinearRegression()
    model.fit(X_scaled, y)

    df['Predicted'] = model.predict(X_scaled)

    r2 = round(r2_score(y, df['Predicted']) * 100, 2)
    mae = round(mean_absolute_error(y, df['Predicted']), 2)

    return df, r2, mae

# ── 3. HELPER — STAT CARD ───────────────────
def make_card(title, value, color):
    return html.Div([
        html.H4(title, style={'color': '#aaa', 'margin': '0', 'fontSize': '14px'}),
        html.H2(value, style={'color': color,  'margin': '0'})
    ], style={
        'backgroundColor': '#16213e',
        'padding':         '20px',
        'borderRadius':    '10px',
        'textAlign':       'center',
        'flex':            '1',
        'margin':          '10px'
    })


# ── 4. CREATE APP ───────────────────────────
app  = dash.Dash(__name__)
server = app.server          # needed for deployment on Render
app.title = "AI Stock Predictor"


# ── 5. LAYOUT ───────────────────────────────
app.layout = html.Div([

    # ── HEADER ──────────────────────────────
    html.Div([
        html.H1(" AI Stock Price Predictor",
                style={'color': 'white', 'textAlign': 'center',
                       'marginBottom': '5px', 'fontSize': '32px'}),
        html.H3("Multi-Stock Machine Learning Dashboard",
                style={'color': '#aaa', 'textAlign': 'center', 'marginTop': '0'}),

        # Stock Selector
        html.Div([
            html.Label("Select Stock: ",
                       style={'color': 'white', 'marginRight': '10px',
                              'fontSize': '16px'}),
            dcc.Dropdown(
                id='stock-dropdown',
                options=[{'label': f"{v}  ({k})", 'value': k}
                         for k, v in STOCKS.items()],
                value='AAPL',
                clearable=False,
                style={'width': '380px', 'display': 'inline-block',
                       'verticalAlign': 'middle'}
            ),
            html.Span(id='loading-msg',
                      style={'color': '#ffaa00', 'marginLeft': '15px',
                             'fontSize': '15px'})
        ], style={'textAlign': 'center', 'padding': '15px'})

    ], style={'backgroundColor': '#1a1a2e', 'padding': '25px'}),

    # ── STATS CARDS ─────────────────────────
    html.Div(id='stats-cards',
             style={'display': 'flex', 'backgroundColor': '#1a1a2e',
                    'padding': '5px 20px 15px 20px'}),

    # ── CHART 1 — Price History + MAs ───────
    html.Div([
        html.H3(id='chart1-title',
                style={'color': 'white', 'padding': '15px 20px 0 20px',
                       'margin': '0'}),
        dcc.Graph(id='price-chart')
    ], style={'backgroundColor': '#16213e', 'margin': '20px',
              'borderRadius': '10px'}),

    # ── CHART 2 — Actual vs Predicted ───────
    html.Div([
        html.H3(" Actual vs Predicted Price",
                style={'color': 'white', 'padding': '15px 20px 0 20px',
                       'margin': '0'}),
        dcc.Graph(id='prediction-chart')
    ], style={'backgroundColor': '#16213e', 'margin': '20px',
              'borderRadius': '10px'}),

    # ── CHART 3 — Volume ────────────────────
    html.Div([
        html.H3(" Trading Volume Over Time",
                style={'color': 'white', 'padding': '15px 20px 0 20px',
                       'margin': '0'}),
        dcc.Graph(id='volume-chart')
    ], style={'backgroundColor': '#16213e', 'margin': '20px',
              'borderRadius': '10px'}),

    # ── CHART 4 — Daily Range ───────────────
    html.Div([
        html.H3(" Daily Price Range — Volatility",
                style={'color': 'white', 'padding': '15px 20px 0 20px',
                       'margin': '0'}),
        dcc.Graph(id='range-chart')
    ], style={'backgroundColor': '#16213e', 'margin': '20px',
              'borderRadius': '10px'}),

    # ── CHART 5 — Yearly Box Plot ───────────
    html.Div([
        html.H3(" Yearly Price Distribution",
                style={'color': 'white', 'padding': '15px 20px 0 20px',
                       'margin': '0'}),
        dcc.Graph(id='yearly-chart')
    ], style={'backgroundColor': '#16213e', 'margin': '20px',
              'borderRadius': '10px'}),

    # ── PREDICTION TOOL ─────────────────────
    html.Div([
        html.H3(" Predict Price for a Date",
                style={'color': 'white', 'padding': '15px 20px 0 20px',
                       'margin': '0'}),
        html.Div([
            html.P("Select a date from the last 100 trading days:",
                   style={'color': '#aaa', 'marginBottom': '8px'}),
            dcc.Dropdown(
                id='date-dropdown',
                clearable=False,
                style={'width': '300px'}
            ),
            html.Div(id='prediction-output',
                     style={'marginTop': '20px', 'fontSize': '20px',
                            'color': '#00ff88', 'fontWeight': 'bold'})
        ], style={'padding': '10px 20px 25px 20px'})
    ], style={'backgroundColor': '#16213e', 'margin': '20px',
              'borderRadius': '10px'}),

    # ── FOOTER ──────────────────────────────
    html.Div([
        html.P("AI Stock Price Predictor  |  Linear Regression Model ",
               style={'color': '#444', 'textAlign': 'center', 'margin': '0'})
    ], style={'backgroundColor': '#1a1a2e', 'padding': '20px'})

], style={'backgroundColor': '#0f0f1a', 'minHeight': '100vh',
          'fontFamily': 'Arial, sans-serif'})


# ── 6. MAIN CALLBACK — Update everything ────
@app.callback(
    Output('stats-cards',      'children'),
    Output('price-chart',      'figure'),
    Output('prediction-chart', 'figure'),
    Output('volume-chart',     'figure'),
    Output('range-chart',      'figure'),
    Output('yearly-chart',     'figure'),
    Output('date-dropdown',    'options'),
    Output('date-dropdown',    'value'),
    Output('chart1-title',     'children'),
    Output('loading-msg',      'children'),
    Input('stock-dropdown',    'value')
)
def update_stock(ticker):
    print("\n")
    print("CALLBACK FIRED")
    print("Ticker =", ticker)

    name = STOCKS.get(ticker, ticker)

    try:
        print("Calling get_stock_data...")
        df, r2, mae = get_stock_data(ticker)

    except Exception as e:
        print("ERROR:", str(e))

        empty = go.Figure()
        empty.update_layout(
            template='plotly_dark',
            paper_bgcolor='#16213e',
            plot_bgcolor='#16213e'
        )

        return (
            [],
            empty,
            empty,
            empty,
            empty,
            empty,
            [],
            None,
            "Error loading data",
            f" {str(e)}"
        )

    # ── Stat Cards ──────────────────────────
    cards = [
        make_card("Total Days",    str(len(df)),                    '#00d4ff'),
        make_card("R² Accuracy",   f"{r2}%",                       '#00ff88'),
        make_card("Avg Error MAE", f"${mae}",                      '#ffaa00'),
        make_card("Latest Price",  f"${df['Close'].iloc[-1]:.2f}", '#ff6b6b'),
    ]

    # ── Chart 1 — Price + Moving Averages ───
    fig1 = go.Figure()
    fig1.add_trace(go.Scatter(
        x=df.index, y=df['Close'],
        name='Close Price',
        line=dict(color='#00d4ff', width=1.5)
    ))
    fig1.add_trace(go.Scatter(
        x=df.index, y=df['MA_50'],
        name='50-Day MA',
        line=dict(color='#ffaa00', width=2)
    ))
    fig1.add_trace(go.Scatter(
        x=df.index, y=df['MA_200'],
        name='200-Day MA',
        line=dict(color='#ff6b6b', width=2)
    ))
    fig1.update_layout(
        template='plotly_dark', paper_bgcolor='#16213e',
        plot_bgcolor='#16213e', height=420,
        legend=dict(bgcolor='rgba(0,0,0,0)'),
        margin=dict(l=40, r=40, t=20, b=40)
    )

    # ── Chart 2 — Actual vs Predicted ───────
    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(
        x=df.index, y=df['Close'],
        name='Actual Price',
        line=dict(color='#00d4ff', width=1.5)
    ))
    fig2.add_trace(go.Scatter(
        x=df.index, y=df['Predicted'],
        name='Predicted Price',
        line=dict(color='#ff6b6b', width=1.5, dash='dash')
    ))
    fig2.update_layout(
        template='plotly_dark', paper_bgcolor='#16213e',
        plot_bgcolor='#16213e', height=420,
        legend=dict(bgcolor='rgba(0,0,0,0)'),
        margin=dict(l=40, r=40, t=20, b=40)
    )

    # ── Chart 3 — Volume Bar Chart ───────────
    fig3 = go.Figure()
    fig3.add_trace(go.Bar(
        x=df.index, y=df['Volume'],
        name='Volume',
        marker_color='#00d4ff',
        opacity=0.8,
        marker_line_width=0
    ))
    fig3.update_layout(
        template='plotly_dark', paper_bgcolor='#16213e',
        plot_bgcolor='#16213e', height=350,
        margin=dict(l=40, r=40, t=20, b=40)
    )

    # ── Chart 4 — Daily Range ────────────────
    fig4 = go.Figure()
    fig4.add_trace(go.Scatter(
        x=df.index, y=df['Daily_Range'],
        name='Daily Range',
        line=dict(color='#cc44ff', width=1),
        fill='tozeroy',
        fillcolor='rgba(204,68,255,0.1)'
    ))
    fig4.update_layout(
        template='plotly_dark', paper_bgcolor='#16213e',
        plot_bgcolor='#16213e', height=350,
        margin=dict(l=40, r=40, t=20, b=40)
    )

    # ── Chart 5 — Yearly Box Plot ────────────
    fig5 = go.Figure()
    for year in sorted(df['Year'].unique()):
        year_data = df[df['Year'] == year]['Close']
        fig5.add_trace(go.Box(
            y=year_data,
            name=str(year),
            marker_color='#00d4ff',
            line_color='#00d4ff',
            fillcolor='rgba(0,212,255,0.15)'
        ))
    fig5.update_layout(
        template='plotly_dark', paper_bgcolor='#16213e',
        plot_bgcolor='#16213e', height=420,
        showlegend=False,
        margin=dict(l=40, r=40, t=20, b=40)
    )

    # ── Date Dropdown ────────────────────────
    dates  = [{'label': str(d)[:10], 'value': str(d)[:10]}
              for d in df.index[-100:]]
    latest = str(df.index[-1])[:10]
    title  = f"📊 {name} ({ticker}) — Price History with Moving Averages"

    return cards, fig1, fig2, fig3, fig4, fig5, dates, latest, title, ""


# ── 7. PREDICTION CALLBACK ──────────────────
@app.callback(
    Output('prediction-output', 'children'),
    Input('date-dropdown',      'value'),
    Input('stock-dropdown',     'value')
)
def predict_for_date(selected_date, ticker):
    if not selected_date:
        return ""
    try:
        df, _, _ = get_stock_data(ticker)
        row       = df.loc[selected_date]
        actual    = row['Close']
        predicted = row['Predicted']
        error     = abs(actual - predicted)
        return [
            html.Span(f" {selected_date}     "),
            html.Span(f" Actual: ${actual:.2f}     "),
            html.Span(f" Predicted: ${predicted:.2f}     "),
            html.Span(f" Error: ${error:.2f}",
                      style={'color': '#ffaa00'})
        ]
    except Exception as e:
        return f"Date not available: {str(e)}"


# ── 8. RUN ───────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True)