require('dotenv').config();
const mongoose = require('mongoose')
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const dns = require('dns');

const app = express();
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const shortener = new mongoose.Schema({
  id: Number,
  original_url: String
})
const Shortener = mongoose.model('Shortener', shortener)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyParser.urlencoded({ extended: false }))

app.post('/api/shorturl', (req, res) => {
  const hostname = new URL(req.body.url).hostname
  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      res.json({ error: 'invalid url' })
    } else {
      Shortener.find().exec().then(data => {
        console.log(data)
        new Shortener({
          id: data.length + 1,
          original_url: req.body.url
        }).save().then(() => {
          res.json({
            original_url: req.body.url,
            short_url: data.length + 1
          })
        }).catch(err => {
          res.json(err)
        })
      })
    }
  })
})

app.get('/api/shorturl/:number', (req, res) => {
  Shortener
    .find({ id: req.params.number })
    .exec()
    .then(url => res.redirect(url[0]['original_url']))
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
