import { Board } from "../board";
import { Player } from "./player";
import * as uuid from "uuid";
import { Util, State, MatchInfo } from "../util";
import { Socket, Namespace } from "socket.io";
import { io } from "./server";

export class Match {
  static list: Match[] = [];
  board: Board;
  black: Player;
  white: Player;
  id: string;
  constructor(p1: Player, p2: Player) {
    this.id = uuid.v4();
    this.board = new Board();
    if (Math.floor(Math.random() * 2) === 0) {
      this.black = p1;
      this.white = p2;
    } else {
      this.black = p2;
      this.white = p1;
    }
    Util.log(`[Start] ${this.black.name} vs ${this.white.name}`)

    this.black.match(this.white, this.getInfo(), State.Black);
    this.white.match(this.black, this.getInfo(), State.White);

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
            player.end(this.getInfo());
            enemy.end(this.getInfo());
            io.of("watch").to(this.id).emit("end", { info: new MatchInfo(this) });
            return this.board;
          } else {
            this.onTurn(player, playerOnPut, true);
            return this.board;
          }
        } else {
          this.onTurn(enemy, enemyOnPut);
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

    this.onTurn(this.black, onPuts.black);
    Match.list.push(this);
  }

  onTurn(p: Player, onPut: (x: number, y: number) => Promise<Board | null>, enemySkipped?: boolean) {
    io.of("watch").to(this.id).emit("turn", { info: new MatchInfo(this) });
    Util.log(`[watch/turn] users:${io.sockets.adapter.rooms[this.id]?.length ?? 0}`)
    p.onMyTurn(this.getInfo(), onPut, enemySkipped);
  }

  equals(m:Match|string) {
    if (m instanceof Match) return m.id === this.id
    else return m === this.id;
  }

  getInfo():MatchInfo{
    return new MatchInfo(this);
  }

  static find(id: string) {
    for (let m of Match.list) {
      if (m.equals(id)) return m;
    }
    return null;
  }

  watch(s: Socket) {
    s.join(this.id, (err) => {
      console.error(err);
      console.log(s.rooms);
      s.emit("init", {info: this.getInfo()});
    });
  }

  onExit() {
    Match.list = Match.list.filter((m)=>!this.equals(m));
    this.black.enemyDisconnected();
    this.white.enemyDisconnected();
    io.of("watch").to(this.id).emit("matchDisconnected");
    for (const s in io.sockets.adapter.rooms[this.id]?.sockets) {
      io.sockets.sockets[s]?.leave(this.id);
    }
  }
}
