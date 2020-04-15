import { Vec2, State, Util } from "./util";

// 盤面
export class Board {
  readonly rawboard: RawBoard;
  readonly width: number;
  readonly height: number;
  readonly curState: State; // 次の手番

  constructor(w: number, h: number, rawboard?: RawBoard, curState?: State) {
    this.width = w;
    this.height = h;
    this.rawboard = rawboard ?? RawBoard.init(w, h);
    this.curState = curState ?? State.Black;
  }
  put(x: number, y: number):Board|null {
    const res = this.check(x, y);
    if (res.length === 0) return null;
    return new Board(this.width, this.height,
      this.rawboard.put(x, y, res, this.curState),
      Util.reverse(this.curState)
    );
  }
  get(x: number, y: number) {
    return this.rawboard.get(x, y);
  }
  // for debug
  print() {
    this.rawboard.print();
  }
  check(x: number, y: number): Vec2[] {
    if (this.get(x, y) !== State.Empty) return [];
    let ret: Vec2[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const res = this.checkSub(x, y, dx, dy);
        if (res === null) continue;
        ret.push(...res);
      }
    }
    return ret;
  }
  checkSub(x: number, y: number, dx: number, dy: number): Vec2[] | null {
    const x1 = x + dx;
    const y1 = y + dy;
    const s1 = this.get(x1, y1);
    if (s1 === State.Empty) return null;
    if (this.curState === s1) return [];
    let ret = this.checkSub(x1, y1, dx, dy);
    if (ret === null) return null;
    ret.push(new Vec2(x1, y1));
    return ret;
  }
}

class RawBoard {
  readonly width: number;
  readonly height: number;
  private sqs: State[][]; // 本来の幅・高さより2広い
  private constructor(w: number, h: number, sqs?:State[][]) {
    this.width = w;
    this.height = h;
    this.sqs = [];
    for (let i = 0; i < w + 2; i++) {
      this.sqs[i] = [];
      for (let j = 0; j < h + 2; j++) {
        this.sqs[i][j] = (sqs ? sqs[i][j] : State.Empty);
      }
    }
  }
  private set(x: number, y: number, s: State) {
    this.sqs[x + 1][y + 1] = s;
  }
  get(x: number, y: number) {
    return this.sqs[x + 1][y + 1];
  }
  static init(w: number, h: number) {
    let board = new RawBoard(w, h);
    board.set(3, 3, State.White);
    board.set(4, 4, State.White);
    board.set(3, 4, State.Black);
    board.set(4, 3, State.Black);
    return board;
  }
  copy() {
    return new RawBoard(this.width, this.height, this.sqs);
  }
  private flip(x: number, y: number) {
    this.set(x, y, Util.reverse(this.get(x, y)));
  }
  private flipMulti(arr: Vec2[]):RawBoard {
    let board = this.copy();
    for (let a of arr) {
      board.flip(a.x, a.y);
    }
    return board;
  }
  put(x:number, y:number, res: Vec2[], state:State) {
    let board = this.flipMulti(res);
    board.set(x, y, state);
    return board;
  }
  print() {
    let str = "";
    for (let i = 0; i < this.sqs.length; i++) {
      const s = this.sqs[i];
      for (let j = 0; j < s.length; j++) {
        // const f = (s: State) => {
        //   switch (s) {
        //     case State.Black: return "B";
        //     case State.White: return "W";
        //     case State.Empty: return " ";
        //   }
        // }
        // str += f(s[j]);
        str += s[j];
      }
      str += '\n';
    }
    console.log(str);
  }
}
