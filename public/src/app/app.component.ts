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
    score: number = 0;
    isGameOngoing: boolean = false;
    loading: boolean = false;

    @ViewChild(CanvasComponent, {static:false})
    private canvasComponent : CanvasComponent;

    selectedColor = "000000";
    selectedSize = 20;
    bomb : any;
    constructor() {};
    
    ngAfterViewInit() {
      console.log(this.selectedColor);
      this.socket.on('enable_start', function(){
        this.enable_start = true;
        console.log(this.enable_start);
      }.bind(this));
      
      this.socket.on('timer', function(timer){
        this.timer = timer.timer;
        this.loading = false;
      }.bind(this));
      this.socket.on('loading', function(timer){
        this.timer = timer.timer;
        this.loading = true;
      }.bind(this));
      
      this.socket.on('new_game', function(data){
        this.hasGuess = false;
        this.message = '';
        this.guess = '';
        this.isGameOngoing = data.isGameOngoing;
        this.enable_start = false;
        this.game_started = true;
        this.loading = true;
        if(data.drawer == this.name){
          this.show_word = true;
        } else {
          this.show_word = false;
        }
        this.word = data['word'];
        console.log("something", this.word);
      }.bind(this));
    }

    ngOnInit(){
        this.name = prompt("What is your name?");
        this.socket = io();
        this.socket.emit("name", {name:this.name});  
        this.socket.on("clear-board",function(){
            console.log("CLEARING ALL BOARDS")
            this.canvasComponent.redraw();
        }.bind(this))
        this.socket.on('isGameOngoing', function(data){
          this.isGameOngoing = data.isGameOngoing;
        }.bind(this));
    }

    start_game(){
      this.socket.emit('game_started',{});
    }
  
    update(jscolor) {
      this.selectedColor = jscolor;
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
    }
  
    draw(jscolor){
      this.selectedColor = jscolor;
      if(this.selectedColor == undefined) {
        this.selectedColor = "black";
      }
    }

    clear() {
        this.canvasComponent.redraw();
        this.socket.emit("clear");
    }

    guessing(){
      if(this.guess == this.word){
        this.message = "Correct!";
        this.score++;
        // setTimeout(this.socket.emit('new_round'),10000);
      } else {
        this.message = "Guess Again!"
      }
      this.hasGuess = true;
    }
  }
