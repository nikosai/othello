import M from "materialize-css";

export class DOMControl{
  static init(socket:SocketIOClient.Socket) {
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
          // M.toast({ html: "名前を入力せい", classes: "red darken-4" });
          // return;
          name = "ゲスト";
        }
        socket.emit("match", { name: name, enemy: p });
        m.close();
        M.toast({ html: "Matching ..." });
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
