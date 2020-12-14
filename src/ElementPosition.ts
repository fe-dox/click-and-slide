export class XYPosition {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}


export class ElementPosition extends XYPosition {
    top: number;
    left: number;

    constructor(top: number, left: number, x: number, y: number) {
        super(x, y);
        this.top = top;
        this.left = left;
    }
}

