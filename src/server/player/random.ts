import { Player } from "../player";
import { Board } from "../../board";
import { State, Util, MatchInfo } from "../../util";

export class RandomAIPlayer extends Player{
  constructor() {
    super("RandomAI");
  }
  match(enemy: Player, info: MatchInfo, color: State) {
    this.enemy = enemy;
    this.color = color;
  }
  async onMyTurn(info: MatchInfo, onPut: (x: number, y: number) => Promise<MatchInfo | null>, enemySkipped?: boolean) {
    const arr = new Board(info.board, info.turn).getCandidates();
    const c = Util.random(arr);
    Util.log(`[put] name:${this.name}, x:${c.point.x}, y:${c.point.y}`);
    onPut(c.point.x, c.point.y);
  }
}
