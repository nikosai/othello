import io from "socket.io-client";
import { DOMControl } from "./dom";

const socket = io();

function initGame() {
  DOMControl.init(socket);
}

initGame();

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
