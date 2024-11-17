const express = require('express');
const client = require('prom-client');
const app = express();
const port = process.env.PORT || 3000;

// Create a registry for the metrics
const register = new client.Registry();

// Define a histogram metric for HTTP request durations
const httpRequestDurationMilliseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 300, 400, 500]  // Define the response time buckets
});

// Register the histogram metric
register.registerMetric(httpRequestDurationMilliseconds);

// Middleware to measure request durations
app.use((req, res, next) => {
  const end = httpRequestDurationMilliseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// Define routes
app.get('/', (req, res) => {
  res.send('Hello from Kubernetes! This is the changed version. We added /version');
});

app.get('/version', (req, res) => {
  res.send('some version');
});

app.get('/heavy_route', (req, res) => {
  setTimeout(() => {
    res.send('finally');
  }, 3000);
  
});

// Expose the /metrics endpoint on the same port
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start the main application server
app.listen(port, () => {
  console.log(`App and metrics exposed at http://localhost:${port}`);
});
