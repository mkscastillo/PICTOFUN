import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CanvasComponent } from './canvas/canvas.component';
// import { HttpService } from './http.service';
import * as io from "socket.io-client";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit{
    socket: any;
    name: any;
    enable_start: boolean = false;
    game_started: boolean = false;
    timer: any;
    guess: any = '';
    show_word: boolean = false;
    word: any = '';
    hasGuess: boolean = false;
    message: any;
    @ViewChild(CanvasComponent, {static:false})
    private canvasComponent : CanvasComponent;

    selectedColor = "000000";
    selectedSize = 20;
    bomb : any;
    constructor() {};
    
    ngAfterViewInit() {
      console.log(this.selectedColor);
      this.socket.on('enable_start', function(){
        console.log("are you working")
        this.enable_start = true;
        console.log(this.enable_start)
      }.bind(this));
      this.socket.on('timer', function(timer){
        this.timer = timer.timer;
      }.bind(this));
      this.socket.on('new_game', function(data){
        this.enable_start = false;
        this.game_started = true;
        if(data.drawer == this.name){
          this.show_word = true;
        }
        this.word = data['word'];
        console.log("something", this.word);
      }.bind(this));
    }

    ngOnInit(){
        this.name = prompt("What is your name?");
        this.socket = io();
        this.socket.on("clear-board",function(){
            console.log("CLEARING ALL BOARDS")
            this.canvasComponent.redraw();
        }.bind(this))
        this.socket.emit("name", {name:this.name});  
    }

    start_game(){
      this.socket.emit('game_started',{});
    }
  
    update(jscolor) {
      console.log("jscolor: " + jscolor);
      this.selectedColor = jscolor;
      console.log("selectedColor: " + this.selectedColor);
    }

    small() {
      this.selectedSize= 3;
    }

    medium() {
      this.selectedSize = 6; 
    }

    large() {
      this.selectedSize = 15;
    }

    eraser() {
      this.selectedColor = "white"; 
      console.log(this.selectedColor);
    }
  
    draw(jscolor){
      this.selectedColor = jscolor;
      if(this.selectedColor == undefined) {
        this.selectedColor = "black"
      }
    }

    clear() {
        this.canvasComponent.redraw();
        this.socket.emit("clear");
    }

    guessing(){
      console.log("on guessing guess: ", this.guess);
      console.log("on guessing word: ", this.word);
      if(this.guess == this.word){
        this.message = "correct!"
        console.log("correct")
      } else {
        this.message = "guess again"
        console.log("guess again")
      }
      this.hasGuess = true;
    }
  }
