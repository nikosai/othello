import express from "express";
import * as http from "http";
import socketio from "socket.io";
import { Util, State } from "../util";
import { WebUIPlayer } from "../player/webui";
import { Player } from "../player";
import { Board } from "../board";

const app = express();
const PORT = process.env.PORT ?? 3000;
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("docs"));

app.set("port", PORT);

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

let matchQueue:Player[] = [];

function onMatch(p1: Player, p2: Player) {
  let board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
  let black:Player, white:Player;
  if (Math.floor(Math.random() * 2) === 0) {
    black = p1;
    white = p2;
  } else {
    black = p2;
    white = p1;
  }
  Util.log(`[Start] ${black.name} vs ${white.name}`)

  black.match(white, board, State.Black);
  white.match(black, board, State.White);

  const onPutMaker = (player: Player, enemy: Player, playerOnPut: (x: number, y: number) => Board | null, enemyOnPut: (x: number, y: number) => Board | null) => (x: number, y: number) => {
    const newboard = board.put(x, y);
    if (newboard) {
      board = newboard;
      const res = board.checkSkipped();
      if (res) {
        board = res;
        if (res.checkSkipped()) {
          player.end(board);
          enemy.end(board);
        } else {
          player.onMyTurn(board,playerOnPut,true);
        }
      } else {
        enemy.onMyTurn(board, enemyOnPut);
      }
      return newboard;
    } else {
      return null;
    }
  };

  const onPuts = {
    black: (x: number, y: number) => {
      return onPutMaker(black, white, onPuts.black, onPuts.white)(x,y);
    },
    white: (x: number, y: number) => {
      return onPutMaker(white, black, onPuts.white, onPuts.black)(x,y);
    }
  }
  
  black.onMyTurn(board, onPuts.black);;
}

io.on("connection", (s) => {
  const addr = s.handshake.address;
  Util.log(`[connection] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);
  
  let player: Player|undefined;
  s.on("match", (res: { name: string, enemy: string }) => {
    Util.log(`[match] from: ${res.name}`);
    player = new WebUIPlayer(res.name, s)
    switch (res.enemy) {
      case "AI":
        // player.match(new AIPlayer());
        break;
      case "Human":
        const enemy = matchQueue.shift();
        if (enemy!==undefined && enemy.isConnected()) {
          onMatch(player, enemy);
        } else {
          matchQueue.push(player);
        }
        break;
      default:
        console.error(`Match Error: Unknown type of player: ${enemy}`)
    }
  })
  
  s.on("disconnect", () => {
    Util.log(`[disconnect] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);
    if (player?.enemy) {
      player.enemy.enemyDisconnected();
    }
  })
})

server.listen(PORT, () => {
  http.get("http://localhost:4000/__browser_sync__?method=reload")
    .on("error", (_) => {})
  console.log(`Listening *:${PORT}`)
})
