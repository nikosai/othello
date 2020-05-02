import { Player } from "../player";
import { Board } from "../../board";
import { State, Candidate, MatchInfo } from "../../util";

type AlphaBetaRet = { v: number, c: Candidate | null };

export class NegaAlphaAIPlayer extends Player {
  readonly func: (board: Board) => number;
  readonly depth: number;
  constructor(func: (board: Board) => number, depth: number, name?:string) {
    super(name??"NegaAlpha");
    this.func = func;
    this.depth = depth;
  }
  match(enemy: Player, info: MatchInfo, color: State) {
    this.enemy = enemy;
    this.color = color;
  }
  async onMyTurn(info: MatchInfo, onPut: (x: number, y: number) => Promise<MatchInfo | null>, enemySkipped?: boolean) {
    const ret = (await this.negaAlpha(new Board(info.board, info.turn), this.depth,
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
    const arr: {c:Candidate,node:Board,v:number}[] = [];
    for (const c of children) {
      const child = node.put(c.point.x, c.point.y, c.flip)!;
      arr.push({ c:c, node: child, v: this.func(child) });
    }
    arr.sort((a, b) => b.v - a.v);
    for (const a of arr) {
      const child = a.node;
      const ret = await this.negaAlpha(child, depth - 1, { v: -beta.v, c: beta.c }, { v: -alpha.v, c: alpha.c });
      if (alpha.v < ret.v) {
        alpha = { v: ret.v, c: a.c };
      }
      if (alpha.v >= beta.v) return alpha;
    }
    return alpha;
  }
}
