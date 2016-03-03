'use strict';

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

function logger(req, res, next) {
  console.log('Request from: ' + req.ip + ' For: ' + req.path);
  next();
}

var port = 3000;
var app = express();

app.use(logger);
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../static'));
app.use(express.static(__dirname + '/../..'));

app.get('/authentication', function (req, res) {
  if (!req.headers.authorization || req.headers.authorization !== 'Bearer mySecureToken') {
    res.statusCode = 401;
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.write(fs.readFileSync(__dirname + '/authInfo.json', 'utf8'));
  }

  res.end();
});

app.post('/authentication', function (req, res) {
  if (req.body.username === 'alice' && req.body.password === 'bob') {
    res.setHeader('Content-Type', 'application/json');
    res.write(fs.readFileSync(__dirname + '/authInfo.json', 'utf8'));
  } else {
    res.statusCode = 401;
  }
  res.end();
});

app.delete('/authentication', function (req, res) {
  res.statusCode = 200;
  res.end();
});

app.listen(port);
console.log('Listening on port ' + port);