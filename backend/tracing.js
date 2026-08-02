import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

const OTEL_EXPORTER_URL = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const useConsoleExporter = !OTEL_EXPORTER_URL || process.env.OTEL_CONSOLE === 'true';

let traceExporter;
let metricReader;

if (useConsoleExporter) {
  // No Jaeger/Docker? Use console exporter — traces print to terminal
  console.log('🔭 OpenTelemetry: Using CONSOLE exporter (no Jaeger configured)');
  console.log('   Traces will appear in your terminal + /health/traces endpoint');
  traceExporter = new ConsoleSpanExporter();
} else {
  console.log('🔭 OpenTelemetry: Sending traces to', OTEL_EXPORTER_URL);
  traceExporter = new OTLPTraceExporter({
    url: `${OTEL_EXPORTER_URL}/v1/traces`,
  });
  metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${OTEL_EXPORTER_URL}/v1/metrics`,
    }),
    exportIntervalMillis: 15000,
  });
}

const sdkConfig = {
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'auth-backend',
    [ATTR_SERVICE_VERSION]: '1.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
    }),
  ],
};

if (metricReader) {
  sdkConfig.metricReader = metricReader;
}

const sdk = new NodeSDK(sdkConfig);
sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down'))
    .catch((err) => console.error('Error shutting down SDK', err))
    .finally(() => process.exit(0));
});

export default sdk;
