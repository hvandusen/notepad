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
var MongoClient = require('mongodb').MongoClient;
var textString = "";
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = normalizePort(process.env.PORT || "8081")
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
function stringifyDate(){
  return new Date().toString().split(" ").slice(0,3).join("-");
}
var url = "mongodb://kay:"+process.env.MONGO_PW +"@mycluster0-shard-00-00-wpeiv.mongodb.net:27017,mycluster0-shard-00-01-wpeiv.mongodb.net:27017,mycluster0-shard-00-02-wpeiv.mongodb.net:27017/admin?ssl=true&replicaSet=Mycluster0-shard-0&authSource=admin";
var uri = "mongodb://hvandusen:"+process.env.MONGO_PW+"@hankscluster-shard-00-00-dtp7l.mongodb.net:27017,hankscluster-shard-00-01-dtp7l.mongodb.net:27017,hankscluster-shard-00-02-dtp7l.mongodb.net:27017/admin?replicaSet=HanksCluster-shard-0&ssl=true"
MongoClient.connect(uri, function(err, mongoClient) {
    var db = mongoClient.db("notepad");
    //find the record from today
    db.collection("notepad").find({"dateId":stringifyDate()}).toArray(function(err,items){
      if(items.length)
        textString = items[0].html
      setText(textString);//db.collection("notepad").update({"dateId":stringifyDate()},{$set:{"jont":"u suckzzz", dateId: stringifyDate()},
      // $currentDate: { actual: true}},{upsert:true});
      function setText(html){
        console.log("setting html to "+html+" at "+new Date().toString())
        db.collection("notepad").update(
          {
            "dateId":stringifyDate()
          },
          {
            $set:{"html":html,"dateId":stringifyDate()},
            $currentDate: { actual: true}
          },
          {upsert:true}
        )
      }
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
          theCurrentText = obj.data
          setText(obj.data)
          socket.broadcast.emit('newText', {data: textString});

        })
      });
    });
    //db.close();
});

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


module.exports = app;
