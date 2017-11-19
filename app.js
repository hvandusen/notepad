var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var normalizePort = require("normalize-port");
var index = require('./routes/index');
var users = require('./routes/users');
var update = require('./routes/update');
var textString = "";
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = normalizePort(process.env.PORT || "8081")
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/update', update);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.listen(port,function(){
  console.log("listenin")
})

io.on('connection', function(socket){
  // connection console check
  console.log('A user connected');
	socket.emit('connection',{data: textString});

  // disconnect console check
  socket.on('disconnect', function () {
    console.log('A user disconnected');
  });
  // additional callbacks here
  socket.on("textUpdate",function(obj){
    textString = obj.data;
    socket.broadcast.emit('newText', {data: textString});

  })
});

module.exports = app;
