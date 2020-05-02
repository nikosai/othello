import M from "materialize-css";
import { RawBoard, State, Util } from "../util";
import { Game } from "./game";

export class DOMControl{
  static init(socket:SocketIOClient.Socket) {
    document.getElementById("wrapper")!.style.display = "none";
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
        let name = (<HTMLInputElement>document.getElementById("modal-init-name")).value;
        if (name === "") {
          M.toast({ html: "名前を入力せえ", classes: "red darken-4" });
          return;
          // name = "ゲスト";
        }
        socket.once("matched", (res: { name: string, board: RawBoard, color: State }) => {
          Util.log(`[matched] ${res.board}`)
          M.toast({ html: `${res.name}さんと対戦開始！ あなたは${res.color === State.Black ? "黒" : "白"}番です` });
          document.getElementById("my-color")!.className = (res.color === State.Black ? "black stone" : "white stone");
          document.getElementById("enemy-color")!.className = (res.color === State.Black ? "white stone" : "black stone");
          document.getElementById("my-name")!.innerText = name;
          document.getElementById("enemy-name")!.innerText = res.name;
          new Game(socket, res.color, res.board);
          socket.once("enemyDisconnected", () => {
            Util.log(`[enemyDisconnected]`);
            DOMControl.onError(`対戦相手（${res.name}さん）との通信が切断されました`);
          })
        })
        socket.emit("match", { name: name, enemy: p });
        m.close();
        M.toast({ html: "対戦相手を探しています……" });
      });
      modal_buttons.appendChild(a);
    }
    m.open();
  }

  static checkOpenModals() {
    for (const m of ["modal-init","modal-error"]){
      if (M.Modal.getInstance(document.getElementById(m)!).isOpen) return true;
    }
    return false;
  }
  
  static onError(e:string) {
    const modal = document.getElementById("modal-error")!;
    const pre = modal.querySelector(".modal-content")?.querySelector("pre")!;
    pre.innerText = e;
    M.Modal.init(modal, {
      dismissible: false,
      onCloseStart: () => {
        location.reload();
      }
    }).open();
  }
}
