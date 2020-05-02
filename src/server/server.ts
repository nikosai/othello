import express from "express";
import * as http from "http";
import socketio from "socket.io";
import { Util } from "../util";
import { WebUIPlayer } from "./player/webui";
import { Player } from "./player";
import { WeightingAI } from "./player/weighting";
import { Match } from "./match";

const app = express();
const PORT = process.env.PORT ?? 3000;
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("docs"));

app.set("port", PORT);

let matchQueue: Player[] = [];

io.on("connection", (s) => {
  const addr = s.handshake.address;
  Util.log(`[connection] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);

  let player: Player | undefined;
  let match: Match | undefined;
  s.on("match", (res: { name: string, enemy: string }) => {
    Util.log(`[match] from: ${res.name}`);
    player = new WebUIPlayer(res.name, s)
    switch (res.enemy) {
      case "AI":
        // onMatch(player,new RandomAIPlayer());
        // new Match(player, new SimpleAI(10));
        match = new Match(player, new WeightingAI(6));
        break;
      case "Human":
        // matchQueue.push(player);
        // io.sockets.emit("updateWaiting", {
        //   queue: matchQueue
        //     .filter((p) => p?.isConnected())
        //     .map((p) => { return { name: p.name, id: p.id } })
        // });
        // matchQueue = matchQueue.filter((p) => p?.isConnected());
        const enemy = matchQueue.shift();
        if (enemy !== undefined && enemy.isConnected()) {
          match = new Match(player, enemy);
        } else {
          matchQueue.push(player);
        }
        break;
      default:
        console.error(`Match Error: Unknown type of player: ${res.enemy}`)
    }
  })

  // s.on("matchRequest", (res) => {
    
  // })

  s.on("disconnect", () => {
    Util.log(`[disconnect] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);
    match?.onExit();
  })
})

server.listen(PORT, () => {
  http.get("http://localhost:4000/__browser_sync__?method=reload")
    .on("error", (_) => { })
  console.log(`Listening *:${PORT}`)
})
