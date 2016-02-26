var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var mongoose = require('mongoose');
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
  'mongodb://localhost/HelloMongoose';

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
  title: { type: String }
});

var Article = mongoose.model('Articles', articleSchema);

var a1 = new Article ({
  url: 'https://www.washingtonpost.com/world/national-security/justice-scalia-spent-his-last-hours-with-members-of-this-secretive-society-of-elite-hunters/2016/02/24/1d77af38-db20-11e5-891a-4ed04f4213e8_story.html',
  host: 'washingtonpost.com',
  finished: false,
  title: 'Justice Scalia spent his last hours with members of this secretive society of elite hunters'
});
a1.save(function (err) {if (err) console.log ('Error on save!');});

var a2 = new Article ({
  url: 'http://deadspin.com/dexter-fowlers-agent-rips-into-the-orioles-and-the-base-1761381916',
  host: 'deadspin.com',
  finished: true,
  title: "Dexter Fowler's Agent Rips Into The Orioles And The Baseball Media"
});
a2.save(function (err) {if (err) console.log ('Error on save!');});

var a3 = new Article ({
  url: 'http://deadspin.com/the-warriors-are-the-best-team-ever-and-they-can-eat-s-1761305524',
  host: 'deadspin.com',
  finished: false,
  title: 'The Warriors Are The Best Team Ever, And They Can Eat Shit'
});
a3.save(function (err) {if (err) console.log ('Error on save!');});

var a4 = new Article ({
  url: 'http://www.avclub.com/article/what-will-win-and-what-should-win-2016-oscars-232776',
  host: 'avclub.com',
  finished: false,
  title: 'What will win, and what should win, at the 2016 Oscars'
});
a4.save(function (err) {if (err) console.log ('Error on save!');});

app.get('/', function(req, res) {
  Article.find({}).exec(function(err, result) {
    if (!err) {
      res.json(result); 
    } else {
      res.end('Error:' + err);
    } 
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


