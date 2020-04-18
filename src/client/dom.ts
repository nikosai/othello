import M from "materialize-css";

export class DOMControl{
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
