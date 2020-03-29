import { Vec2, State, Util } from "./util";

// 盤面
export class Board {
  sqs: State[][]; // 本来の幅・高さより2広い
  width: number;
  height: number;
  curState: State = State.Black;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.sqs = [];
    for (let i = 0; i < w + 2; i++) {
      this.sqs[i] = [];
      for (let j = 0; j < h + 2; j++) {
        this.sqs[i][j] = State.Empty;
      }
    }
    this.init();
  }
  set(x: number, y: number, s: State) {
    this.sqs[x + 1][y + 1] = s;
  }
  get(x: number, y: number) {
    return this.sqs[x + 1][y + 1];
  }
  init() {
    this.set(3, 3, State.White);
    this.set(4, 4, State.White);
    this.set(3, 4, State.Black);
    this.set(4, 3, State.Black);
  }
  put(x: number, y: number) {
    const res = this.check(x, y);
    if (res.length === 0) return;
    this.flipMulti(res);
    this.set(x, y,this.curState);
    // this.print();
    this.curState = Util.reverse(this.curState);
  }
  // for debug
  print() {
    let str = "";
    for (let i = 0; i < this.sqs.length; i++){
      const s = this.sqs[i];
      for (let j = 0; j < s.length; j++){
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
  flip(x: number, y: number) {
    this.set(x,y,Util.reverse(this.get(x,y)));
  }
  flipMulti(arr: Vec2[]) {
    for (let a of arr) {
      this.flip(a.x, a.y);
    }
  }
  check(x: number, y: number): Vec2[] {
    if (this.get(x,y) !== State.Empty) return [];
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
