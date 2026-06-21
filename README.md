# QuantSim — HFT Simulation Platform

A production-grade high-frequency trading simulator written in C++. Designed to mirror the architecture of a real quant trading firm's stack: a low-latency matching engine, pluggable strategy layer, live market data integration, and a full desktop GUI.

## What It Does

- Runs backtests against synthetic or CSV tick data with a realistic limit order book
- Supports 9 built-in strategies: Market Making (Avellaneda-Stoikov), Stat Arb, TWAP, Momentum, Mean Reversion, RSI, Breakout, Portfolio (N-asset), Options MM (Black-Scholes + Greeks)
- Compiles and loads custom C++ strategies at runtime via `.dylib` hot-swap
- Connects to Binance WebSocket for live paper trading
- Full Dear ImGui desktop GUI with real-time charts, order book ladder, optimizer, risk panel, and TCA tab


## Build & Run

```bash
./start.sh
```

Requires: CMake 3.23+, clang++, GLFW (`brew install glfw`), OpenSSL.

The script builds `quantsim` (GUI), `live_trader` (Binance live), and `quantsim_core` (Python module), then launches the app.

## Key Engine Features

- **Matching engine**: price-time FIFO with stop/stop-limit, post-only, iceberg, FOK, IOC order types
- **Realistic fills**: log-normal network latency model + FIFO queue position tracking
- **Transaction costs**: taker fee, maker rebate, short borrow per tick
- **Pre-trade risk**: max position, max notional, max loss kill-switch
- **Bot simulator**: configurable market participant bots for realistic book activity
- **Parameter optimizer**: grid search / sweep across 1-2 strategy parameters with heatmap output
- **Compare tab**: run up to 5 strategies side-by-side with tearsheet metrics

## Metrics Reported

Sharpe, Sortino, Calmar, Max Drawdown, Volatility, Win Rate, Profit Factor, Fill count, Avg Slippage, Queue Position, Maker %, VaR 95%, Greeks (options mode)

