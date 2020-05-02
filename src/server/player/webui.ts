import { Player } from "../player";
import { Board } from "../../board";
import { State, Util, MatchInfo } from "../../util";

// WebUIのサーバ側
export class WebUIPlayer extends Player {
  socket: SocketIO.Socket;
  constructor(name: string, s: SocketIO.Socket) {
    super(name);
    this.socket = s;
  }

  match(enemy: Player, info: MatchInfo, color: State) {
    this.enemy = enemy;
    this.color = color;
    this.socket.emit("matched", { name: enemy.name, info: info, color: color });
  }

  isConnected() {
    return this.socket.connected;
  }

  isWaiting() {
    return this.isConnected() && this.enemy === undefined;
  }

  async onMyTurn(info:MatchInfo, onPut: (x: number, y: number) => Promise<Board | null>, enemySkipped?: boolean) {
    this.socket.emit("turn", { info: info, enemySkipped: enemySkipped ?? false });
    const listener = async (res: { x: number, y: number }) => {
      let board = await onPut(res.x, res.y);
      if (board) {
        this.socket.emit("putSuccess", { info: info })
      } else {
        this.socket.emit("putFail");
        this.socket.once("put", listener);
      }
    }
    this.socket.once("put", listener);
  }

  enemyDisconnected() {
    if (this.isConnected()) this.socket.emit("enemyDisconnected");
  }

  skip(info: MatchInfo) {
    this.socket.emit("skip", { info: info });
  }

  end(info: MatchInfo) {
    if (this.color === undefined) {
      console.error("Error: this.color is undefined");
      return;
    }
    this.socket.emit("gameEnd", {
      info: info
    });
  }
}

