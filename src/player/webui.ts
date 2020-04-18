import { Player } from "../player";

// WebUIのサーバ側
export class WebUIPlayer extends Player{
  socket: SocketIO.Socket;
  constructor(name:string,s:SocketIO.Socket) {
    super(name);
    this.socket = s;
  }

  match(enemy: Player, preventEcho = false) {
    if (!preventEcho) enemy.match(this, true);
    this.socket.emit("matched", {name:enemy.name});
  }
} 

