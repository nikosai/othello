import express from "express";
import * as http from "http";
import socketio from "socket.io";
import { Util, State } from "../util";
import { WebUIPlayer } from "../player/webui";
import { Player } from "../player";
import { Board } from "../board";
import { RandomAIPlayer } from "../player/random";
import { SimpleAI } from "../player/simple";

const app = express();
const PORT = process.env.PORT ?? 3000;
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("docs"));

app.set("port", PORT);

let matchQueue: Player[] = [];

class Match {
  board: Board;
  black: Player;
  white: Player;
  constructor(p1: Player, p2: Player) {
    this.board = new Board();
    if (Math.floor(Math.random() * 2) === 0) {
      this.black = p1;
      this.white = p2;
    } else {
      this.black = p2;
      this.white = p1;
    }
    Util.log(`[Start] ${this.black.name} vs ${this.white.name}`)

    this.black.match(this.white, this.board, State.Black);
    this.white.match(this.black, this.board, State.White);

    const onPutMaker = (player: Player, enemy: Player, playerOnPut: (x: number, y: number) => Promise<Board | null>, enemyOnPut: (x: number, y: number) => Promise<Board | null>) => async (x: number, y: number) => {
      const newboard = this.board.put(x, y);
      if (newboard) {
        Util.log(`[put] name:${player.name}, x:${x}, y:${y}`);
        this.board = newboard;
        Util.log(`[Candidates] ${this.board.getCandidates().length}`)
        const res = this.board.checkSkipped();
        if (res) {
          this.board = res;
          if (res.checkSkipped()) {
            player.end(this.board);
            enemy.end(this.board);
            return this.board;
          } else {
            player.onMyTurn(this.board, playerOnPut, true);
            return this.board;
          }
        } else {
          enemy.onMyTurn(this.board, enemyOnPut);
          return this.board;
        }
      } else {
        return null;
      }
    };

    const onPuts = {
      black: async (x: number, y: number) => {
        return onPutMaker(this.black, this.white, onPuts.black, onPuts.white)(x, y);
      },
      white: async (x: number, y: number) => {
        return onPutMaker(this.white, this.black, onPuts.white, onPuts.black)(x, y);
      }
    }

    this.black.onMyTurn(this.board, onPuts.black);;
  }
}

io.on("connection", (s) => {
  const addr = s.handshake.address;
  Util.log(`[connection] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);

  let player: Player | undefined;
  s.on("match", (res: { name: string, enemy: string }) => {
    Util.log(`[match] from: ${res.name}`);
    player = new WebUIPlayer(res.name, s)
    switch (res.enemy) {
      case "AI":
        // onMatch(player,new RandomAIPlayer());
        new Match(player, new SimpleAI(10));
        break;
      case "Human":
        const enemy = matchQueue.shift();
        if (enemy !== undefined && enemy.isConnected()) {
          new Match(player, enemy);
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
    .on("error", (_) => { })
  console.log(`Listening *:${PORT}`)
})
