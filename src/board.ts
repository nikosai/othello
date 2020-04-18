import { Vec2, State, Util, Candidate, RawBoard } from "./util";

// 盤面
export class Board {
  private readonly rawboard: RawBoard;
  readonly width: number;
  readonly height: number;
  readonly curState: State; // 次の手番

  constructor(w: number, h: number, rawboard?: RawBoard, curState?: State) {
    this.width = w;
    this.height = h;
    this.curState = curState ?? State.Black;
    if (rawboard) {
      this.rawboard = rawboard;
    } else {
      let board:RawBoard = [];
      for (let i = 0; i < w + 2; i++) {
        board[i] = [];
        for (let j = 0; j < h + 2; j++) {
          board[i][j] = State.Empty;
        }
      }
      board[4][4] = board[5][5] = State.White;
      board[4][5] = board[5][4] = State.Black;
      this.rawboard = board;
    }
  }
  private set(x: number, y: number, s: State) {
    this.rawboard[x + 1][y + 1] = s;
  } 
  get(x: number, y: number) {
    return this.rawboard[x + 1][y + 1];
  }
  getBoard(): RawBoard{
    const board:RawBoard = [];
    for (let i = 0; i < this.width + 2; i++) {
      board[i] = [];
      for (let j = 0; j < this.height + 2; j++) {
        board[i][j] = this.rawboard[i][j];
      }
    }
    return board;
  }
  // どこにも置けない状態か
  checkSkipped():Board|null {
    for (let x = 0; x < this.width; x++){
      for (let y = 0; y < this.height; y++){
        if (this.check(x, y).length > 0) return null;
      }
    }
    return new Board(this.width, this.height, this.rawboard, Util.reverse(this.curState));
  }
  count(s: State) {
    let c = 0;
    for (let x = 0; x < this.width; x++){
      for (let y = 0; y < this.height; y++){
        if (this.get(x, y) === s) c++;
      }
    }
    return c;
  }
  put(x: number, y: number, arr?: Vec2[]) {
    const board = this.getBoard();
    if (!arr) {
      arr = this.check(x, y);
    }
    if (arr.length === 0) {
      return null
    }
    for (let a of arr) {
      board[a.x+1][a.y+1] = this.curState;
    }
    board[x+1][y+1] = this.curState;
    return new Board(this.width, this.height,
      board,
      Util.reverse(this.curState)
    );
  }
  // for debug
  print() {
    let str = "";
    for (let i = 0; i < this.rawboard.length; i++) {
      const s = this.rawboard[i];
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

  // // for debug
  // print() {
  //   this.rawboard.print();
  // }
  getCandidates(): Candidate[]{
    let ret:Candidate[] = [];
    for (let x = 0; x < this.width; x++){
      for (let y = 0; y < this.height; y++){
        let res = this.check(x, y);
        if (res.length > 0) ret.push(new Candidate(new Vec2(x,y),res));
      }
    }
    return ret;
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
