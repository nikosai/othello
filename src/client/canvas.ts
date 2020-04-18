import { Board } from "../server/board";
import { Util, Box, Vec2, State } from "../util";
import M from "materialize-css";

export class BoardCanvas{
  line_width: number = 0.005;
  square_size: Box;
  elem: HTMLCanvasElement;
  cxt: CanvasRenderingContext2D;
  board: Board;
  mouse_at: Vec2|null = null;
  constructor(element: HTMLCanvasElement,board:Board) {
    this.elem = element;
    this.cxt = Util.checkIsDefined(element.getContext('2d'));
    this.board = board;
    this.square_size = new Box(
      (1 - this.line_width * (this.board.width + 1)) / this.board.width,
      (1 - this.line_width * (this.board.height + 1)) / this.board.height
    );
    const listenerMaker = (f:(x:number,y:number)=>void) => (e:MouseEvent) => {
      const rect = this.elem.getBoundingClientRect();
      const x = e.clientX - Math.floor(rect.left);
      const y = e.clientY - Math.floor(rect.top);
      const i = Math.floor(x / this.elem.width * window.devicePixelRatio * this.board.width);
      const j = Math.floor(y / this.elem.height * window.devicePixelRatio * this.board.height);
      f(i, j);
    }

    document.addEventListener('click', listenerMaker((x,y)=>this.onClick(x,y)));
    document.addEventListener('mousemove', listenerMaker((x,y)=>this.onMouseMove(x,y)));
  }

  drawBoard() {
    const redOverlay = 'rgba(255,0,0,0.3)';
    const grayOverlay = 'rgba(0,0,0,0.2)';
    
    let res: Vec2[] = [];
    if (this.mouse_at) {
      res = this.board.check(this.mouse_at.x, this.mouse_at.y);
    }

    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        this.fillSquare('green', x, y);
        const st = this.board.get(x, y);
        if (st !== State.Empty) {
          this.drawStone(
            (st === State.Black ? 'black' : 'white'),
            'black',
            0.003,
            0.8,
            x, y);
        }

        if (this.mouse_at) {
          if (this.mouse_at.equals(x, y)) {
            if (this.board.get(x, y) === State.Empty) {
              this.drawStone(
                (this.board.curState === State.Black ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'),
                'rgba(0,0,0,0.3)',
                0.003,
                0.65,
                x, y);
            }
            this.fillSquare((res.length > 0 ? redOverlay : grayOverlay), x, y);
          } else if (Vec2.in(res,x,y)) {
            this.fillSquare(redOverlay, x, y);
          }
        }
      }
    }
  }

  fillSquare(fillStyle: string | CanvasGradient | CanvasPattern, x: number, y: number) {
    const left = this.line_width + (this.square_size.width + this.line_width) * x;
    const top = this.line_width + (this.square_size.height + this.line_width) * y;
    this.fillRectPercent(fillStyle, left, top, this.square_size.width, this.square_size.height);
  }

  drawStone(fillStyle: string | CanvasGradient | CanvasPattern, strokeStyle: string | CanvasGradient | CanvasPattern, lineWidth: number, scale: number, x: number, y: number) {
    this.drawEllipseAtPercent(
      fillStyle,
      strokeStyle,
      lineWidth * (this.elem.height + this.elem.width) / 2,
      (2*x+1)/(2*this.board.width),
      (2*y+1)/(2*this.board.height),
      this.square_size.width * scale,
      this.square_size.height * scale
    );
  }

  onClick(x: number, y: number) {
    if (x >= 0 && x < this.board.width && y >= 0 && y < this.board.height) {
      const board = this.board.put(x, y);
      if (board) this.board = board;
    }
  }

  onMouseMove(x: number, y: number) {
    if (x < 0 || x >= this.board.width || y < 0 || y >= this.board.height) {
      this.mouse_at = null;
    } else {
      this.mouse_at = new Vec2(x, y);
    }
  }

  fillRectPercent(fillStyle: string | CanvasGradient | CanvasPattern, x: number, y: number, w: number, h: number) {
    const t = this.cxt.fillStyle;
    this.cxt.fillStyle = fillStyle;
    this.cxt.fillRect(
      this.elem.width * x,
      this.elem.height * y,
      this.elem.width * w,
      this.elem.height * h);
    // if (fillStyle === 'rgba(255,0,0,0.5)') {
    //   console.log(t,this.cxt.fillStyle,
    //     this.elem.width * x,
    //     this.elem.height * y,
    //     this.elem.width * w,
    //     this.elem.height * h)
    // }
    this.cxt.fillStyle = t;
  }

  drawEllipseAtPercent(fillStyle: string | CanvasGradient | CanvasPattern, strokeStyle: string | CanvasGradient | CanvasPattern, lineWidth: number, cx: number, cy: number, width: number, height: number) {
    const f = this.cxt.fillStyle;
    const s = this.cxt.strokeStyle;
    const l = this.cxt.lineWidth;
    this.cxt.fillStyle = fillStyle;
    this.cxt.strokeStyle = strokeStyle;
    this.cxt.lineWidth = lineWidth;
    this.drawEllipseAt(
      cx * this.elem.width,
      cy * this.elem.height,
      width * this.elem.width,
      height * this.elem.height
    );
    this.cxt.fillStyle = f;
    this.cxt.strokeStyle = s;
    this.cxt.lineWidth = l;
  }

  drawEllipseAt(cx: number, cy: number, width: number, height: number){
    const PI2 = Math.PI * 2;
    const ratio = height / width;
    const radius = width / 2;
    const increment = 1 / radius;

    this.cxt.beginPath();
    let x = cx + radius * Math.cos(0);
    let y = cy - ratio * radius * Math.sin(0);
    this.cxt.lineTo(x, y);

    for (let radians = increment; radians < PI2; radians += increment) {
      x = cx + radius * Math.cos(radians);
      y = cy - ratio * radius * Math.sin(radians);
      this.cxt.lineTo(x, y);
    }

    this.cxt.closePath();
    this.cxt.fill();
    this.cxt.stroke();
  }
}
