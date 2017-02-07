// server.js

var express        = require('express');
var mongoose      = require('mongoose');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var httpServer = require("http").createServer(app);
var cors = require('cors');

    
// config files
var db = require('./config/db');

// set our port
var port = 3000; 

// connect to  mongoDB  
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/Calendar');

app.use(cors());

// parse application/json 
app.use(bodyParser.json({limit: '50mb'})); 


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

//set the public folder of the app
app.use(express.static(__dirname + '/public'));



//load basic route for server
require('./server/routes/basic')(app);
require('./server/routes/auth')(app);

// startup our app at http://localhost:3000
httpServer.listen(port);


// shoutout to the user                     
console.log('Server available at http://localhost:' + port);

// expose app           
exports = module.exports = app;                         

