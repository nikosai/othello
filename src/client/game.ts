import { RawBoard, State, Util, MatchInfo } from "../util";
import { Board } from "../board";
import { BoardCanvas } from "./canvas";
import M from "materialize-css";


export class Game {
  myColor: State;
  private socket: SocketIOClient.Socket;
  eventSet: Set<string>;
  canvas: BoardCanvas;
  waitingTurn: boolean;
  constructor(socket: SocketIOClient.Socket, myColor: State, info: MatchInfo) {
    this.canvas = new BoardCanvas(info, myColor, (x,y)=>{
      this.emit("put", { x: x, y: y });
    });
    this.socket = socket;
    this.myColor = myColor;
    this.eventSet = new Set();
    this.waitingTurn = true;

    this.on("gameEnd", (res: { info: MatchInfo }) => {
      Util.log(`[gameEnd] ${res.info}`);
      this.setInfo(res.info);
      const me = this.myColor === State.Black ? res.info.black : res.info.white;
      const enemy = this.myColor === State.Black ? res.info.white : res.info.black;
      const d = me.count - enemy.count;
      let str = `試合終了！ ${me.count}対${enemy.count}で勝負差${Math.abs(d)}の${Util.calcResult(d)}です`
      if (d > 0) str += "！";
      else if (d < 0) str += "……";
      M.toast({ html: str });
      this.finalize();
    })

    this.on("turn", (res: { info:MatchInfo, enemySkipped: boolean }) => {
      const f = () => {
        if (!this.waitingTurn) {
          setTimeout(f, 100);
          return;
        }
        Util.log(`[turn] ${res}`)
        this.waitingTurn = false;
        this.setInfo(res.info);
        if (res.enemySkipped) {
          M.toast({ html: "相手はどこにも置けないのでパスしました" });
        }
        // M.toast({ html: "あなたの番です" })
      };
      f();
    })
    this.on("skip", (res: { info: MatchInfo }) => {
      Util.log(`[skip] ${res}`);
      if (!this.myColor) {
        console.error("Error: this.myColor is undefined.");
        return;
      }
      this.setInfo(res.info);
      M.toast({ html: "どこにも置けないのでパスしました" });
    })
    this.on("putSuccess", (res: { info: MatchInfo }) => {
      Util.log(`[putSuccess] ${res}`)
      this.setInfo(res.info);
      this.waitingTurn = true;
    })
    this.on("putFail", () => {
      Util.log(`[putFail]`)
      M.toast({ html: "そこには置けません", classes: "red darken-2" });
    })
  }

  setInfo(info: MatchInfo) {
    this.canvas.setInfo(info);
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
