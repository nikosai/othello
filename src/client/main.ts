import { Game } from "./game";
import io from "socket.io-client";
import { DOMControl } from "./dom";
import { Util, RawBoard, State } from "../util";

const socket = io.connect();

let game: Game | undefined;
function initGame() {
  socket.once("matched", (res: { name: string, board: RawBoard, color: State }) => {
    Util.log(`[matched] ${res.board}`)
    M.toast({ html: `${res.name}さんと対戦開始！ あなたは${res.color === State.Black ? "黒" : "白"}番です` });
    game = new Game(socket, res.color, res.board);
    socket.once("enemyDisconnected", () => {
      Util.log(`[enemyDisconnected]`);
      DOMControl.onError(`対戦相手（${res.name}さん）との通信が切断されました`);
    })
  })
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
