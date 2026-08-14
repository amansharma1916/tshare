import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AdminDashboard.css'
import { endpoints } from '../api/api'
import { Skeleton } from './common/Skeleton'

// ──────────────────────────────────────────
// Metric config
// ──────────────────────────────────────────
const METRICS = {
  visitors: { label: 'Visitors', short: 'Visitors', color: '#a78bfa' },
  files_shared: { label: 'Files Shared', short: 'Shared', color: '#ec4899' },
  received: { label: 'Received', short: 'Received', color: '#22c55e' },
  premium_users: { label: 'Premium Users', short: 'Premium', color: '#f59e0b' },
}

const RANGES = {
  daily: { label: 'Daily', buckets: [7, 14, 30], def: 30 },
  weekly: { label: 'Weekly', buckets: [4, 8, 12], def: 12 },
  monthly: { label: 'Monthly', buckets: [6, 12, 24], def: 12 },
}

const CONTENT_COLORS = { text: '#a78bfa', image: '#ec4899', file: '#22c55e' }

const fmt = (n) => (n == null ? 0 : Number(n).toLocaleString('en-IN'))

const timeAgo = (value) => {
  if (!value) return ''
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const niceMax = (v) => {
  if (v <= 0) return 1
  const mag = Math.pow(10, Math.floor(Math.log10(v)))
  const norm = v / mag
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return nice * mag
}

// ──────────────────────────────────────────
// Line / Area chart (SVG, hover tooltip)
// ──────────────────────────────────────────
const LineAreaChart = ({ data, color, height = 250, valueFormat = fmt }) => {
  const [hover, setHover] = useState(null)
  const W = 800
  const H = height
  const PAD = { top: 18, right: 16, bottom: 32, left: 48 }
  const iw = W - PAD.left - PAD.right
  const ih = H - PAD.top - PAD.bottom

  const max = niceMax(Math.max(1, ...data.map((d) => d.value)))
  const x = (i) => PAD.left + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw)
  const y = (v) => PAD.top + ih - (v / max) * ih

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')
  const area = `${line} L${x(data.length - 1).toFixed(1)},${PAD.top + ih} L${x(0).toFixed(1)},${PAD.top + ih} Z`

  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ f, v: Math.round(max * f) }))
  const labelStep = Math.ceil(data.length / 8)

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (!rect.width) return
    const px = ((e.clientX - rect.left) / rect.width) * W
    const idx = Math.round(((px - PAD.left) / iw) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, idx)))
  }

  if (data.length === 0) {
    return <div className="ad-empty">No data for this period</div>
  }

  return (
    <div className="ad-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="ad-chart__svg"
        role="img"
        aria-label="Trend chart"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Gridlines + y labels */}
        {grid.map((g) => (
          <g key={g.f}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(g.v).toFixed(1)}
              y2={y(g.v).toFixed(1)}
              className="ad-chart__gridline"
            />
            <text x={PAD.left - 8} y={y(g.v).toFixed(1) + 4} textAnchor="end" className="ad-chart__ylabel">
              {valueFormat(g.v)}
            </text>
          </g>
        ))}

        {/* X labels */}
        {data.map((d, i) =>
          i % labelStep === 0 || i === data.length - 1 ? (
            <text key={i} x={x(i).toFixed(1)} y={H - 8} textAnchor="middle" className="ad-chart__xlabel">
              {d.label}
            </text>
          ) : null
        )}

        {/* Area + line */}
        <path d={area} fill={color} opacity="0.18" className="ad-chart__area" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="ad-chart__line" />

        {/* Hover markers */}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} className="ad-chart__hline" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill={color} className="ad-chart__dot" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="9" fill={color} opacity="0.25" />
          </g>
        )}
      </svg>

      {hover != null && (
        <div
          className="ad-chart__tip"
          style={{
            left: `${((x(hover) - PAD.left) / iw) * 100}%`,
            top: `${((y(data[hover].value) - PAD.top) / ih) * 100}%`,
            background: color,
          }}
        >
          <span className="ad-chart__tip-label">{data[hover].fullLabel || data[hover].label}</span>
          <span className="ad-chart__tip-value">{valueFormat(data[hover].value)}</span>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────
// Horizontal bar list (content mix / comparisons)
// ──────────────────────────────────────────
const BarList = ({ items, colorOf }) => {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="ad-bars" role="img" aria-label="Bar chart">
      {items.map((item) => {
        const pct = Math.max(2, Math.round((item.value / max) * 100))
        return (
          <div className="ad-bars__item" key={item.key}>
            <div className="ad-bars__meta">
              <span className="ad-bars__label">{item.label}</span>
              <span className="ad-bars__value">{item.valueText != null ? item.valueText : fmt(item.value)}</span>
            </div>
            <div className="ad-bars__track">
              <motion.div
                className="ad-bars__fill"
                style={{ background: colorOf(item) }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ──────────────────────────────────────────
// KPI card
// ──────────────────────────────────────────
const KpiCard = ({ kpi, active, onClick }) => {
  const up = kpi.delta.value >= 0
  return (
    <motion.button
      type="button"
      className={`ad-kpi ${active ? 'ad-kpi--active' : ''}`}
      style={{ '--kpi-color': kpi.color }}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={active}
    >
      <div className="ad-kpi__top">
        <span className="ad-kpi__icon">{kpi.icon}</span>
        <span
          className={`ad-kpi__delta ${up ? 'ad-kpi__delta--up' : 'ad-kpi__delta--down'}`}
          title={up ? `+${fmt(kpi.delta.value)} vs yesterday` : `${fmt(kpi.delta.value)} vs yesterday`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {up ? <path d="M7 17L17 7" /> : <path d="M7 7l10 10" />}
            {up ? <polyline points="7 7 17 7 17 17" /> : <polyline points="7 17 17 17 17 7" />}
          </svg>
          {up ? '+' : ''}{kpi.delta.percent}%
        </span>
      </div>
      <span className="ad-kpi__value">{fmt(kpi.value)}</span>
      <span className="ad-kpi__label">{kpi.label}</span>
      <span className="ad-kpi__hint">vs yesterday</span>
    </motion.button>
  )
}

// ──────────────────────────────────────────
// Main component
// ──────────────────────────────────────────
const AdminDashboard = ({ getAuthHeaders, refreshKey = 0 }) => {
  const [range, setRange] = useState('daily')
  const [buckets, setBuckets] = useState(RANGES.daily.def)
  const [metric, setMetric] = useState('files_shared')
  const [view, setView] = useState('chart')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ range, buckets })
      const res = await fetch(endpoints.adminDashboard(params), { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
      } else {
        setError(json.message || 'Failed to load dashboard')
      }
    } catch {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }, [range, buckets, getAuthHeaders])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const handleRangeChange = (r) => {
    setRange(r)
    setBuckets(RANGES[r].def)
  }

  const kpis = useMemo(() => {
    const s = data?.summary
    if (!s) return []
    return [
      {
        key: 'visitors',
        label: "Today's Visitors",
        value: s.today.visitors,
        delta: s.deltas.visitors,
        color: METRICS.visitors.color,
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
          </svg>
        ),
      },
      {
        key: 'files_shared',
        label: "Today's Shared",
        value: s.today.files_shared,
        delta: s.deltas.files_shared,
        color: METRICS.files_shared.color,
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        ),
      },
      {
        key: 'received',
        label: "Today's Received",
        value: s.today.received,
        delta: s.deltas.received,
        color: METRICS.received.color,
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <path d="M7 10l5 5 5-5" />
            <path d="M12 3v12" />
          </svg>
        ),
      },
      {
        key: 'premium_users',
        label: "Today's Premium",
        value: s.today.premium_users,
        delta: s.deltas.premium_users,
        color: METRICS.premium_users.color,
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" />
          </svg>
        ),
      },
    ]
  }, [data])

  const chartData = useMemo(() => {
    if (!data) return []
    return data.timeSeries.map((p) => ({ label: p.label, fullLabel: p.fullLabel, value: p[metric] }))
  }, [data, metric])

  const selectedMetric = METRICS[metric]

  // Comparison vs the previous bucket in the current chart range
  const bucketDelta = useMemo(() => {
    if (chartData.length < 2) return null
    const last = chartData[chartData.length - 1].value
    const prev = chartData[chartData.length - 2].value
    if (prev > 0) return Math.round(((last - prev) / prev) * 1000) / 10
    return last > 0 ? 100 : null
  }, [chartData])

  const comparisonItems = useMemo(() => {
    if (!data?.periods) return []
    const { last7, prev7, deltas } = data.periods
    return Object.keys(METRICS).map((k) => ({
      key: k,
      label: METRICS[k].label,
      value: last7[k],
      prev: prev7[k],
      delta: deltas[k],
      color: METRICS[k].color,
      valueText: `${fmt(last7[k])} · ${fmt(prev7[k])} prev`,
    }))
  }, [data])

  const contentMix = data?.contentMix || []
  const topUsers = data?.topUsers || []
  const recentActivity = data?.recentActivity || []
  const counts = data?.summary?.counts || {}

  const icons = {
    share: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
    premium: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" />
      </svg>
    ),
    user: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  }

  return (
    <div className="adash">
      <div className="adash__head">
        <div>
          <h1 className="adash__title">Analytics Dashboard</h1>
          <p className="adash__subtitle">Daily activity, trends and platform health at a glance</p>
        </div>
        <div className="adash__controls" role="toolbar" aria-label="Dashboard controls">
          <div className="adash__seg" role="tablist" aria-label="Date range">
            {Object.keys(RANGES).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                className={`adash__seg-btn ${range === r ? 'adash__seg-btn--active' : ''}`}
                onClick={() => handleRangeChange(r)}
              >
                {RANGES[r].label}
              </button>
            ))}
          </div>
          <select
            className="adash__select"
            value={buckets}
            onChange={(e) => setBuckets(Number(e.target.value))}
            aria-label="Number of buckets"
          >
            {RANGES[range].buckets.map((b) => (
              <option key={b} value={b}>
                Last {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="adash__error">{error}</div>}

      {loading && !data ? (
        <div className="adash__skeleton">
          <div className="adash__skeleton-cards">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="adash__skeleton-card" style={{ height: '120px' }} />
            ))}
          </div>
          <Skeleton className="adash__skeleton-chart" style={{ height: '340px' }} />
        </div>
      ) : data ? (
        <>
          {/* KPI row */}
          <div className="adash__kpis">
            {kpis.map((k) => (
              <KpiCard key={k.key} kpi={k} active={metric === k.key} onClick={() => setMetric(k.key)} />
            ))}
          </div>

          {/* All-time strip */}
          <div className="adash__totals">
            {[
              { label: 'All-time Visitors', value: data.summary.totals.visitors, color: METRICS.visitors.color },
              { label: 'All-time Shared', value: data.summary.totals.files_shared, color: METRICS.files_shared.color },
              { label: 'All-time Received', value: data.summary.totals.received, color: METRICS.received.color },
              { label: 'All-time Premium', value: data.summary.totals.premium_users, color: METRICS.premium_users.color },
            ].map((t) => (
              <div className="adash__total" key={t.label}>
                <span className="adash__total-dot" style={{ background: t.color }} />
                <span className="adash__total-label">{t.label}</span>
                <span className="adash__total-value">{fmt(t.value)}</span>
              </div>
            ))}
            <div className="adash__total adash__total--muted">
              <span className="adash__total-label">{counts.registeredUsers ?? 0} users · {counts.totalCodes ?? 0} codes live</span>
            </div>
          </div>

          {/* Main chart */}
          <div className="adash__panel adash__panel--chart">
            <div className="adash__panel-head">
              <div>
                <h2 className="adash__panel-title" style={{ color: selectedMetric.color }}>
                  {selectedMetric.label}
                </h2>
                <p className="adash__panel-sub">
                  {RANGES[range].label.toLowerCase()} trend ·{' '}
                  {range === 'daily' ? `last ${buckets} days` : range === 'weekly' ? `last ${buckets} weeks` : `last ${buckets} months`}
                </p>
              </div>
              <div className="adash__panel-actions">
                {bucketDelta != null && (
                  <span className={`adash__period ${bucketDelta >= 0 ? 'adash__period--up' : 'adash__period--down'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {bucketDelta >= 0 ? <path d="M7 17L17 7" /> : <path d="M7 7l10 10" />}
                      {bucketDelta >= 0 ? <polyline points="7 7 17 7 17 17" /> : <polyline points="7 17 17 17 17 7" />}
                    </svg>
                    {bucketDelta >= 0 ? '+' : ''}{bucketDelta}% vs previous
                  </span>
                )}
                <div className="adash__seg adash__seg--sm" role="tablist" aria-label="View mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === 'chart'}
                    className={`adash__seg-btn ${view === 'chart' ? 'adash__seg-btn--active' : ''}`}
                    onClick={() => setView('chart')}
                  >
                    Chart
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === 'table'}
                    className={`adash__seg-btn ${view === 'table' ? 'adash__seg-btn--active' : ''}`}
                    onClick={() => setView('table')}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {view === 'chart' ? (
                <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <LineAreaChart data={chartData} color={selectedMetric.color} valueFormat={fmt} />
                </motion.div>
              ) : (
                <motion.div key="table" className="adash__table-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <table className="adash__table">
                    <thead>
                      <tr>
                        <th>{RANGES[range].label}</th>
                        {Object.keys(METRICS).map((k) => (
                          <th key={k} style={{ color: METRICS[k].color }}>
                            {METRICS[k].label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.timeSeries.map((row) => (
                        <tr key={row.date}>
                          <td>
                            {row.label}
                            <span className="adash__table-full">{row.fullLabel}</span>
                          </td>
                          {Object.keys(METRICS).map((k) => (
                            <td key={k}>{fmt(row[k])}</td>
                          ))}
                        </tr>
                      ))}
                      <tr className="adash__table-total">
                        <td>Total</td>
                        {Object.keys(METRICS).map((k) => (
                          <td key={k}>{fmt(data.timeSeries.reduce((s, r) => s + r[k], 0))}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Secondary row */}
          <div className="adash__grid">
            <div className="adash__panel">
              <h2 className="adash__panel-title">Content Mix</h2>
              <p className="adash__panel-sub">Live shared items by type</p>
              <BarList
                items={contentMix.map((c) => ({ key: c.type, label: c.label, value: c.count }))}
                colorOf={(item) => CONTENT_COLORS[item.key]}
              />
            </div>

            <div className="adash__panel">
              <h2 className="adash__panel-title">Period Comparison</h2>
              <p className="adash__panel-sub">Last 7 days vs previous 7</p>
              <div className="adash__compare">
                {comparisonItems.map((item) => (
                  <div className="adash__compare-row" key={item.key}>
                    <span className="adash__compare-label" style={{ color: item.color }}>
                      {item.label}
                    </span>
                    <span className="adash__compare-value">{fmt(item.value)}</span>
                    <span className={`adash__compare-delta ${item.delta >= 0 ? 'adash__compare-delta--up' : 'adash__compare-delta--down'}`}>
                      {item.delta >= 0 ? '+' : ''}{item.delta}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="adash__panel">
              <h2 className="adash__panel-title">Premium Overview</h2>
              <p className="adash__panel-sub">Codes, ownership and revenue</p>
              <div className="adash__premium">
                <div className="adash__premium-grid">
                  <div>
                    <span className="adash__premium-num">{fmt(data.premium.total)}</span>
                    <span className="adash__premium-lbl">Total</span>
                  </div>
                  <div>
                    <span className="adash__premium-num">{fmt(data.premium.active)}</span>
                    <span className="adash__premium-lbl">Active</span>
                  </div>
                  <div>
                    <span className="adash__premium-num">{fmt(data.premium.owned)}</span>
                    <span className="adash__premium-lbl">Owned</span>
                  </div>
                  <div>
                    <span className="adash__premium-num">{fmt(data.premium.forSale)}</span>
                    <span className="adash__premium-lbl">For sale</span>
                  </div>
                </div>
                <div className="adash__premium-revenue">
                  <span className="adash__premium-revenue-label">Est. revenue</span>
                  <span className="adash__premium-revenue-value">₹{fmt(data.premium.revenue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="adash__grid adash__grid--bottom">
            <div className="adash__panel">
              <h2 className="adash__panel-title">Top Users</h2>
              <p className="adash__panel-sub">Most active mapped accounts</p>
              {topUsers.length === 0 ? (
                <div className="ad-empty">No mapped users yet</div>
              ) : (
                <ul className="adash__users">
                  {topUsers.map((u, i) => (
                    <li className="adash__user" key={u.username}>
                      <span className={`adash__user-rank adash__user-rank--${i + 1}`}>{i + 1}</span>
                      <span className="adash__user-name">{u.username}</span>
                      <span className="adash__user-count">{fmt(u.total)}</span>
                      <span className="adash__user-sub">
                        {fmt(u.shared)} shared · {fmt(u.received)} received
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="adash__panel">
              <h2 className="adash__panel-title">Recent Activity</h2>
              <p className="adash__panel-sub">Latest shares, purchases and signups</p>
              {recentActivity.length === 0 ? (
                <div className="ad-empty">No recent activity</div>
              ) : (
                <ul className="adash__feed">
                  {recentActivity.map((a) => (
                    <li className="adash__feed-item" key={a.id}>
                      <span className={`adash__feed-icon adash__feed-icon--${a.kind}`}>{icons[a.kind] || icons.share}</span>
                      <div className="adash__feed-body">
                        <span className="adash__feed-title">{a.title}</span>
                        <span className="adash__feed-meta">
                          {a.kind === 'share' ? `Shared · code ${a.code}` : a.kind === 'premium' ? 'Premium' : 'New user'}
                          {a.kind === 'share' && a.type === 'text' ? '' : a.kind === 'share' ? ` · ${a.type}` : ''}
                        </span>
                      </div>
                      <time className="adash__feed-time">{timeAgo(a.createdAt)}</time>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default AdminDashboard
