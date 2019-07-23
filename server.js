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

io.on("clear",function(socket){
  console.log("Clearing all boards");
  io.emit("clear-board");
})

io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('disconnect', function() {
    console.log('User disconnected');
  });

  socket.on("draw-coordinates",function(data){
      console.log("Reached server after drawing");
      io.emit("draw-this",data);
  });

  socket.on('blue', function(){
    color = 'blue';
    console.log(color);
    io.emit('change', {color:color});
  });
  socket.on('green', function(){
      color = 'green';
      console.log(color);
      io.emit('change', {color:color});
  });
  io.emit('change', {color:color});

});

// app.listen(8000, function() {
//     console.log("listening on port 8000");
// })