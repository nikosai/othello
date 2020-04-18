import express from "express";
import * as http from "http";
import socketio from "socket.io";
import { Util } from "../util";
import { WebUIPlayer } from "../player/webui";
import { Player } from "../player";

const app = express();
const PORT = process.env.PORT ?? 3000;
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("docs"));

app.set("port", PORT);

let matchQueue:Player[] = [];

io.on("connection", (s) => {
  const addr = s.handshake.address;
  Util.log(`[connection] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);
  
  s.on("match", (res: { name: string, enemy: string }) => {
    Util.log(`[match] from: ${res.name}`);
    const player = new WebUIPlayer(res.name, s);
    switch (res.enemy) {
      case "AI":
        // player.match(new AIPlayer());
        break;
      case "Human":
        const enemy = matchQueue.shift();
        if (enemy!==undefined) {
          player.match(enemy);
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
  })
})

server.listen(PORT, () => {
  http.get("http://localhost:4000/__browser_sync__?method=reload")
    .on("error", (_) => {})
  console.log(`Listening *:${PORT}`)
})
