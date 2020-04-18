import { RawBoard, State, Util } from "../util";
import { Board } from "../board";
import { BoardCanvas } from "./canvas";
import M from "materialize-css";
import { DOMControl } from "./dom";

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;
const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;
canvas.style.display = "none";

export class Game{
  constructor(socket:SocketIOClient.Socket) {
    const modal = document.getElementById("modal-init")!;
    const modal_buttons = document.getElementById("modal-init-buttons")!;
    modal_buttons.textContent = null;

    const players = ["AI", "Human"];

    const m = M.Modal.init(modal, {
      dismissible: false
    });

    for (const p of players) {
      const a = document.createElement("a");
      a.classList.add("waves-effect", "waves-green", "btn");
      a.href = "javascript:void(0);";
      a.innerText = p;
      a.style.marginLeft = "5px";
      a.addEventListener("click", () => {
        const name = (<HTMLInputElement>document.getElementById("modal-init-name")).value;
        if (name === "") {
          M.toast({ html: "名前を入力せい", classes: "red darken-4" });
          return;
        }
        socket.emit("match", { name: name, enemy: p });
        m.close();
        M.toast({ html: "Matching ..." });
      });
      modal_buttons.appendChild(a);
    }
  
    socket.once("matched", (res: { name: string, board: RawBoard, color: State }) => {
      Util.log(`[matched] ${res}`)
      M.toast({ html: `${res.name}さんと対戦開始！ あなたは${res.color === State.Black ? "黒" : "白"}番です` });
      const board = new Board(BOARD_WIDTH, BOARD_HEIGHT, res.board);
      new BoardCanvas(canvas, socket, board, res.color);
      canvas.style.display = "inline-block";
      socket.once("enemyDisconnected", () => {
        Util.log(`[enemyDisconnected]`);
        DOMControl.onError(`対戦相手（${res.name}さん）との通信が切断されました`);
      })
    })

    m.open();
  }
}
