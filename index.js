var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var mongoose = require('mongoose');
var _ = require('underscore');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'localhost';

var theport = process.env.PORT || 5000;

mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

var articleSchema = new mongoose.Schema({
  url: { type: String },
  host: { type: String },
  finished: { type: Boolean },
  title: { type: String },
  created_at: { type: Date }
});

var Article = mongoose.model('Articles', articleSchema);

app.get('/', function(req, res) {
  Article.find({}).sort('-created_at').exec(function(err, result) {
    var output = [], freq = {};

    _.each(result, function(r) {
      var entry = {};
      entry.url = r.url;
      entry.title = unescape(r.title).replace(/\+/g, ' ');
      var d = new Date(r.created_at);
      entry.date = r.created_at ? ((d.getUTCMonth()+1) + '/' + d.getUTCDate() + '/' + d.getUTCFullYear()) : 'No Date';
      output.push(entry);

      freq[r.host] = freq[r.host] ? freq[r.host] += 1 : freq[r.host] = 1;
    });
    if (!err) {
      // res.json(result);
      res.render('pages/index', { articles: output, frequency: freq });
    } else {
      res.end('Error:' + err);
    } 
  });
});

app.post('/', function(req, res) {
  var entry = new Article();
  var parsed = url.parse(req.body.url);
  entry.url = parsed.protocol + "//" + parsed.hostname + parsed.pathname;
  entry.title = req.body.title;
  entry.host = parsed.hostname.match(/(www\.)?(.+)/).pop();
  entry.finished = req.body.finished;
  entry.created_at = new Date();

  entry.save(function(err) {                                               
    if (err) { res.send(err); }                                                 
    res.json({ message: 'added', id: entry._id });              
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


