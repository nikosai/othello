import { Match } from "./server/match";

export class Util{
  static assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
    if (val === undefined || val === null) {
      throw new Error(
        `Expected 'val' to be defined, but received ${val}`
      );
    }
  }
  static checkIsDefined<T>(val:T):NonNullable<T> {
    Util.assertIsDefined(val);
    return val;
  }
  static reverse(s: State) {
    switch (s) {
      case State.Black: return State.White;
      case State.White: return State.Black;
      case State.Empty: return State.Empty;
    }
  }
  static log(str: string) {
    const now = new Date();
    const pad = (n: number) => ("0" + n.toString(10)).slice(-2);
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const h = now.getHours();
    const min = now.getMinutes();
    const s = now.getSeconds();
    console.log(`[${pad(m)}/${pad(d)} ${pad(h)}:${pad(min)}:${pad(s)}] ${str}`);
  }
  static random<T>(arr:T[]):T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  static calcResult(d: number) {
    if (d >= 54) return "完勝";
    if (d >= 40) return "圧勝";
    if (d >= 26) return "大勝";
    if (d >= 12) return "激戦勝";
    if (d >= 2) return "接戦勝";
    if (d == 0) return "引き分け";
    if (d >= -10) return "接戦負";
    if (d >= -24) return "激戦負";
    if (d >= -38) return "大敗";
    if (d >= -52) return "惨敗";
    return "沈黙";
  }
}

export class Box {
  width: number;
  height: number;
  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
  }
}

export class Vec2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  equals(x: number, y: number) {
    return this.x === x && this.y === y;
  }
  static in(arr: Vec2[], x: number, y: number) {
    for (let a of arr) {
      if (a.equals(x, y)) return true;
    }
    return false;
  }
}

// マスの状態
export enum State {
  Black, // 黒コマ
  White, // 白コマ
  Empty, // なし
}

export type RawBoard = State[][];

export class Candidate{
  point: Vec2;
  flip: Vec2[];

  constructor(point:Vec2, flip:Vec2[]) {
    this.point = point;
    this.flip = flip;
  }
}

export class MatchInfo{
  id: string
  board: RawBoard
  black: { name: string, count: number }
  white: { name: string, count: number }
  turn: State;

  constructor(m:Match){
    this.id = m.id;
    this.board = m.board.getBoard();
    this.black = { name: m.black.name, count: m.board.count(State.Black) };
    this.white = { name: m.white.name, count: m.board.count(State.White) };
    this.turn = m.board.curState;
  }
}
