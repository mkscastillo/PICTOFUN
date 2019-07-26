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

var scores = [];
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
var wordArray = 1;
var word;
var drawer;
var winner = '';
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
      io.emit('timerLapsed');
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

  socket.once('disconnect', function() {
    console.log('User disconnected', socket.id);
    for(x in users){
      if(socket.id == users[x].id){
        var idx = x;
        users.splice(idx,1);
      }
    }
    console.log("after delete: ", users);
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
    // users.push(name.name);
    users.push({name:name.name, id:socket.id});
    if(users.length == 1){
      drawer = users[userIndex].name;
      // drawer = users[userIndex];
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
    // setTimeout(newRound(), 2000);
    newRound();
  })

  socket.on('correctAnswer', function(){
    socket.broadcast.emit('lostRound');
  })

  socket.on('scores', function(data){
    scores.push(data);
    console.log("inside socket: ",scores);
  })


})

function newRound(){
  userIndex++;
  drawer = users[userIndex % users.length].name;
  console.log("new drawer: ", drawer);
  wordIndex++;
  console.log("wordIndex: ", wordIndex);
  
  //if done with wordarray, move to next/getScores
  if(wordIndex == 5){
    io.emit('getScores');
    setTimeout(getWinner,2000);
    isGameOngoing = false;
  } else if(isGameOngoing){
  //loop through word array
  word = words[wordArray][wordIndex % words[wordArray].length];
  console.log("new word: ", word);
  // while(wordIndex < 10){
    io.emit('new_game',{word:word, drawer:drawer})
    startTimer();
  // }
  }
}

function getWinner(){
  console.log("inside getwinner: ", scores);
  var maxScore=0;
  for(var x of scores){
    if(x.score>maxScore){
      maxScore = x.score;
      winner = x.name;
    }
  }
  io.emit('getWinner',{winner:winner, score:maxScore});
}