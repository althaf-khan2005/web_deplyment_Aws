import express from 'express';
import { PrismaClient } from '@prisma/client';
import { trace, SpanStatusCode, metrics } from '@opentelemetry/api';

const router = express.Router();
const prisma = new PrismaClient();
const tracer = trace.getTracer('health-check');
const meter = metrics.getMeter('health-check');

// Metrics counters
const healthCheckCounter = meter.createCounter('health_checks_total', {
  description: 'Total number of health check requests',
});

const serviceUpGauge = meter.createUpDownCounter('service_up', {
  description: 'Whether a dependency is up (1) or down (0)',
});

/**
 * GET /health
 * 
 * Answers all 5 questions:
 * (1) Is the service down? → status field tells you "healthy" or "unhealthy"
 * (2) What is the issue? → checks.database.error tells you the specific error
 * (3) How do we communicate that? → Returns structured JSON + emits OpenTelemetry traces/metrics
 * (4) How do we display it to users? → Frontend consumes this endpoint
 * (5) When is it back? → Poll this endpoint; when status flips to "healthy", it's recovered
 */
router.get('/health', async (req, res) => {
  const span = tracer.startSpan('health-check');
  
  const checks = {
    database: { status: 'unknown', responseTime: null, error: null },
    server: { status: 'healthy', uptime: process.uptime() },
  };

  // Check database connectivity
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database.status = 'healthy';
    checks.database.responseTime = Date.now() - dbStart;
    serviceUpGauge.add(1, { service: 'database' });
  } catch (error) {
    checks.database.status = 'unhealthy';
    checks.database.error = error.message;
    checks.database.responseTime = Date.now() - dbStart;
    serviceUpGauge.add(-1, { service: 'database' });

    // Record error in trace so you can see it in Jaeg
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    span.recordException(error);
    span.setAttribute('health.database.error', error.message)
  }

  // Overall status
  const isHealthy = checks.database.status === 'healthy';
  const overallStatus = isHealthy ? 'healthy' : 'unhealthy';

  healthCheckCounter.add(1, { status: overallStatus });
  span.setAttribute('health.status', overallStatus);
  span.end();

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks,
  };

  // Return 200 if healthy, 503 if unhealthy (standard convention)
  res.status(isHealthy ? 200 : 503).json(response);
});

/**
 * GET /health/ready
 * Readiness probe - is the service ready to accept traffic?
 */
router.get('/health/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch {
    res.status(503).json({ ready: false, message: 'Database not reachable' });
  }
});

/**
 * GET /health/live
 * Liveness probe - is the process alive?
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({ alive: true, uptime: process.uptime() });
});

export default router;
