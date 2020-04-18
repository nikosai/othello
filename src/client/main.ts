import { Game } from "./game";
import io from "socket.io-client";
import { DOMControl } from "./dom";
import { Util, RawBoard, State } from "../util";

const socket = io.connect();

function initGame() {
  DOMControl.init(socket);
}

initGame();

socket.on("connect", () => {
  console.log("connected.")
})

socket.on("disconnect", () => {
  DOMControl.onError("サーバとの通信が切断されました");
})

socket.on("error", (e:any) => {
  DOMControl.onError(e.toString());
})
