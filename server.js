var express = require('express');
var app = express();
var path = require('path');

app.use(express.static('static'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/base.html'));
});

app.listen(3000);
