import M from "materialize-css";
import { RawBoard, State, Util, MatchInfo } from "../util";
import { Game } from "./game";
import { watch, roomlist } from "./main";

export class DOMControl{
  static init(socket:SocketIOClient.Socket) {
    document.getElementById("wrapper")!.style.display = "none";
    const modal = document.getElementById("modal-init")!;
    const modal_buttons = document.getElementById("modal-init-buttons")!;
    modal_buttons.textContent = null;

    const players = ["AI", "Human", "Watch"];

    const m = M.Modal.init(modal, {
      dismissible: false
    });

    document.getElementById("modal-roomlist-back")?.addEventListener("click", () => {
      M.Modal.getInstance(document.getElementById("modal-roomlist")!).close();
      roomlist.emit("stop");
      m.open();
    })

    for (const p of players) {
      const a = document.createElement("a");
      a.classList.add("waves-effect", "waves-green", "btn");
      a.href = "javascript:void(0);";
      a.innerText = p;
      a.style.marginLeft = "5px";
      a.addEventListener("click", () => {
        if (p === "Watch") {
          roomlist.on("update", (res:{roomList:MatchInfo[]}) => {
            const modal = document.getElementById("modal-roomlist")!
            if (!this.checkIsOpen(modal)) {
              M.Modal.init(modal, {
                dismissible:false
              }).open();
            }
            const list = document.getElementById("modal-roomlist-list")!
            list.textContent = null;
            if (res.roomList.length === 0) {
              list.innerHTML = `<div class="collection-item">部屋がありません</div>`
            }
            res.roomList.forEach((m) => {
              const a = document.createElement("a");
              a.href = "javascript:void(0)";
              a.className = "collection-item"
              a.addEventListener("click", () => {
                roomlist.emit("stop");
                watch.emit("watch", { id: m.id });
              })
              const div = document.createElement("div");
              div.className = "matchInfo grey-text text-darken-4";
              a.appendChild(div);
              const span_b = document.createElement("span");
              const span_w = document.createElement("span");
              const i_b = document.createElement("i");
              const i_w = document.createElement("i");
              const span_center = document.createElement("span");
              span_b.className = m.turn === State.Black ? "playerName turn" : "playerName";
              span_w.className = m.turn === State.White ? "playerName turn" : "playerName";
              span_b.innerText = m.black.name;
              span_w.innerText = m.white.name;
              span_center.innerText = `${m.black.count} vs ${m.white.count}`;
              i_b.className = "black stone";
              i_w.className = "white stone";
              const span_right = document.createElement("span");
              span_right.innerHTML = `<i class="material-icons">forward</i>`
              span_right.className = "secondary-content";
              [span_b, i_b, span_center, i_w, span_w, span_right].forEach((e) => {
                div.appendChild(e);
              })
              list.appendChild(a);
            })
          })
          roomlist.emit("request");
          m.close();
          return;
        }
        
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
    for (const m of ["modal-init","modal-error","modal-roomlist"]){
      if (this.checkIsOpen(document.getElementById(m)!)) return true;
    }
    return false;
  }

  static checkIsOpen(m: HTMLElement) {
    return M.Modal.getInstance(m)?.isOpen ?? false
  }
  
  static onError(e:string) {
    const modal = document.getElementById("modal-error")!;
    const pre = modal.querySelector(".modal-content")?.querySelector("pre")!;
    pre.innerText = e;
    M.Modal.init(modal, {
      dismissible: false
    }).open();
  }
}
