import { Player } from "../player";
import { Board } from "../board";
import { State, Candidate, Util } from "../util";

type AlphaBetaRet = { v: number, c: Candidate | null };

export class NegaAlphaAIPlayer extends Player {
  readonly func: (board: Board) => number;
  readonly depth: number;
  constructor(func: (board: Board) => number, depth: number) {
    super("NegaAlpha");
    this.func = func;
    this.depth = depth;
  }
  match(enemy: Player, board: Board, color: State) {
    this.enemy = enemy;
    this.color = color;
  }
  async onMyTurn(board: Board, onPut: (x: number, y: number) => Promise<Board | null>, enemySkipped?: boolean) {
    const ret = (await this.negaAlpha(board, this.depth,
      { v: -Infinity, c: null },
      { v: Infinity, c: null })).c;
    if (!ret) {
      console.error("Error: the return value of negaAlpha is null");
      return;
    }
    onPut(ret.point.x, ret.point.y);
  }
  async negaAlpha(node: Board, depth: number, alpha: AlphaBetaRet, beta: AlphaBetaRet): Promise<AlphaBetaRet> {
    if (node.isLeaf() || depth === 0) {
      return { v: (this.color === node.curState ? 1 : -1) * this.func(node), c: null };
    }
    const children = node.getCandidates();
    for (const c of children) {
      const child = node.put(c.point.x, c.point.y, c.flip)!;
      const ret = await this.negaAlpha(child, depth - 1, { v: -beta.v, c: beta.c }, { v: -alpha.v, c: alpha.c });
      if (alpha.v < ret.v) {
        alpha = { v: ret.v, c: c };
      }
      if (alpha.v >= beta.v) return alpha;
    }
    return alpha;
  }
}
