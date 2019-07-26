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
var userIndex = 0;
words = [
  //food
  ["apple", "cheese", "eggplant", "pizza", "peach", "banana", "egg", "cookie", "watermelon", "pasta"],
  //animals
  ["turtle", "giraffe", "shark", "zebra", "snail", "lion", "snake", "raccoon", "duck", "rhinoceros"],
  //nature
  ["tree", "cloud", "waterfall", "volcano", "flower", "beach", "snowflake", "river", "geyser", "iceberg"],
  //halloween
  ["broom", "skeleton", "devil", "ghost", "tombstone", "cauldron", "witch", "spider", "mummy", "vampire"],
]
var wordIndex = 0;
var wordArray = 0;
var word;
var drawer;

var isGameOngoing = false;

/////////////
// TIMER

  var c;
  var t;
  var timer_is_on = false;

  function timedCount() {
    c = c - 1;
    g = g - 1;
    
    if(c>-1 && !(c <= 25 && c >= 20)){
      setTimeout(timedCount, 1000);
      io.emit('timer',{timer:c});
    }
    if(c <= 25 && c >= 20){
      setTimeout(timedCount, 1000);
      io.emit('loading',{timer:g});
    }

    if(c == 0){
      newRound();
    }
  }

  function startTimer() {
    c = 25;
    g = 5;
    if (!timer_is_on) {
      timer_is_on = true;
      timedCount();
    }
  }

//////////

function setIsGameOngoing(){
  isGameOngoing = true;
}

io.on('connection', function (socket) {
  // console.log('User connected');
  if(isGameOngoing){
    io.emit('isGameOngoing',{isGameOngoing: isGameOngoing})
  }

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
      drawer = users[userIndex];
    }
    if(users.length > 1){
      console.log(users);
      io.emit('enable_start');
      }
  });

  socket.on('game_started', function(){
    setIsGameOngoing();
    io.emit('new_game',{word:words[wordArray][wordIndex], drawer:drawer})
    startTimer();
  })

  socket.on('new_round', function(){
    newRound();
  })
})

function newRound(){
  userIndex++;
  drawer = users[userIndex % users.length];
  console.log("new drawer: ", drawer);
  wordIndex++;
  if(wordIndex == 10){
    wordArray = ((wordArray + 1) % words.length);
  }
  word = words[wordArray][wordIndex % words[wordArray].length];
  console.log("new word: ", word);
  io.emit('new_game',{word:word, drawer:drawer})
  startTimer();
}