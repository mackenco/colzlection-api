var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var pg = require('pg');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err) {
        console.error(err);
        res.send("Error " + err); 
      } else {
        res.render('pages/db', { results: result.rows }); 
      } 
    }); 
  });
});

app.post('/', function(req, res) {
  if (req.query.pop) {
  } else {
    var entry = {};
    var parsed = url.parse(req.body.url);
    entry.url = parsed.protocol + "//" + parsed.hostname + parsed.pathname;
    entry.title = req.body.title;
    entry.host = parsed.hostname; 
    entry.finished = req.body.finished;
    entry.date = new Date();
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


