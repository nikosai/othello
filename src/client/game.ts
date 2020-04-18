import M from "materialize-css";
import io from "socket.io-client";
import { Util } from "../util";
import { Board } from "../board";
import { BoardCanvas } from "./canvas";

const socket = io.connect();
const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;
const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;

socket.on("connect", () => {
  console.log("connected.")
})

socket.on("disconnect", () => {
  const modal = document.getElementById("modal-error")!;
  const pre = modal.querySelector(".modal-content")?.querySelector("pre")!;
  pre.innerText = "通信が切断されました";
  M.Modal.init(modal, {
    dismissible: false,
    onCloseStart: () => {
      location.reload();
    }
  }).open();
})

function checkOpenModals() {
  for (const m of ["modal-init","modal-error"]){
    if (M.Modal.getInstance(document.getElementById(m)!).isOpen) return true;
  }
  return false;
}

export class Game{
  constructor() {
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
      });
      modal_buttons.appendChild(a);
    }
  
    m.open();

    let board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
    let boardCanvas = new BoardCanvas(canvas, board);
    
    socket.on("matched", (res:{name:string}) => {
      console.log(res.name);
    })
  }
}
