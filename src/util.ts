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
