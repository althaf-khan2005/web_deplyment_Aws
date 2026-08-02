import { trace, SpanStatusCode, metrics } from '@opentelemetry/api';

const tracer = trace.getTracer('error-handler');
const meter = metrics.getMeter('error-handler');

// Metrics for error tracking
const errorCounter = meter.createCounter('http_errors_total', {
  description: 'Total HTTP errors by type',
});

const requestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request duration in milliseconds',
});

/**
 * Structured error logger middleware
 * Captures every error into an OpenTelemetry span so you can:
 * - See errors in Jaeger traces
 * - Get metrics on error rates
 * - Know exactly what failed and why
 */
export function errorLogger(err, req, res, next) {
  const span = tracer.startSpan('error-handler');

  // Structured error data
  const errorInfo = {
    message: err.message || 'Internal server error',
    stack: err.stack,
    method: req.method,
    path: req.path,
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'none',
  };

  // Record in OpenTelemetry trace
  span.setStatus({ code: SpanStatusCode.ERROR, message: errorInfo.message });
  span.recordException(err);
  span.setAttributes({
    'error.type': err.name || 'Error',
    'error.message': errorInfo.message,
    'http.method': req.method,
    'http.route': req.path,
    'http.status_code': errorInfo.statusCode,
  });
  span.end();

  // Increment error counter (for alerting)
  errorCounter.add(1, {
    status_code: String(errorInfo.statusCode),
    method: req.method,
    path: req.path,
  });

  // Structured console log (for Docker logs / CloudWatch)
  console.error(JSON.stringify({
    level: 'error',
    ...errorInfo,
  }));

  // Send user-friendly error response
  const statusCode = errorInfo.statusCode;
  res.status(statusCode).json({
    error: true,
    message: statusCode === 500
      ? 'Something went wrong. Our team has been notified.'
      : errorInfo.message,
    code: statusCode,
    timestamp: errorInfo.timestamp,
  });
}

/**
 * Request timing middleware
 * Tracks how long each request takes - helps detect slowdowns before full outages
 */
export function requestTimer(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    requestDuration.record(duration, {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: String(res.statusCode),
    });

    // Log slow requests (> 2s) as warnings
    if (duration > 2000) {
      console.warn(JSON.stringify({
        level: 'warn',
        message: 'Slow request detected',
        method: req.method,
        path: req.path,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      }));
    }
  });

  next();
}

/**
 * Not found handler - catches requests to non-existent routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: true,
    message: 'Endpoint not found',
    code: 404,
    path: req.path,
  });
}
