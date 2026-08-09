import express from 'express';

const router = express.Router();

/**
 * In-memory trace/error store
 * Works WITHOUT Docker or Jaeger — view everything at http://localhost:5000/health/traces
 */
const MAX_ENTRIES = 100;
const traceStore = {
  errors: [],
  requests: [],
  events: [],
};

function addEntry(list, entry) {
  list.push(entry);
  if (list.length > MAX_ENTRIES) list.shift();
}

/**
 * Middleware: Record every requests
 */
export function requestRecorder(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - start,
    };

    addEntry(traceStore.requests, entry);

    if (res.statusCode >= 400) {
      addEntry(traceStore.errors, entry);
    }
  });

  next();
}

/**
 * Record a health state change event
 */
export function recordEvent(type, message) {
  addEntry(traceStore.events, {
    timestamp: new Date().toISOString(),
    type,
    message,
  });
}

/**
 * GET /health/traces/data — JSON API for the dashboard
 */
router.get('/health/traces/data', (req, res) => {
  const summary = {
    totalRequests: traceStore.requests.length,
    totalErrors: traceStore.errors.length,
    totalEvents: traceStore.events.length,
    errorRate: traceStore.requests.length > 0
      ? ((traceStore.errors.length / traceStore.requests.length) * 100).toFixed(1) + '%'
      : '0%',
    avgResponseTime: traceStore.requests.length > 0
      ? Math.round(traceStore.requests.reduce((a, b) => a + b.duration, 0) / traceStore.requests.length) + 'ms'
      : 'N/A',
  };

  res.json({
    summary,
    recentErrors: traceStore.errors.slice(-20).reverse(),
    recentRequests: traceStore.requests.slice(-30).reverse(),
    events: traceStore.events.slice(-20).reverse(),
  });
});

/**
 * GET /health/traces — HTML Dashboard (opens in browser)
 */
router.get('/health/traces', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(DASHBOARD_HTML);
});

/**
 * GET /health/traces/clear — Clear all stored traces
 */
router.get('/health/traces/clear', (req, res) => {
  traceStore.errors = [];
  traceStore.requests = [];
  traceStore.events = [];
  res.json({ message: 'Trace store cleared' });
});

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OpenTelemetry Dashboard - Auth Backend</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #1db954; margin-bottom: 5px; font-size: 28px; }
    .subtitle { color: #888; margin-bottom: 30px; font-size: 14px; }
    .subtitle a { color: #1db954; text-decoration: none; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: #16213e; padding: 20px; border-radius: 10px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #1db954; }
    .stat-value.error { color: #dc3545; }
    .stat-value.warning { color: #fd7e14; }
    .stat-label { color: #888; font-size: 12px; margin-top: 5px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #fff; margin-bottom: 15px; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; background: #16213e; border-radius: 10px; overflow: hidden; }
    th { background: #0f3460; padding: 12px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase; }
    td { padding: 10px 12px; border-top: 1px solid #0f3460; font-size: 13px; }
    .s2 { color: #1db954; }
    .s4 { color: #fd7e14; }
    .s5 { color: #dc3545; }
    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; display: inline-block; }
    .badge-get { background: rgba(29,185,84,0.2); color: #1db954; }
    .badge-post { background: rgba(52,152,219,0.2); color: #3498db; }
    .badge-error { background: rgba(220,53,69,0.2); color: #dc3545; }
    .refresh-info { color: #555; font-size: 11px; text-align: center; margin-top: 20px; }
    #status-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
    .live { background: #1db954; animation: pulse 2s infinite; }
    .dead { background: #dc3545; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    .empty { color: #555; text-align: center; padding: 30px; }
  </style>
</head>
<body>
  <h1><span id="status-dot" class="live"></span> OpenTelemetry Dashboard</h1>
  <p class="subtitle">Service: auth-backend | Auto-refreshes every 5s | <a href="/health">Health Check</a> | <a href="/health/traces/clear">Clear Traces</a></p>

  <div class="grid">
    <div class="stat-card"><div class="stat-value" id="total-requests">-</div><div class="stat-label">Total Requests</div></div>
    <div class="stat-card"><div class="stat-value error" id="total-errors">-</div><div class="stat-label">Errors</div></div>
    <div class="stat-card"><div class="stat-value warning" id="avg-response">-</div><div class="stat-label">Avg Response</div></div>
    <div class="stat-card"><div class="stat-value" id="error-rate">-</div><div class="stat-label">Error Rate</div></div>
  </div>

  <div class="section" id="errors-section" style="display:none">
    <h2>❌ Recent Errors</h2>
    <table><thead><tr><th>Time</th><th>Method</th><th>Path</th><th>Status</th><th>Duration</th></tr></thead><tbody id="errors-table"></tbody></table>
  </div>

  <div class="section">
    <h2>📋 Recent Requests</h2>
    <table><thead><tr><th>Time</th><th>Method</th><th>Path</th><th>Status</th><th>Duration</th></tr></thead><tbody id="requests-table"></tbody></table>
  </div>

  <div class="section" id="events-section" style="display:none">
    <h2>🔔 Events</h2>
    <table><thead><tr><th>Time</th><th>Type</th><th>Message</th></tr></thead><tbody id="events-table"></tbody></table>
  </div>

  <p class="refresh-info">Auto-refreshing every 5 seconds...</p>

  <script>
    function statusClass(code) {
      if (code < 300) return 's2';
      if (code < 500) return 's4';
      return 's5';
    }

    function methodBadge(method) {
      const cls = method === 'GET' ? 'badge-get' : method === 'POST' ? 'badge-post' : 'badge-error';
      return '<span class="badge ' + cls + '">' + method + '</span>';
    }

    function formatTime(ts) {
      return new Date(ts).toLocaleTimeString();
    }

    async function refresh() {
      try {
        const res = await fetch('/health/traces/data');
        const data = await res.json();

        document.getElementById('total-requests').textContent = data.summary.totalRequests;
        document.getElementById('total-errors').textContent = data.summary.totalErrors;
        document.getElementById('avg-response').textContent = data.summary.avgResponseTime;
        document.getElementById('error-rate').textContent = data.summary.errorRate;
        document.getElementById('status-dot').className = 'live';

        // Errors table
        if (data.recentErrors.length > 0) {
          document.getElementById('errors-section').style.display = 'block';
          document.getElementById('errors-table').innerHTML = data.recentErrors.map(function(e) {
            return '<tr><td>' + formatTime(e.timestamp) + '</td><td>' + methodBadge(e.method) + '</td><td>' + e.path + '</td><td class="' + statusClass(e.statusCode) + '">' + e.statusCode + '</td><td>' + e.duration + 'ms</td></tr>';
          }).join('');
        } else {
          document.getElementById('errors-section').style.display = 'none';
        }

        // Requests table
        if (data.recentRequests.length > 0) {
          document.getElementById('requests-table').innerHTML = data.recentRequests.map(function(r) {
            return '<tr><td>' + formatTime(r.timestamp) + '</td><td>' + methodBadge(r.method) + '</td><td>' + r.path + '</td><td class="' + statusClass(r.statusCode) + '">' + r.statusCode + '</td><td>' + r.duration + 'ms</td></tr>';
          }).join('');
        } else {
          document.getElementById('requests-table').innerHTML = '<tr><td colspan="5" class="empty">No requests yet</td></tr>';
        }

        // Events table
        if (data.events.length > 0) {
          document.getElementById('events-section').style.display = 'block';
          document.getElementById('events-table').innerHTML = data.events.map(function(e) {
            return '<tr><td>' + formatTime(e.timestamp) + '</td><td><span class="badge badge-error">' + e.type + '</span></td><td>' + e.message + '</td></tr>';
          }).join('');
        }

      } catch (err) {
        document.getElementById('status-dot').className = 'dead';
      }
    }

    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`;

export default router;
