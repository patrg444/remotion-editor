const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname));

const port = 3000;
app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});
