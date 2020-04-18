import { Util } from "../util";
import { Board } from "../server/board";
import { BoardCanvas } from "./canvas";
// import io from "socket.io-client";
declare let io: SocketIOClientStatic;

const FRAMERATE = 60;
const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
Util.assertIsDefined(canvas);

let board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
let boardCanvas = new BoardCanvas(canvas, board);

setInterval(() => {
  const canvasWrapper = document.getElementById("canvas-wrapper");
  Util.assertIsDefined(canvasWrapper);

  // resize
  canvas.width = canvasWrapper.clientWidth * window.devicePixelRatio;
  canvas.height = canvasWrapper.clientHeight * window.devicePixelRatio;

  // update
  boardCanvas.drawBoard();
}, 1000 / FRAMERATE);

const socket = io.connect();

socket.on("connect", () => {
  console.log("connect");
})
