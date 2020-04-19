import { RawBoard, State, Util } from "../util";
import { Board } from "../board";
import { BoardCanvas } from "./canvas";
import M from "materialize-css";

const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;

export class Game {
  myColor: State;
  board: Board;
  private socket: SocketIOClient.Socket;
  eventSet: Set<string>;
  canvas: BoardCanvas;
  waitingTurn: boolean;
  constructor(socket: SocketIOClient.Socket, myColor: State, board: RawBoard) {
    document.getElementById("wrapper")!.style.display = "block";
    this.board = new Board(board);
    this.canvas = new BoardCanvas(canvas, this);
    this.socket = socket;
    this.myColor = myColor;
    this.eventSet = new Set();
    this.waitingTurn = true;

    this.on("gameEnd", (res: { board: RawBoard, stones: number, enemy: number }) => {
      Util.log(`[gameEnd] ${res.board}`);
      this.board = new Board(res.board, this.myColor);
      const d = res.stones - res.enemy;
      let str = `試合終了！ ${res.stones}対${res.enemy}で勝負差${Math.abs(d)}の`
      if (d >= 54) str += "完勝";
      else if (d >= 40) str += "圧勝";
      else if (d >= 26) str += "大勝";
      else if (d >= 12) str += "激戦勝";
      else if (d >= 2) str += "接戦勝";
      else if (d == 0) str += "引き分け";
      else if (d >= -10) str += "接戦負";
      else if (d >= -24) str += "激戦負";
      else if (d >= -38) str += "大敗";
      else if (d >= -52) str += "惨敗";
      else str += "沈黙";
      str += "です";
      if (d > 0) str += "！";
      else if (d < 0) str += "……";
      M.toast({ html: str });
      this.finalize();
    })

    this.on("turn", (res: { board: RawBoard, enemySkipped: boolean }) => {
      const f = () => {
        if (!this.waitingTurn) {
          setTimeout(f, 100);
          return;
        }
        Util.log(`[turn] ${res}`)
        this.waitingTurn = false;
        this.board = new Board(res.board, this.myColor);
        if (res.enemySkipped) {
          M.toast({ html: "相手はどこにも置けないのでパスしました" });
        }
        // M.toast({ html: "あなたの番です" })
      };
      f();
    })
    this.on("skip", (res: { board: RawBoard }) => {
      Util.log(`[skip] ${res}`);
      if (!this.myColor) {
        console.error("Error: this.myColor is undefined.");
        return;
      }
      this.board = new Board(res.board, Util.reverse(this.myColor));
      M.toast({ html: "どこにも置けないのでパスしました" });
    })
    this.on("putSuccess", (res: { board: RawBoard }) => {
      Util.log(`[putSuccess] ${res}`)
      this.board = new Board(res.board, Util.reverse(this.myColor));
      this.waitingTurn = true;
    })
    this.on("putFail", () => {
      Util.log(`[putFail]`)
      M.toast({ html: "そこには置けません", classes: "red darken-2" });
    })
  }

  isMyTurn() {
    return this.myColor === this.board.curState;
  }

  on(event: string, fn: Function) {
    if (this.eventSet.has(event)) {
      console.error(`Warning: the handler of event ${event} is already defined`);
    }
    this.eventSet.add(event);
    this.socket.on(event, fn);
  }

  emit(event: string, ...args: any[]) {
    Util.log(`[${event}] ${args}`);
    this.socket.emit(event, ...args);
  }

  finalize() {
    this.eventSet.forEach((v) => {
      this.socket.off(v);
    })
  }
}
