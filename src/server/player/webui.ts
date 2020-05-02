import { Player } from "../player";
import { Board } from "../../board";
import { State, Util } from "../../util";

// WebUIのサーバ側
export class WebUIPlayer extends Player {
  socket: SocketIO.Socket;
  constructor(name: string, s: SocketIO.Socket) {
    super(name);
    this.socket = s;
  }

  match(enemy: Player, board: Board, color: State) {
    this.enemy = enemy;
    this.color = color;
    this.socket.emit("matched", { name: enemy.name, board: board.getBoard(), color: color });
  }

  isConnected() {
    return this.socket.connected;
  }

  isWaiting() {
    return this.isConnected() && this.enemy !== undefined;
  }

  async onMyTurn(board: Board, onPut: (x: number, y: number) => Promise<Board | null>, enemySkipped?: boolean) {
    this.socket.emit("turn", { board: board.getBoard(), enemySkipped: enemySkipped ?? false });
    const listener = async (res: { x: number, y: number }) => {
      let board = await onPut(res.x, res.y);
      if (board) {
        this.socket.emit("putSuccess", { board: board.getBoard() })
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

  skip(board: Board) {
    this.socket.emit("skip", { board: board.getBoard() });
  }

  end(board: Board) {
    if (this.color === undefined) {
      console.error("Error: this.color is undefined");
      return;
    }
    this.socket.emit("gameEnd", {
      board: board.getBoard(), stones: board.count(this.color), enemy: board.count(Util.reverse(this.color))
    });
  }
}

