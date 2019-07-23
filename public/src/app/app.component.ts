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

    @ViewChild(CanvasComponent, {static:false})
    private canvasComponent : CanvasComponent;

    selectedColor = "000000";
    selectedSize = 20;
    bomb : any;
    title = 'public';
    constructor() {};
    
    ngAfterViewInit() {
      console.log(this.selectedColor);
    }

    ngOnInit(){
        this.socket = io("http://localhost:8000");
        this.socket.on("clear-board",function(){
            console.log("CLEARING ALL BOARDS")
            this.canvasComponent.redraw();
        }.bind(this))
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
  }
