import { Player } from "../player";
import { Board } from "../board";
import { State, Util } from "../util";

export class RandomAIPlayer extends Player{
  constructor() {
    super("RandomAI");
  }
  match(enemy: Player, board: Board, color: State) {
    this.enemy = enemy;
    this.color = color;
  }
  async onMyTurn(board: Board, onPut: (x: number, y: number) => Promise<Board | null>, enemySkipped?: boolean) {
    const arr = board.getCandidates();
    const c = Util.random(arr);
    Util.log(`[put] name:${this.name}, x:${c.point.x}, y:${c.point.y}`);
    onPut(c.point.x, c.point.y);
  }
}
