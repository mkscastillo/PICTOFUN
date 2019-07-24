var express = require('express');
var app = express();
app.use(express.static( __dirname + '/public/dist/public' ));
var bodyParser = require('body-parser');
app.use(bodyParser.json());

require('./server/config/mongoose.js');
require('./server/config/routes.js')(app);

var path = require('path'); 
app.all("*", (req,res,next) => {
  res.sendFile(path.resolve("./public/dist/public/index.html"))
});

const server = app.listen(8000);
const io = require('socket.io')(server);

var users = [];
var drawer;
/////////////

  var c = 5;
  var t;
  var timer_is_on = false;

  function timedCount() {
    c = c - 1;
    // if( c <= 0 ){
    //   console.log("c less than")
    //   stopTimer();
    // } else {

    // }
    
    if(c>-1){
      setTimeout(timedCount, 1000);
      io.emit('timer',{timer:c});
    }
    // t = setTimeout(timedCount, 1000);
    // console.log("------", t)
  }

  function startTimer() {
    if (!timer_is_on) {
      timer_is_on = true;
      timedCount();
    }
  }

  // function stopTimer(){
  //   console.log("t", t)
  //   clearTimeout(t);
  //   timer_is_on = false;
  // }
//////////
io.on('connection', function (socket) {
  // console.log('User connected');
  socket.on('disconnect', function() {
    // console.log('User disconnected');
  });

  socket.on('draw-coordinates',function(data){
      // console.log("Reached server after drawing");
      io.emit("draw-this",data);
  });

  socket.on('clear', function(socket){
      console.log("Clearing all boards");
      io.emit("clear-board");
  });

  socket.on('name', function(name){
    users.push(name.name);
    if(users.length == 1){
      drawer = users[0];
    }
    if(users.length > 1){
      console.log(users);
      io.emit('enable_start');
    }
  });

  socket.on('game_started', function(name){
    io.emit('new_game',{word:"apple", drawer:drawer})
    startTimer();
    })
})
