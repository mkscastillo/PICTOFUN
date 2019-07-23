import { Component, OnInit } from '@angular/core';
import { HttpService } from './http.service';
import * as io from "socket.io-client";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  socket: any = io();
  constructor(private _httpService: HttpService) { }

  ngOnInit(){
    this.askName();
  }

  askName(){
    var name = prompt("What is your name?");
    console.log(name);
  }

  changeColor(color: String){
    this.socket.emit(color);
    this.socket.on('change', function(data){
      document.body.style.backgroundColor = data.color;
    });
  }
}
