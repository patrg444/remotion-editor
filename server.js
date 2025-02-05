const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the public directory
app.use(express.static('public'));

// Serve test assets
app.use('/test-assets', express.static(path.join(__dirname, 'test-assets')));

// Handle 404s
app.use((req, res) => {
  console.log(`404: ${req.url}`);
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`Media server running at http://localhost:${port}`);
});
