import React, { useState, useEffect } from "react";

/**
 * StockTable
 *
 * Responsibilities:
 * - Display market table
 * - Handle Buy / Sell
 * - Handle Watchlist
 * - Emit "view report" (chart selection)
 *
 * @param stocks Array of stock objects
 * @param onSelectStock function(stock) -> show candlestick chart
 */
export const StockTable = ({ stocks, onSelectStock }) => {
  // ===== Portfolio =====
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem("portfolio");
    return saved ? JSON.parse(saved) : [];
  });

  // ===== Watchlist =====
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // ===== Trading =====
  const handleTrade = (stock, action) => {
    setPortfolio((prev) => {
      const existing = prev.find((p) => p.symbol === stock.symbol);

      if (existing) {
        return prev
          .map((p) =>
            p.symbol === stock.symbol
              ? {
                  ...p,
                  shares: p.shares + (action === "BUY" ? 1 : -1),
                }
              : p
          )
          .filter((p) => p.shares > 0);
      }

      if (action === "BUY") {
        return [...prev, { ...stock, shares: 1 }];
      }

      return prev;
    });

    if (action === "BUY") {
      LeoObserver.recordEventBuyStock({ stockSymbol: stock.symbol });
    } else {
      LeoObserver.recordEventSellStock({ stockSymbol: stock.symbol });
    }
  };

  // ===== Watchlist =====
  const isInWatchlist = (symbol) => watchlist.some((s) => s.symbol === symbol);

  const addToWatchlist = (stock) => {
    if (!isInWatchlist(stock.symbol)) {
      setWatchlist((prev) => [...prev, stock]);
      LeoObserver.recordEventAddWatchlist({ stockSymbol: stock.symbol });
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist((prev) => prev.filter((s) => s.symbol !== symbol));
    LeoObserver.recordEventRemoveWatchlist({ stockSymbol: symbol });
  };

  // ===== Render =====
  return (
    <div className="container-fluid my-4">
      {/* ===== Market Table ===== */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">Market Overview</h2>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Change</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {stocks.map((stock) => (
                  <tr
                    key={stock.symbol}
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectStock(stock)}
                    title="Click to view price chart"
                  >
                    <td className="fw-bold">{stock.symbol}</td>
                    <td>{stock.name}</td>
                    <td className="text-end">${stock.price.toFixed(2)}</td>
                    <td
                      className={`text-end fw-semibold ${
                        stock.change >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {stock.change >= 0 ? (
                        <i className="bi bi-arrow-up" />
                      ) : (
                        <i className="bi bi-arrow-down" />
                      )}{" "}
                      {Math.abs(stock.change).toFixed(2)}
                    </td>

                    {/* ===== Actions ===== */}
                    <td
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-success"
                          onClick={() => handleTrade(stock, "BUY")}
                        >
                          <i className="bi bi-bag-plus-fill me-1" />
                          Buy
                        </button>

                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleTrade(stock, "SELL")}
                        >
                          <i className="bi bi-bag-dash-fill me-1" />
                          Sell
                        </button>

                        {isInWatchlist(stock.symbol) ? (
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => removeFromWatchlist(stock.symbol)}
                          >
                            <i className="bi bi-star-fill me-1" />
                            Watching
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => addToWatchlist(stock)}
                          >
                            <i className="bi bi-star me-1" />
                            Watch
                          </button>
                        )}

                        <button
                          className="btn btn-outline-dark"
                          onClick={() => onSelectStock(stock)}
                        >
                          <i className="bi bi-graph-up me-1" />
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== Portfolio & Watchlist (unchanged) ===== */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <h2 className="h5 mb-0">My Portfolio</h2>
            </div>
            {portfolio.length === 0 ? (
              <div className="card-body text-center text-muted">
                <p className="mb-0">Your portfolio is empty.</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {portfolio.map((p) => (
                  <li
                    key={p.symbol}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <span className="fw-bold">{p.symbol}</span>
                      <small className="text-muted d-block">{p.name}</small>
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {p.shares} shares
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <h2 className="h5 mb-0">My Watchlist</h2>
            </div>
            {watchlist.length === 0 ? (
              <div className="card-body text-center text-muted">
                <p className="mb-0">Your watchlist is empty.</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {watchlist.map((stock) => (
                  <li
                    key={stock.symbol}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <span className="fw-bold">{stock.symbol}</span>
                      <small className="text-muted d-block">{stock.name}</small>
                    </div>
                    <button
                      onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                      className="btn btn-sm btn-close"
                      aria-label="Remove from watchlist"
                    ></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
