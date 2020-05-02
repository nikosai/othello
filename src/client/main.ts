import io from "socket.io-client";
import { DOMControl } from "./dom";
import { initWatch } from "./watch";

const socket = io();
export const watch = io("/watch");
export const roomlist = io("/roomlist");

function initGame() {
  DOMControl.init(socket);
}

initGame();
initWatch();

let unloading = false;
window.addEventListener("beforeunload", (e) => {
  unloading = true;
})

socket.on("connect", () => {
  console.log("connected.")
})

socket.on("disconnect", () => {
  if (!unloading) DOMControl.onError("サーバとの通信が切断されました");
})

socket.on("error", (e:any) => {
  DOMControl.onError(e.toString());
})
