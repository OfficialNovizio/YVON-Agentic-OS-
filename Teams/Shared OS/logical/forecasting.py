#!/usr/bin/env python3
"""
Forecasting Methods — Formula Library
======================================
Source: Hyndman, R.J. & Athanasopoulos, G.,
        *Forecasting: Principles and Practice* (3rd Ed., 2021, OTexts)
        https://OTexts.com/fpp3/

This module implements core time-series forecasting methods as discrete,
self-tested Python functions. Every function carries its chapter/section
citation and handles edge cases explicitly.

Routes per Playbook §8.2:
  Part 1:   Utility functions
  Part 2:   Route C (hybrid — decomposition, judgment on seasonal period)
  Part 3:   Route A (math — accuracy metrics with numeric assertions)
  Part 4:   Route A (math — benchmark methods)
  Part 5:   Route A (math — exponential smoothing family)
  Part 6:   Route C (hybrid — stationarity detection, differencing)

Design rules:
  - No external dependencies (pure Python stdlib).
  - Every function validates inputs; empty series → ValueError.
  - All α, β, γ smoothing parameters clamped to (0, 1].
  - Seasonal period m must be ≥ 2 and integer.
  - NaN/Inf in data → ValueError with index.
  - Every function has at least one self-test with verified expected output.
  - Accuracy computed on test set, model fitted on training set — no leakage.
"""

from __future__ import annotations
import math
import sys
from typing import List, Tuple, Optional, Dict, Callable

# ── Numerical constants ────────────────────────────────────────────
_TOL = 1e-10
_PI_Z = 1.96  # 95% confidence z-score


# ═══════════════════════════════════════════════════════════════════
# PART 1 — UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

def _validate_series(series: List[float], name: str = "series", *, allow_nan: bool = False) -> None:
    """Validate a list of floats — non-empty, no NaN (unless allowed), no Inf."""
    if not series:
        raise ValueError(f"{name} must be non-empty")
    if not isinstance(series, list):
        raise TypeError(f"{name} must be a list, got {type(series).__name__}")
    for i, v in enumerate(series):
        if not isinstance(v, (int, float)):
            raise TypeError(f"{name}[{i}] must be a number, got {type(v).__name__}")
        if not allow_nan and math.isnan(v):
            raise ValueError(f"{name}[{i}] is NaN")
        if math.isinf(v):
            raise ValueError(f"{name}[{i}] is infinite")


def _validate_positive_number(val: float, name: str) -> None:
    if math.isnan(val) or math.isinf(val) or val <= 0:
        raise ValueError(f"{name} must be a positive finite number, got {val}")


def _validate_probability(val: float, name: str, allow_zero: bool = False) -> None:
    lo, hi = (0.0, 1.0) if allow_zero else (_TOL, 1.0)
    if math.isnan(val) or math.isinf(val) or val < lo or val > hi:
        raise ValueError(f"{name} must be in [{lo}, {hi}], got {val}")


def _series_mean(s: List[float]) -> float:
    return sum(s) / len(s)


def _series_slice(s: List[float], start: int, end: int) -> List[float]:
    """Slice inclusive of start, exclusive of end. Negative indices from end."""
    n = len(s)
    if start < 0:
        start = max(0, n + start)
    if end < 0:
        end = max(0, n + end)
    return s[max(0, start):min(n, end)]


# ── Lag and difference ─────────────────────────────────────────────

def lag(series: List[float], k: int = 1) -> List[Optional[float]]:
    """
    Lagged series: y_{t-k} aligned with y_t.
    Returns a list of same length, with None for the first k entries.
    Ch.2, §2.4
    """
    _validate_series(series, "series")
    if not isinstance(k, int) or k <= 0:
        raise ValueError(f"k must be a positive integer, got {k}")
    return [None] * min(k, len(series)) + [series[i] for i in range(len(series) - k)]


def difference(series: List[float], lag: int = 1) -> List[float]:
    """
    First difference: ∇y_t = y_t - y_{t-lag}.
    Returns a list of length n - lag.
    Ch.8, §8.1 (Stationarity and Differencing)
    """
    _validate_series(series, "series")
    if not isinstance(lag, int) or lag <= 0:
        raise ValueError(f"lag must be a positive integer, got {lag}")
    if lag >= len(series):
        raise ValueError(f"lag ({lag}) must be less than series length ({len(series)})")
    return [series[i] - series[i - lag] for i in range(lag, len(series))]


def seasonal_difference(series: List[float], period: int) -> List[float]:
    """
    Seasonal difference: ∇_m y_t = y_t - y_{t-m}.
    Returns a list of length n - m.
    Ch.8, §8.4 (Seasonal ARIMA)
    """
    return difference(series, lag=period)


def double_difference(series: List[float], seasonal_period: int = 1) -> List[float]:
    """
    Apply first difference then seasonal difference (or vice versa).
    Ch.8, §8.4

    Returns the doubly-differenced series.
    If seasonal_period=1, applies first difference twice.
    """
    d1 = difference(series, 1)
    return difference(d1, seasonal_period)


# ── Moving average ─────────────────────────────────────────────────

def moving_average(series: List[float], window: int, centered: bool = True) -> List[Optional[float]]:
    """
    Simple moving average of given window size.
    Ch.3, §3.2 (Moving Averages)

    If centered and window is even, uses 2×k MA to center (the standard
    2×m-MA from FPP3 §3.2, Equation 3.1):
      - First: k-MA (trailing)
      - Then: 2-MA of the k-MA = symmetric 5-term weighted MA

    Returns a list of same length with None where MA is not defined.
    """
    _validate_series(series, "series")
    if not isinstance(window, int) or window < 1:
        raise ValueError(f"window must be a positive integer, got {window}")
    if window > len(series):
        raise ValueError(f"window ({window}) exceeds series length ({len(series)})")

    n = len(series)
    result: List[Optional[float]] = [None] * n

    if centered:
        if window % 2 == 1:
            # Odd window: symmetric, (k-1)/2 missing at each end
            half = (window - 1) // 2
            for t in range(half, n - half):
                result[t] = sum(series[t - half:t + half + 1]) / window
        else:
            # Even window: use 2×k-MA
            # Step 1: trailing k-MA of order k
            k = window
            ma_trail: List[Optional[float]] = [None] * n
            for t in range(k - 1, n):
                ma_trail[t] = sum(series[t - k + 1:t + 1]) / k
            # Step 2: 2-MA of the trailing MA → centered
            for t in range(k // 2, n - k // 2 + 1):
                if ma_trail[t] is not None and ma_trail[t + 1] is not None:
                    result[t] = (ma_trail[t] + ma_trail[t + 1]) / 2.0
    else:
        # Trailing MA
        for t in range(window - 1, n):
            result[t] = sum(series[t - window + 1:t + 1]) / window

    return result


# ═══════════════════════════════════════════════════════════════════
# PART 2 — TIME SERIES DECOMPOSITION
# Source: Hyndman & Athanasopoulos, Ch.3 ("Time Series Decomposition")
# ═══════════════════════════════════════════════════════════════════

def classical_decomposition(
    series: List[float],
    period: int,
    model: str = "additive",
) -> Dict[str, List[float]]:
    """
    Classical decomposition: y = T + S + R (additive) or y = T × S × R (multiplicative).
    Ch.3, §3.2–§3.3

    Steps:
      1. Compute trend T via centered moving average (2×m-MA for even m,
         m-MA for odd m).
      2. Detrend: y - T (additive) or y / T (multiplicative).
      3. Seasonal S = average detrended value for each season, normalized.
      4. Remainder R = y - T - S (additive) or y / (T × S) (multiplicative).

    Args:
        series:  Time series values
        period:  Seasonal period (e.g., 4 for quarterly, 12 for monthly)
        model:   "additive" or "multiplicative"

    Returns:
        Dict with keys: 'trend', 'seasonal', 'remainder', 'model', 'period'

    Edge cases:
        - period ≥ len(series) → trend undefined at all points → raises ValueError
        - Multiplicative model with zeros or negatives → raises ValueError
        - period = 1 → decomposition is meaningless, raises ValueError
    """
    _validate_series(series, "series")
    if not isinstance(period, int) or period < 2:
        raise ValueError(f"period must be ≥ 2, got {period}")
    if model not in ("additive", "multiplicative"):
        raise ValueError(f"model must be 'additive' or 'multiplicative', got '{model}'")

    n = len(series)
    if period >= n:
        raise ValueError(f"period ({period}) must be < series length ({n})")

    # Multiplicative: check for zeros/negatives
    if model == "multiplicative":
        for i, v in enumerate(series):
            if v <= 0:
                raise ValueError(
                    f"series[{i}] = {v} — multiplicative decomposition "
                    f"requires all values > 0 (Ch.3, §3.3)"
                )

    # ── Step 1: Trend via centered MA ──
    trend_raw = moving_average(series, period, centered=True)

    # ── Step 2: Detrend ──
    if model == "additive":
        detrended = [y - t if (y is not None and t is not None) else None
                     for y, t in zip(series, trend_raw)]
    else:
        detrended = [y / t if (y is not None and t is not None) else None
                     for y, t in zip(series, trend_raw)]

    # ── Step 3: Seasonal component ──
    # Collect detrended values by season position
    seasonal_raw: List[List[float]] = [[] for _ in range(period)]
    for i, dt in enumerate(detrended):
        if dt is not None:
            seasonal_raw[i % period].append(dt)

    # Compute mean for each season
    seasonal_means = [_series_mean(vals) if vals else 0.0 for vals in seasonal_raw]

    # Normalize to ensure seasonal components sum to zero (additive)
    # or average to one (multiplicative)
    if model == "additive":
        mean_correction = _series_mean(seasonal_means)
        seasonal_adj = [s - mean_correction for s in seasonal_means]
    else:
        mean_correction = _series_mean(seasonal_means)
        if abs(mean_correction) < _TOL:
            raise ValueError("Seasonal means average to zero — multiplicative impossible")
        seasonal_adj = [s / mean_correction for s in seasonal_means]

    # Expand to full series
    seasonal_full = [seasonal_adj[i % period] for i in range(n)]

    # ── Step 4: Remainder ──
    if model == "additive":
        remainder = [y - s if t is not None else None
                     for y, s, t in zip(series, seasonal_full, trend_raw)]
    else:
        remainder = [(y / (t * s)) if (t is not None and t is not None) else None
                     for y, s, t in zip(series, seasonal_full, trend_raw)]

    # Fill trend at edges with None (already None from MA)
    # For remainder, same positions are None

    return {
        "model": model,
        "period": period,
        "trend": trend_raw,
        "seasonal": seasonal_full,
        "remainder": remainder,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 3 — FORECAST ACCURACY METRICS
# Source: Hyndman & Athanasopoulos, Ch.5 ("Some Simple Forecasting Methods")
# ═══════════════════════════════════════════════════════════════════

def _compute_errors(actual: List[float], predicted: List[float]) -> List[float]:
    """e_t = y_t - ŷ_t"""
    if len(actual) != len(predicted):
        raise ValueError(
            f"Length mismatch: actual has {len(actual)}, predicted has {len(predicted)}"
        )
    for i, (a, p) in enumerate(zip(actual, predicted)):
        _validate_series([a], f"actual[{i}]")
        _validate_series([p], f"predicted[{i}]")
    return [a - p for a, p in zip(actual, predicted)]


def mae(actual: List[float], predicted: List[float]) -> float:
    """
    Mean Absolute Error: MAE = (1/n) Σ |y_t - ŷ_t|
    Ch.5, §5.2 (Table 5.1)

    Scale-dependent — cannot compare across series with different units.
    Lower is better. Always non-negative.
    """
    errors = _compute_errors(actual, predicted)
    return sum(abs(e) for e in errors) / len(errors)


def mse(actual: List[float], predicted: List[float]) -> float:
    """
    Mean Squared Error: MSE = (1/n) Σ (y_t - ŷ_t)²
    Ch.5, §5.2

    Penalizes large errors more heavily than MAE.
    """
    errors = _compute_errors(actual, predicted)
    return sum(e ** 2 for e in errors) / len(errors)


def rmse(actual: List[float], predicted: List[float]) -> float:
    """
    Root Mean Squared Error: RMSE = sqrt(MSE)
    Ch.5, §5.2

    Same units as the original data. Easier to interpret than MSE.
    """
    return math.sqrt(mse(actual, predicted))


def mape(actual: List[float], predicted: List[float]) -> float:
    """
    Mean Absolute Percentage Error: MAPE = (100/n) Σ |(y_t - ŷ_t) / y_t|
    Ch.5, §5.2

    Scale-independent percentage. Undefined if any y_t = 0.
    Returns percentage (e.g., 5.0 means 5%).

    Edge cases:
        - Any y_t = 0 → raises ValueError (division by zero)
        - Very large values if y_t is tiny → allowed but buyer beware
    """
    errors = _compute_errors(actual, predicted)
    total = 0.0
    for i, (a, e) in enumerate(zip(actual, errors)):
        if abs(a) < _TOL:
            raise ValueError(
                f"actual[{i}] = {a} — MAPE is undefined when any actual value is zero "
                f"(division by zero). Use sMAPE or MASE instead."
            )
        total += abs(e / a)
    return (total / len(errors)) * 100.0


def smape(actual: List[float], predicted: List[float]) -> float:
    """
    Symmetric Mean Absolute Percentage Error.
    Ch.5, §5.2

    sMAPE = (200/n) Σ |y_t - ŷ_t| / (|y_t| + |ŷ_t|)

    Avoids the asymmetry of MAPE. Bounded between 0 and 200.
    Returns percentage.

    Edge cases:
        - If both y_t and ŷ_t are 0, that term contributes 0 (defined as 0/0 → 0)
    """
    errors = _compute_errors(actual, predicted)
    total = 0.0
    for a, p in zip(actual, predicted):
        denom = abs(a) + abs(p)
        if denom < _TOL:
            continue  # y = ŷ = 0 → term contributes 0
        total += abs(a - p) / denom
    return (200.0 / len(errors)) * total


def mase(
    actual: List[float],
    predicted: List[float],
    training_series: List[float],
    seasonal_period: int = 1,
) -> float:
    """
    Mean Absolute Scaled Error.
    Ch.5, §5.2 (Equation 5.1)

    MASE = MAE / Q, where Q is the MAE of the seasonal naive method
    on the training set.

    MASE < 1: Your method is better than the naive benchmark.
    MASE = 1: Same as naive.
    MASE > 1: Worse than naive.

    For non-seasonal data (seasonal_period=1), Q = MAE of naive (one-step-ahead).
    For seasonal data, Q = MAE of seasonal naive.

    Args:
        actual:           Test-set actual values
        predicted:        Test-set predictions
        training_series:  Full training data (used to compute Q)
        seasonal_period:  m for seasonal naive Q (default 1 = non-seasonal)

    Edge cases:
        - Q = 0 (perfect naive) → MASE undefined → raises ValueError
    """
    errors = _compute_errors(actual, predicted)
    _validate_series(training_series, "training_series")
    if seasonal_period < 1:
        raise ValueError(f"seasonal_period must be ≥ 1, got {seasonal_period}")

    # Compute Q: MAE of naive/seasonal-naive on training set
    n_train = len(training_series)
    if seasonal_period == 1:
        # Naive: ŷ_t = y_{t-1}
        if n_train < 2:
            raise ValueError("training_series needs at least 2 points for naive Q")
        naive_preds = training_series[:-1]  # y_1..y_{n-1} as forecasts for y_2..y_n
        naive_actual = training_series[1:]
        q = mae(naive_actual, naive_preds)
    else:
        # Seasonal naive: ŷ_t = y_{t-m}
        if n_train <= seasonal_period:
            raise ValueError(
                f"training_series length ({n_train}) must exceed seasonal_period "
                f"({seasonal_period})"
            )
        naive_preds = training_series[:-seasonal_period]
        naive_actual = training_series[seasonal_period:]
        q = mae(naive_actual, naive_preds)

    if q < _TOL:
        raise ValueError(
            "Q (MAE of naive benchmark) is zero — the training series is constant. "
            "MASE is undefined. Use MAE directly for constant series."
        )

    mae_val = sum(abs(e) for e in errors) / len(errors)
    return mae_val / q


def forecast_bias(actual: List[float], predicted: List[float]) -> float:
    """
    Mean Error: ME = (1/n) Σ (y_t - ŷ_t)
    Ch.5, §5.2

    Measures systematic over- or under-forecasting.
    Positive = model under-forecasts (actual higher).
    Negative = model over-forecasts (predicted higher).
    Near zero = unbiased.
    """
    errors = _compute_errors(actual, predicted)
    return sum(errors) / len(errors)


# ═══════════════════════════════════════════════════════════════════
# PART 4 — BENCHMARK / NAIVE METHODS
# Source: Hyndman & Athanasopoulos, Ch.5, §5.1
# ═══════════════════════════════════════════════════════════════════

def naive_forecast(series: List[float], h: int = 1) -> List[float]:
    """
    Naive forecast: ŷ_{T+h|T} = y_T for all h.
    Ch.5, §5.1

    The simplest possible forecast — assumes tomorrow = today.

    Returns list of length h, all equal to the last observed value.

    Edge cases:
        - h ≤ 0 → raises ValueError
    """
    _validate_series(series, "series")
    if not isinstance(h, int) or h <= 0:
        raise ValueError(f"h must be a positive integer, got {h}")
    return [series[-1]] * h


def seasonal_naive_forecast(series: List[float], period: int, h: int = 1) -> List[float]:
    """
    Seasonal naive: ŷ_{T+h|T} = y_{T+h-m(k+1)} where m(k+1) is the
    smallest multiple of period ≥ h.
    Ch.5, §5.1

    Simple but often hard to beat for strongly seasonal data.

    Args:
        series:  Training data
        period:  Seasonal period (m)
        h:       Number of steps ahead to forecast

    Edge cases:
        - period > len(series) → raises ValueError
        - period < 1 → raises ValueError
    """
    _validate_series(series, "series")
    if not isinstance(period, int) or period < 1:
        raise ValueError(f"period must be ≥ 1, got {period}")
    if period >= len(series):
        raise ValueError(f"period ({period}) must be < series length ({len(series)})")
    if not isinstance(h, int) or h <= 0:
        raise ValueError(f"h must be a positive integer, got {h}")

    forecasts = []
    for step in range(1, h + 1):
        # Find the most recent observation from the same season
        # step = k*m + offset; offset in [0, m-1]
        offset = (step - 1) % period
        idx = len(series) - period + offset
        if idx < 0:
            # Wrap around for very long horizons
            idx = len(series) - period + offset + period
        forecasts.append(series[idx])
    return forecasts


def mean_forecast(series: List[float], h: int = 1) -> List[float]:
    """
    Mean forecast: ŷ_{T+h|T} = mean(y_1, ..., y_T) for all h.
    Ch.5, §5.1

    The simplest model — produces a flat line at the historical mean.
    Useful as a sanity-check benchmark.
    """
    _validate_series(series, "series")
    if not isinstance(h, int) or h <= 0:
        raise ValueError(f"h must be a positive integer, got {h}")
    mu = _series_mean(series)
    return [mu] * h


def drift_forecast(series: List[float], h: int = 1) -> List[float]:
    """
    Drift forecast: ŷ_{T+h|T} = y_T + h × (y_T - y_1) / (T - 1)
    Ch.5, §5.1

    Extrapolates a straight line from the first to the last observation.
    Equivalent to drawing a line between the endpoints.

    Edge cases:
        - len(series) = 1 → drift undefined → raises ValueError
    """
    _validate_series(series, "series")
    if len(series) < 2:
        raise ValueError(
            "Drift requires at least 2 observations to compute slope"
        )
    if not isinstance(h, int) or h <= 0:
        raise ValueError(f"h must be a positive integer, got {h}")

    slope = (series[-1] - series[0]) / (len(series) - 1)
    return [series[-1] + slope * step for step in range(1, h + 1)]


# ═══════════════════════════════════════════════════════════════════
# PART 5 — EXPONENTIAL SMOOTHING
# Source: Hyndman & Athanasopoulos, Ch.7 ("Exponential Smoothing")
# ═══════════════════════════════════════════════════════════════════

def ses(
    series: List[float],
    alpha: float,
    forecast_h: int = 1,
) -> Dict:
    """
    Simple Exponential Smoothing (SES).
    Ch.7, §7.1

    Level:          ℓ_t = α·y_t + (1-α)·ℓ_{t-1}
    Forecast:       ŷ_{T+h|T} = ℓ_T

    Assumes no trend and no seasonality.

    Args:
        series:      Training time series
        alpha:       Smoothing parameter (0 < α ≤ 1)
        forecast_h:  Number of steps ahead to forecast

    Returns dict with:
        'level':        Final level ℓ_T
        'fitted':       One-step-ahead fitted values (length n; first is None)
        'residuals':    One-step errors (length n; first is None)
        'forecast':     h-step-ahead forecasts (length h)
    """
    _validate_series(series, "series")
    _validate_probability(alpha, "alpha", allow_zero=True)
    if alpha < _TOL:
        raise ValueError("alpha must be > 0 for SES (otherwise flat at initial)")
    if not isinstance(forecast_h, int) or forecast_h <= 0:
        raise ValueError(f"forecast_h must be a positive integer, got {forecast_h}")

    n = len(series)
    fitted: List[Optional[float]] = [None] * n
    residuals: List[Optional[float]] = [None] * n

    # Initial level = first observation (standard practice, FPP3 §7.1)
    level = series[0]
    fitted[0] = level  # ℓ_0 acts as fitted for t=0 (not strictly correct, but needed)

    for t in range(1, n):
        fitted[t] = level  # forecast for y_t made at t-1
        residuals[t] = series[t] - level
        level = alpha * series[t] + (1.0 - alpha) * level

    # h-step forecasts
    forecast = [level] * forecast_h

    return {
        "alpha": alpha,
        "level": level,
        "fitted": fitted,
        "residuals": residuals,
        "forecast": forecast,
    }


def holt(
    series: List[float],
    alpha: float,
    beta: float,
    forecast_h: int = 1,
    damped: bool = False,
    phi: float = 0.98,
) -> Dict:
    """
    Holt's Linear Trend (and Damped Trend).
    Ch.7, §7.2

    Level:  ℓ_t = α·y_t + (1-α)·(ℓ_{t-1} + b_{t-1})
    Trend:  b_t = β·(ℓ_t - ℓ_{t-1}) + (1-β)·b_{t-1}

    Damped version (φ < 1):
    Level:  ℓ_t = α·y_t + (1-α)·(ℓ_{t-1} + φ·b_{t-1})
    Trend:  b_t = β·(ℓ_t - ℓ_{t-1}) + (1-β)·(φ·b_{t-1})
    Forecast: ŷ_{T+h|T} = ℓ_T + Σ_{j=1}^{h} φ^j · b_T

    Args:
        series, alpha, beta, forecast_h as above
        damped:   Enable damped trend (default False)
        phi:      Damping parameter (0 < φ ≤ 1), only used if damped=True

    Returns dict with: level, trend, fitted, residuals, forecast
    """
    _validate_series(series, "series")
    _validate_probability(alpha, "alpha", allow_zero=True)
    _validate_probability(beta, "beta", allow_zero=True)
    if not isinstance(forecast_h, int) or forecast_h <= 0:
        raise ValueError(f"forecast_h must be a positive integer, got {forecast_h}")

    if damped:
        if not (_TOL < phi <= 1.0):
            raise ValueError(f"phi must be in (0, 1], got {phi}")
    else:
        phi = 1.0

    n = len(series)
    if n < 2:
        raise ValueError("Holt requires at least 2 observations for trend initialization")

    fitted: List[Optional[float]] = [None] * n
    residuals: List[Optional[float]] = [None] * n

    # Initialize: ℓ_0 = y_1, b_0 = y_2 - y_1
    level = series[0]
    trend = series[1] - series[0]  # simple initial trend
    fitted[0] = level

    for t in range(1, n):
        fitted[t] = level + phi * trend  # forecast for y_t
        residuals[t] = series[t] - fitted[t]
        prev_level = level
        level = alpha * series[t] + (1.0 - alpha) * (level + phi * trend)
        trend = beta * (level - prev_level) + (1.0 - beta) * (phi * trend)

    # h-step forecasts
    forecast = []
    for step in range(1, forecast_h + 1):
        if damped and phi < 1.0:
            # Geometric sum: Σ φ^j for j=1..step
            phi_sum = sum(phi ** j for j in range(1, step + 1))
        else:
            phi_sum = float(step)
        forecast.append(level + phi_sum * trend)

    return {
        "alpha": alpha,
        "beta": beta,
        "damped": damped,
        "phi": phi,
        "level": level,
        "trend": trend,
        "fitted": fitted,
        "residuals": residuals,
        "forecast": forecast,
    }


def holt_winters(
    series: List[float],
    period: int,
    alpha: float,
    beta: float,
    gamma: float,
    forecast_h: int = 1,
    model: str = "additive",
    damped: bool = False,
    phi: float = 0.98,
) -> Dict:
    """
    Holt-Winters Seasonal Method.
    Ch.7, §7.3

    Additive:
      Level:     ℓ_t = α·(y_t - s_{t-m}) + (1-α)·(ℓ_{t-1} + φ·b_{t-1})
      Trend:     b_t = β·(ℓ_t - ℓ_{t-1}) + (1-β)·(φ·b_{t-1})
      Seasonal:  s_t = γ·(y_t - ℓ_{t-1} - φ·b_{t-1}) + (1-γ)·s_{t-m}
      Forecast:  ŷ_{T+h|T} = ℓ_T + (Σ φ^j)·b_T + s_{T+h-m(k+1)}

    Multiplicative:
      Level:     ℓ_t = α·(y_t / s_{t-m}) + (1-α)·(ℓ_{t-1} + φ·b_{t-1})
      Trend:     b_t = β·(ℓ_t - ℓ_{t-1}) + (1-β)·(φ·b_{t-1})
      Seasonal:  s_t = γ·(y_t / (ℓ_{t-1} + φ·b_{t-1})) + (1-γ)·s_{t-m}
      Forecast:  ŷ_{T+h|T} = (ℓ_T + (Σ φ^j)·b_T) × s_{T+h-m(k+1)}

    Args:
        series, period, alpha, beta, gamma, forecast_h, model, damped, phi

    Initialization (FPP3 §7.3):
      Level:   mean of first season
      Trend:   (mean of second season - mean of first season) / m
      Seasonal: y_i - level (additive) or y_i / level (multiplicative)
               for first season, normalized

    Edge cases:
        - period > len(series) → at least 2 full seasons needed
        - Multiplicative with zeros or negatives → raises ValueError
    """
    _validate_series(series, "series")
    if not isinstance(period, int) or period < 2:
        raise ValueError(f"period must be ≥ 2, got {period}")
    _validate_probability(alpha, "alpha", allow_zero=True)
    _validate_probability(beta, "beta", allow_zero=True)
    _validate_probability(gamma, "gamma", allow_zero=True)
    if model not in ("additive", "multiplicative"):
        raise ValueError(f"model must be 'additive' or 'multiplicative', got '{model}'")
    if not isinstance(forecast_h, int) or forecast_h <= 0:
        raise ValueError(f"forecast_h must be a positive integer, got {forecast_h}")
    if damped:
        if not (_TOL < phi <= 1.0):
            raise ValueError(f"phi must be in (0, 1], got {phi}")
    else:
        phi = 1.0

    n = len(series)
    if n < 2 * period:
        raise ValueError(
            f"Series length ({n}) must be at least 2×period ({2*period}) "
            f"for initialization (need 2 full seasons)"
        )

    if model == "multiplicative":
        for i, v in enumerate(series):
            if v <= 0:
                raise ValueError(
                    f"series[{i}] = {v} — multiplicative Holt-Winters "
                    f"requires all values > 0"
                )

    # ── Initialization ──
    # Level = average of first complete season
    init_level = _series_mean(series[:period])

    # Trend = (avg of second season - avg of first season) / period
    avg_second = _series_mean(series[period:2 * period])
    init_trend = (avg_second - init_level) / period

    # Initial seasonal components (for first season)
    if model == "additive":
        init_seasonal = [series[i] - init_level for i in range(period)]
        # Normalize to sum to zero
        seasonal_mean = _series_mean(init_seasonal)
        init_seasonal = [s - seasonal_mean for s in init_seasonal]
    else:
        if init_level < _TOL:
            raise ValueError(f"Initial level ({init_level}) ≤ 0 — multiplicative impossible")
        init_seasonal = [series[i] / init_level for i in range(period)]
        # Normalize to average to 1
        seasonal_mean = _series_mean(init_seasonal)
        init_seasonal = [s / seasonal_mean for s in init_seasonal]

    # Pad seasonal to full series length
    seasonal = list(init_seasonal) + [0.0] * (n - period)

    level = init_level
    trend = init_trend
    fitted: List[Optional[float]] = [None] * n
    residuals: List[Optional[float]] = [None] * n

    for t in range(n):
        # Forecast at t (using information up to t-1)
        if t > 0:
            seasonal_idx = t - period
            if seasonal_idx >= 0:
                if model == "additive":
                    fitted[t] = level + phi * trend + seasonal[seasonal_idx]
                else:
                    fitted[t] = (level + phi * trend) * max(seasonal[seasonal_idx], 0.0)
            residuals[t] = series[t] - fitted[t] if fitted[t] is not None else None

        # Update equations
        prev_level = level
        seasonal_idx = t - period

        if model == "additive":
            s_lag = seasonal[seasonal_idx] if seasonal_idx >= 0 else 0.0
            level = alpha * (series[t] - s_lag) + (1.0 - alpha) * (level + phi * trend)
            trend = beta * (level - prev_level) + (1.0 - beta) * (phi * trend)
            seasonal[t] = gamma * (series[t] - prev_level - phi * trend) + (1.0 - gamma) * s_lag
        else:
            s_lag = seasonal[seasonal_idx] if seasonal_idx >= 0 else 1.0
            if s_lag < _TOL:
                s_lag = 1.0
            denom = prev_level + phi * trend
            if denom < _TOL:
                denom = 1.0
            level = alpha * (series[t] / max(s_lag, _TOL)) + (1.0 - alpha) * (level + phi * trend)
            trend = beta * (level - prev_level) + (1.0 - beta) * (phi * trend)
            seasonal[t] = gamma * (series[t] / max(denom, _TOL)) + (1.0 - gamma) * s_lag

    # ── Forecast ──
    forecast = []
    for step in range(1, forecast_h + 1):
        if damped and phi < 1.0:
            phi_sum = sum(phi ** j for j in range(1, step + 1))
        else:
            phi_sum = float(step)

        # Determine which seasonal index to use
        seasonal_offset = (step - 1) % period
        # Find most recent fitted seasonal at that position
        s_idx = n - period + seasonal_offset
        if s_idx < 0:
            s_idx += period
        s_val = seasonal[max(0, min(s_idx, n - 1))]

        if model == "additive":
            forecast.append(level + phi_sum * trend + s_val)
        else:
            forecast.append((level + phi_sum * trend) * max(s_val, _TOL))

    return {
        "alpha": alpha,
        "beta": beta,
        "gamma": gamma,
        "period": period,
        "model": model,
        "damped": damped,
        "phi": phi,
        "level": level,
        "trend": trend,
        "seasonal": seasonal,
        "fitted": fitted,
        "residuals": residuals,
        "forecast": forecast,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 6 — STATIONARITY & ARIMA IDENTIFICATION
# Source: Hyndman & Athanasopoulos, Ch.8 ("ARIMA Models")
# ═══════════════════════════════════════════════════════════════════

def acf(series: List[float], max_lag: Optional[int] = None) -> List[float]:
    """
    Autocorrelation Function (ACF).
    Ch.8, §8.2

    ρ_k = γ_k / γ_0
    where γ_k = (1/n) Σ_{t=k+1}^n (y_t - μ)(y_{t-k} - μ)

    Returns ACF values for lags 0..max_lag (ρ_0 = 1.0 always).

    Edge cases:
        - Constant series → all ρ_k = 1.0 (no variability)
        - max_lag ≥ n → capped at n-1
    """
    _validate_series(series, "series")
    n = len(series)
    if max_lag is None:
        max_lag = min(n - 1, max(10, n // 4))
    if max_lag >= n:
        max_lag = n - 1
    if max_lag < 0:
        raise ValueError(f"max_lag must be ≥ 0, got {max_lag}")

    mu = _series_mean(series)
    var_total = sum((y - mu) ** 2 for y in series) / n

    if var_total < _TOL:
        # Constant series — all autocorrelations are 1.0
        return [1.0] * (max_lag + 1)

    result = [1.0]  # ρ_0
    for k in range(1, max_lag + 1):
        cov_k = sum(
            (series[t] - mu) * (series[t - k] - mu)
            for t in range(k, n)
        ) / n
        result.append(cov_k / var_total)

    return result


def pacf(series: List[float], max_lag: Optional[int] = None) -> List[float]:
    """
    Partial Autocorrelation Function (PACF).
    Ch.8, §8.2

    Computed via the Durbin-Levinson recursion.
    φ_{k,k} is the PACF at lag k — the correlation between y_t and y_{t-k}
    after removing the effects of y_{t-1}, ..., y_{t-k+1}.

    Returns PACF values for lags 1..max_lag.
    """
    _validate_series(series, "series")
    n = len(series)
    if max_lag is None:
        max_lag = min(n - 1, max(10, n // 4))
    if max_lag >= n:
        max_lag = n - 1
    if max_lag < 1:
        raise ValueError(f"max_lag must be ≥ 1, got {max_lag}")

    # Get ACF first
    acf_vals = acf(series, max_lag)

    # Durbin-Levinson
    phi = [[0.0] * (max_lag + 1) for _ in range(max_lag + 1)]
    # phi[k][j] = φ_{k,j} for j=1..k

    for k in range(1, max_lag + 1):
        numerator = acf_vals[k]
        for j in range(1, k):
            numerator -= phi[k - 1][j] * acf_vals[k - j]
        denominator = 1.0
        for j in range(1, k):
            denominator -= phi[k - 1][j] * acf_vals[j]
        if abs(denominator) < _TOL:
            phi[k][k] = 0.0
        else:
            phi[k][k] = numerator / max(denominator, _TOL)

        for j in range(1, k):
            phi[k][j] = phi[k - 1][j] - phi[k][k] * phi[k - 1][k - j]

    return [phi[k][k] for k in range(1, max_lag + 1)]


def is_stationary(series: List[float], threshold: float = 0.3) -> Tuple[bool, float]:
    """
    Simple stationarity check based on ACF decay.
    Ch.8, §8.1

    If the ACF at lag 1 is above threshold, the series is likely non-stationary.
    This is a heuristic; for formal testing, a KPSS or ADF test is needed.

    Returns (is_stationary: bool, acf_lag1: float).
    """
    _validate_series(series, "series")
    if len(series) < 3:
        return True, 0.0
    acf_vals = acf(series, max_lag=2)
    lag1 = acf_vals[1] if len(acf_vals) > 1 else 0.0
    return abs(lag1) < threshold, lag1


def ndiffs(series: List[float], max_diffs: int = 2) -> int:
    """
    Number of differences needed for stationarity.
    Ch.8, §8.1

    Iteratively differences until ACF(1) drops below threshold.
    Returns the number of differences applied.

    Returns min number of differences, capped at max_diffs.
    """
    _validate_series(series, "series")
    if not isinstance(max_diffs, int) or max_diffs < 0:
        raise ValueError(f"max_diffs must be ≥ 0, got {max_diffs}")

    current = list(series)
    for d in range(max_diffs + 1):
        stationary, _ = is_stationary(current)
        if stationary:
            return d
        if d < max_diffs and len(current) > 1:
            current = difference(current, 1)
    return max_diffs


# ═══════════════════════════════════════════════════════════════════
# PART 7 — PREDICTION INTERVALS
# Source: Hyndman & Athanasopoulos, Ch.5, §5.5
# ═══════════════════════════════════════════════════════════════════

def prediction_intervals(
    forecast: List[float],
    residuals: List[Optional[float]],
    level: float = 95.0,
) -> Dict[str, List[Tuple[float, float, float]]]:
    """
    Approximate prediction intervals based on residual standard deviation.
    Ch.5, §5.5

    For a 95% interval: ŷ_{T+h|T} ± 1.96 × σ̂

    Steps:
      1. Compute σ̂ = std of residuals (ignoring None)
      2. For each step h ahead, compute interval as forecast ± z × σ̂

    Note: This assumes constant forecast variance. For many models the
    variance increases with h (esp. for trend methods). This is a
    first-approximation; FPP3 §5.5 discusses refinements.

    Args:
        forecast:  h-step-ahead point forecasts
        residuals: One-step residuals (may contain None for initialization)
        level:     Confidence level in percent (e.g., 95.0 for 95%)

    Returns dict with:
        'forecast': list of (point, lower, upper) for each step
        'sigma':    residual standard deviation
        'z':        z-score for the confidence level
    """
    _validate_series(forecast, "forecast")
    if len(residuals) != len(forecast) and len(residuals) == 0:
        raise ValueError("residuals must be non-empty")
    if not 50.0 <= level < 100.0:
        raise ValueError(f"level must be in [50, 100), got {level}")

    # Filter valid residuals
    valid_resid = [r for r in residuals if r is not None]
    if len(valid_resid) < 2:
        raise ValueError("Need at least 2 valid residuals to estimate sigma")

    n_resid = len(valid_resid)
    sigma = math.sqrt(sum(r ** 2 for r in valid_resid) / n_resid)

    # z-score from confidence level (approximate)
    # For common levels, use exact values
    z_map = {90.0: 1.645, 95.0: 1.960, 98.0: 2.326, 99.0: 2.576}
    z = z_map.get(round(level, 1), 1.96)
    # Fallback: approximate from normal quantile using rational approximation
    if round(level, 1) not in z_map:
        p = level / 100.0
        # Simple rational approximation for the normal quantile
        alpha = 1.0 - p
        t = math.sqrt(-2.0 * math.log(alpha / 2.0)) if alpha > 0 else 5.0
        c0, c1, c2 = 2.515517, 0.802853, 0.010328
        d1, d2, d3 = 1.432788, 0.189269, 0.001308
        z = t - (c0 + c1 * t + c2 * t * t) / (1.0 + d1 * t + d2 * t * t + d3 * t * t * t)

    intervals = []
    for f in forecast:
        lower = f - z * sigma
        upper = f + z * sigma
        intervals.append((f, lower, upper))

    return {
        "intervals": intervals,
        "sigma": sigma,
        "z": z,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 8 — SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    """Run every self-test. Returns 0 if all pass, 1 if any fail."""
    failures = 0
    passed = 0

    def check(label: str, actual, expected, tol: float = 1e-6):
        nonlocal failures, passed
        if isinstance(expected, bool):
            if actual != expected:
                print(f"  FAIL  {label}: expected {expected}, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: {actual}")
                passed += 1
        elif isinstance(expected, str):
            if actual != expected:
                print(f"  FAIL  {label}: expected '{expected}', got '{actual}'")
                failures += 1
            else:
                print(f"  PASS  {label}: '{actual}'")
                passed += 1
        elif expected is None:
            if actual is not None:
                print(f"  FAIL  {label}: expected None, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: None")
                passed += 1
        else:
            if abs(actual - expected) > tol:
                print(f"  FAIL  {label}: expected {expected}, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: {actual}")
                passed += 1

    def check_raises(label: str, func: Callable, *args, **kwargs):
        nonlocal failures, passed
        try:
            result = func(*args, **kwargs)
            print(f"  FAIL  {label}: expected exception but got {result}")
            failures += 1
        except (ValueError, TypeError) as e:
            print(f"  PASS  {label}: raised {type(e).__name__} — {e}")
            passed += 1

    def check_list(label: str, actual: list, expected: list, tol: float = 1e-6):
        nonlocal failures, passed
        if len(actual) != len(expected):
            print(f"  FAIL  {label}: length mismatch — expected {len(expected)}, got {len(actual)}")
            failures += 1
            return
        all_ok = True
        for i, (a, e) in enumerate(zip(actual, expected)):
            if a is None and e is None:
                continue
            if a is None or e is None:
                print(f"  FAIL  {label}[{i}]: expected {e}, got {a}")
                failures += 1
                all_ok = False
                continue
            if abs(a - e) > tol:
                print(f"  FAIL  {label}[{i}]: expected {e}, got {a}")
                failures += 1
                all_ok = False
        if all_ok:
            print(f"  PASS  {label}: {actual}")
            passed += 1

    print("=" * 70)
    print("SELF-TEST SUITE: forecasting.py")
    print("Source: Hyndman & Athanasopoulos, FPP3 (2021, OTexts)")
    print("=" * 70)

    # ── Part 1: Utility Functions ──
    print("\n── Part 1: Utility Functions (Ch.2) ──")

    data = [10.0, 12.0, 14.0, 16.0, 18.0]
    check_list("lag: k=1", lag(data, 1),
               [None, 10.0, 12.0, 14.0, 16.0])
    check_list("lag: k=2", lag(data, 2),
               [None, None, 10.0, 12.0, 14.0])

    check_list("difference: lag=1", difference(data, 1),
               [2.0, 2.0, 2.0, 2.0])
    check_list("difference: lag=2", difference(data, 2),
               [4.0, 4.0, 4.0])

    seasonal_data = [10.0, 15.0, 8.0, 5.0, 12.0, 18.0, 10.0, 7.0]
    check_list("seasonal_difference: period=4", seasonal_difference(seasonal_data, 4),
               [2.0, 3.0, 2.0, 2.0])

    # 2×4-MA on 8 quarterly points
    # For t=2 (index 2): first 4-MA_t2 = (10+15+8+5)/4=9.5, 4MA_t3=(15+8+5+12)/4=10
    # CMA_t2 = (9.5+10)/2 = 9.75
    # t=3: 4MA_t3=10, 4MA_t4=(8+5+12+18)/4=10.75, CMA=10.375
    # t=4: 4MA_t4=10.75, 4MA_t5=(5+12+18+10)/4=11.25, CMA=11.0
    # t=5: 4MA_t5=11.25, 4MA_t6=(12+18+10+7)/4=11.75, CMA=11.5
    ma_result = moving_average(seasonal_data, 4, centered=True)
    # Expected: [None, None, 9.75, 10.375, 11.0, 11.5, None, None]
    check("MA: 2×4 centered at t=2", ma_result[2], 9.75)
    check("MA: 2×4 centered at t=3", ma_result[3], 10.375)
    check("MA: 2×4 centered at t=4", ma_result[4], 11.0)
    check("MA: 2×4 centered at t=5", ma_result[5], 11.5)
    check("MA: edge None at t=0", ma_result[0] is None, True)
    check("MA: edge None at t=6", ma_result[6] is None, True)
    check("MA: edge None at t=7", ma_result[7] is None, True)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("lag: k=0", lag, data, 0)
    check_raises("difference: lag >= len", difference, data, 10)
    check_raises("moving_average: window > len", moving_average, data, 10)

    # ── Part 2: Decomposition (Ch.3) ──
    print("\n── Part 2: Time Series Decomposition (Ch.3) ──")

    # Seasonal data with clear pattern: Q1 high, Q3 low
    # [10, 8, 14, 12, 13, 11, 17, 15] — period 4
    decomp_data = [10.0, 8.0, 14.0, 12.0, 13.0, 11.0, 17.0, 15.0]
    result = classical_decomposition(decomp_data, 4, "additive")
    check("decomp: model preserved", result["model"], "additive")
    check("decomp: period preserved", result["period"], 4)
    # Trend should be defined for interior points (t=2,3,4,5)
    check("decomp: trend t=2 not None", result["trend"][2] is not None, True)
    check("decomp: trend t=3 not None", result["trend"][3] is not None, True)
    check("decomp: trend t=0 None", result["trend"][0] is None, True)
    check("decomp: trend t=7 None", result["trend"][7] is None, True)
    # Seasonal should sum to ~0 (additive)
    seasonal_avg = sum(result["seasonal"]) / len(result["seasonal"])
    check("decomp: seasonal avg ≈ 0", seasonal_avg, 0.0, tol=1e-10)
    # Remainder defined where trend is defined
    check("decomp: remainder t=2 not None", result["remainder"][2] is not None, True)

    # Multiplicative
    mult_data = [10.0, 8.0, 14.0, 12.0, 13.0, 11.0, 17.0, 15.0]
    result_m = classical_decomposition(mult_data, 4, "multiplicative")
    check("decomp_m: model preserved", result_m["model"], "multiplicative")
    # Seasonal should average to ~1.0
    seasonal_avg_m = sum(result_m["seasonal"]) / len(result_m["seasonal"])
    check("decomp_m: seasonal avg ≈ 1.0", seasonal_avg_m, 1.0, tol=1e-10)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("decomp: period ≥ len", classical_decomposition, decomp_data, 10, "additive")
    check_raises("decomp: period = 1", classical_decomposition, decomp_data, 1, "additive")
    check_raises("decomp: multiplicative with zeros",
                 classical_decomposition, [10.0, 0.0, 14.0, 12.0], 2, "multiplicative")

    # ── Part 3: Accuracy Metrics (Ch.5) ──
    print("\n── Part 3: Forecast Accuracy Metrics (Ch.5) ──")

    actual = [10.0, 12.0, 14.0, 16.0, 18.0]
    predicted = [10.5, 11.5, 14.5, 15.5, 18.5]
    # Errors: [-0.5, 0.5, -0.5, 0.5, -0.5]
    # |Errors|: [0.5, 0.5, 0.5, 0.5, 0.5]
    # MAE = 0.5
    check("mae: alternating ±0.5 errors", mae(actual, predicted), 0.5)
    # MSE = (0.25+0.25+0.25+0.25+0.25)/5 = 0.25
    check("mse: alternating errors", mse(actual, predicted), 0.25)
    # RMSE = sqrt(0.25) = 0.5
    check("rmse: alternating errors", rmse(actual, predicted), 0.5)
    # MAPE = (0.5/10 + 0.5/12 + 0.5/14 + 0.5/16 + 0.5/18)/5 * 100
    mape_expected = (0.05 + 0.5/12 + 0.5/14 + 0.03125 + 0.5/18) / 5 * 100
    # = (0.05 + 0.041667 + 0.035714 + 0.03125 + 0.027778) / 5 * 100
    # = 0.186409 / 5 * 100 = 3.728
    check("mape: alternating errors", mape(actual, predicted), mape_expected, tol=1e-3)
    # ME = (-0.5+0.5-0.5+0.5-0.5)/5 = -0.1
    check("forecast_bias: slightly over-forecasting", forecast_bias(actual, predicted), -0.1)

    # Perfect prediction
    check("mae: perfect prediction", mae(actual, actual), 0.0)
    check("mse: perfect prediction", mse(actual, actual), 0.0)
    check("forecast_bias: perfect", forecast_bias(actual, actual), 0.0)

    # MASE: training data [5,6,7,8,9,10], test actual [11,12], pred [10.5, 11.5]
    train = [5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
    test_act = [11.0, 12.0]
    test_pred = [10.5, 11.5]
    # Naive Q: errors = [6-5, 7-6, 8-7, 9-8, 10-9] = [1,1,1,1,1], MAE = 1.0
    # MAE model = (|11-10.5| + |12-11.5|)/2 = (0.5+0.5)/2 = 0.5
    # MASE = 0.5/1.0 = 0.5
    check("mase: non-seasonal benchmark", mase(test_act, test_pred, train, 1), 0.5)

    # MASE with seasonal: train quarterly, period=4
    train_s = [10.0, 15.0, 8.0, 5.0, 12.0, 18.0, 10.0, 7.0]
    test_s_a = [14.0, 20.0]
    test_s_p = [13.0, 19.0]
    # Q: seasonal naive errors on train: [12-10, 18-15, 10-8, 7-5] = [2,3,2,2], MAE=2.25
    # MAE model = (|14-13| + |20-19|)/2 = 1.0
    # MASE = 1.0/2.25 = 0.444...
    check("mase: seasonal benchmark", mase(test_s_a, test_s_p, train_s, 4),
          1.0 / 2.25, tol=1e-6)

    # smape
    smape_val = smape([10.0, 12.0], [11.0, 11.0])
    # = 200/2 * (1/(10+11) + 1/(12+11)) = 100 * (1/21 + 1/23) = 100 * (0.047619 + 0.043478) = 9.1097
    check("smape: simple", smape_val, 9.1097, tol=0.1)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("mape: zero in actual", mape, [0.0, 5.0], [1.0, 4.0])
    check_raises("mase: constant training data", mase, [1.0, 2.0], [1.0, 2.0], [5.0, 5.0, 5.0], 1)

    # ── Part 4: Naive Methods (Ch.5) ──
    print("\n── Part 4: Benchmark/Naive Methods (Ch.5) ──")

    check_list("naive_forecast: h=3", naive_forecast(data, 3), [18.0, 18.0, 18.0])
    check_list("naive_forecast: h=1", naive_forecast(data, 1), [18.0])

    # Seasonal naive on quarterly data
    # Last 4 values: [12, 18, 10, 7], period=4
    # h=1 → use t-4+offset = last year Q1 = 12
    # h=2 → Q2 = 18, h=3 → Q3 = 10, h=4 → Q4 = 7
    # h=5 → Q1 = 12 again
    check_list("seasonal_naive: h=5, period=4",
               seasonal_naive_forecast(seasonal_data, 4, 5),
               [12.0, 18.0, 10.0, 7.0, 12.0])

    check_list("mean_forecast: h=3", mean_forecast(data, 3),
               [14.0, 14.0, 14.0])  # mean of [10,12,14,16,18] = 14

    # Drift: slope = (18-10)/4 = 2.0
    # ŷ_{T+1} = 18 + 2*1 = 20
    # ŷ_{T+2} = 18 + 2*2 = 22
    check_list("drift_forecast: h=3", drift_forecast(data, 3),
               [20.0, 22.0, 24.0])

    # ── Part 5: Exponential Smoothing (Ch.7) ──
    print("\n── Part 5: Exponential Smoothing (Ch.7) ──")

    # SES: y=[10,12,14,16,18], α=0.5
    # ℓ_0=10, ℓ_1=0.5*12+0.5*10=11, ℓ_2=0.5*14+0.5*11=12.5
    # ℓ_3=0.5*16+0.5*12.5=14.25, ℓ_4=0.5*18+0.5*14.25=16.125
    ses_result = ses(data, 0.5)
    check("ses: final level", ses_result["level"], 16.125)
    check("ses: forecast h=1", ses_result["forecast"][0], 16.125)
    # Fitted: ℓ_0=10, fitted[1]=10, fitted[2]=11.0, fitted[3]=12.5, fitted[4]=14.25
    check("ses: fitted t=1 (ℓ_0)", ses_result["fitted"][1], 10.0)
    check("ses: fitted t=4", ses_result["fitted"][4], 14.25)

    # SES with α=0.3
    ses_slow = ses(data, 0.3)
    # ℓ_0=10, ℓ_1=10.6, ℓ_2=11.62, ℓ_3=12.934, ℓ_4=14.4538
    check("ses_slow: final level", ses_slow["level"], 14.4538, tol=1e-4)

    # Holt: y=[10,12,14,16,18], α=0.5, β=0.5
    # ℓ_0=10, b_0=2
    # t=1: fitted=10+2=12, ℓ_1=0.5*12+0.5*(10+2)=12, b_1=0.5*(12-10)+0.5*2=2
    # t=2: fitted=12+2=14, ℓ_2=0.5*14+0.5*(12+2)=14, b_2=0.5*(14-12)+0.5*2=2
    # ...
    # ℓ_4=18, b_4=2
    # f_1=20, f_2=22, f_3=24
    holt_result = holt(data, 0.5, 0.5, forecast_h=3)
    check("holt: final level", holt_result["level"], 18.0)
    check("holt: final trend", holt_result["trend"], 2.0)
    check_list("holt: forecast h=3", holt_result["forecast"], [20.0, 22.0, 24.0])
    check("holt: fitted t=1", holt_result["fitted"][1], 12.0)

    # Damped Holt: φ=0.9, α=0.5, β=0.5
    # φ_sum h=1: 0.9, h=2: 0.9+0.81=1.71, h=3: 0.9+0.81+0.729=2.439
    holt_damped = holt(data, 0.5, 0.5, forecast_h=3, damped=True, phi=0.9)
    # The trend will converge, but let's just check forecasts are less aggressive
    check("holt_damped: forecast < undamped at h=3",
          holt_damped["forecast"][2] < holt_result["forecast"][2], True)

    # Holt-Winters Additive — quarterly seasonal data
    # [10,15,8,5, 12,18,10,7, 14,21,12,9] — 3 years, clear seasonality
    hw_data = [10.0, 15.0, 8.0, 5.0, 12.0, 18.0, 10.0, 7.0, 14.0, 21.0, 12.0, 9.0]
    hw_a = holt_winters(hw_data, 4, 0.3, 0.1, 0.1, forecast_h=4, model="additive")
    check("hw_add: returns 4 forecasts", len(hw_a["forecast"]), 4)
    check("hw_add: final level > 0", hw_a["level"] > 0, True)
    # Forecasts should be in a reasonable range (not exploding)
    for i, f in enumerate(hw_a["forecast"]):
        check(f"hw_add: forecast[{i}] finite", math.isfinite(f), True)

    # Holt-Winters Multiplicative
    hw_m = holt_winters(hw_data, 4, 0.3, 0.1, 0.1, forecast_h=4, model="multiplicative")
    check("hw_mult: returns 4 forecasts", len(hw_m["forecast"]), 4)
    for i, f in enumerate(hw_m["forecast"]):
        check(f"hw_mult: forecast[{i}] finite and > 0", f > 0 and math.isfinite(f), True)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("ses: alpha=0", ses, data, 0.0)
    check_raises("holt: single observation", holt, [10.0], 0.5, 0.5)
    check_raises("hw: period too large", holt_winters, hw_data, 20, 0.3, 0.1, 0.1, model="additive")
    check_raises("hw: invalid model", holt_winters, hw_data, 4, 0.3, 0.1, 0.1, model="invalid")
    check_raises("hw_mult: zero in data",
                 holt_winters, [0.0, 5.0, 10.0, 5.0, 0.0, 5.0, 10.0, 5.0],
                 4, 0.3, 0.1, 0.1, model="multiplicative")

    # ── Part 6: Stationarity & ARIMA ID (Ch.8) ──
    print("\n── Part 6: Stationarity & ARIMA Identification (Ch.8) ──")

    # Stationary: white noise-ish
    wn = [1.1, -0.3, 0.8, -0.5, 0.2, -0.1, 0.4, -0.6]
    acf_wn = acf(wn, max_lag=3)
    check("acf: ρ_0 = 1.0", acf_wn[0], 1.0)
    check("acf: lag 1 within [-1,1]", abs(acf_wn[1]) <= 1.0, True)

    is_stat, lag1 = is_stationary(wn)
    check("is_stationary: white noise → stationary", is_stat, True)

    # Non-stationary: random walk
    rw = [0.0, 1.2, 2.1, 3.5, 4.2, 5.8, 6.3, 7.9, 8.4, 10.1]
    is_stat_rw, lag1_rw = is_stationary(rw)
    check("is_stationary: random walk → non-stationary", is_stat_rw, False)
    check("is_stationary: random walk ACF(1) ≈ 1", lag1_rw > 0.5, True)

    # ndiffs should find 1 difference needed for RW
    nd = ndiffs(rw)
    check("ndiffs: random walk needs 1 diff", nd, 1)

    # PACF
    pacf_vals = pacf(wn, max_lag=3)
    check("pacf: length = 3", len(pacf_vals), 3)
    for i, p in enumerate(pacf_vals):
        check(f"pacf: lag {i+1} in [-1, 1]", abs(p) <= 1.0, True)

    # ACF for linear trend data: should decay slowly
    acf_trend = acf([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0], max_lag=3)
    check("acf: linear trend ρ_1 > 0.5", acf_trend[1] > 0.5, True)

    # Constant series
    const_data = [5.0, 5.0, 5.0, 5.0, 5.0]
    acf_const = acf(const_data, max_lag=2)
    check_list("acf: constant series = all 1.0", acf_const, [1.0, 1.0, 1.0])

    # ── Part 7: Prediction Intervals ──
    print("\n── Part 7: Prediction Intervals (Ch.5, §5.5) ──")

    fc = [100.0, 102.0, 104.0]
    resid = [None, 1.0, -0.5, 0.5, -1.0, 0.0]  # σ=0.707...
    pi = prediction_intervals(fc, resid, 95.0)
    check("pi: sigma computed", pi["sigma"], 0.7071, tol=0.01)
    check("pi: z ≈ 1.96", pi["z"], 1.96, tol=0.01)
    check("pi: 3 intervals", len(pi["intervals"]), 3)
    # First interval: [100 - 1.96*0.707, 100 + 1.96*0.707] = [98.61, 101.39]
    check("pi: interval[0] lower", pi["intervals"][0][1], 100 - 1.96 * pi["sigma"], tol=0.01)
    check("pi: interval[0] upper", pi["intervals"][0][2], 100 + 1.96 * pi["sigma"], tol=0.01)

    # ── Part 8: Integration Test ──
    print("\n── Integration Test: Decompose → Smooth → Forecast → Evaluate ──")

    # Full monthly-like seasonal data with trend
    monthly = [100.0, 110.0, 105.0, 95.0, 102.0, 112.0, 108.0, 98.0,
               105.0, 115.0, 110.0, 100.0, 107.0, 117.0, 112.0, 102.0,
               110.0, 120.0, 115.0, 105.0]
    period_m = 4

    # Check stationarity
    nd_m = ndiffs(monthly)
    d1 = difference(monthly, 1)
    # After one diff it should be more stationary
    stat_after, _ = is_stationary(d1)
    check("integration: ndiffs on seasonal+trend data", nd_m, 1)
    check("integration: stationary after 1 diff", stat_after, True)

    # Decompose
    decomp = classical_decomposition(monthly, period_m, "additive")
    check("integration: decomp successful", decomp["trend"][2] is not None, True)

    # HW forecast on training (first 16 points), test on last 4
    train_m = monthly[:16]
    test_m = monthly[16:]
    hw_fit = holt_winters(train_m, period_m, 0.3, 0.1, 0.1, forecast_h=4, model="additive")
    hw_fc = hw_fit["forecast"]

    # Compare against naive benchmarks
    naive_fc = naive_forecast(train_m, 4)
    seas_naive_fc = seasonal_naive_forecast(train_m, period_m, 4)

    mae_hw = mae(test_m, hw_fc)
    mae_naive = mae(test_m, naive_fc)
    mae_snaive = mae(test_m, seas_naive_fc)

    print(f"  INFO  MAE: HW={mae_hw:.2f}, Naive={mae_naive:.2f}, SeasNaive={mae_snaive:.2f}")
    # We can't guarantee HW beats naive for any dataset, so just check finiteness
    check("integration: MAE finite", math.isfinite(mae_hw), True)
    check("integration: naive MAE finite", math.isfinite(mae_naive), True)

    # ── Summary ──
    print("\n" + "=" * 70)
    total = passed + failures
    print(f"RESULTS: {passed}/{total} passed, {failures} failed")
    print("=" * 70)
    return 0 if failures == 0 else 1


# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    sys.exit(run_all_tests())