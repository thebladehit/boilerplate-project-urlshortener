require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('node:dns').promises;

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let id = 0;
const urls = new Map();

app.get('/api/shorturl/:short_url', function(req, res) {
  const short_url = req.params.short_url;
  const url = urls.get(+short_url);
  if (!url) {
    return res.status(400).json({
      error: "No short URL found for the given input",
    });
  }
  res.redirect(url);
});

app.post('/api/shorturl', async function(req, res) {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'invalid url' });
  }
  console.log(url)
  try {
    const parsedUrl = new URL(url);
    await dns.lookup(parsedUrl.hostname);
    const curId = id++;
    urls.set(curId, url);
    return res.json({
      'original_url': url,
      'short_url': curId,
    });
  } catch (err) {
    res.json({
      error: 'invalid url' 
    });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
