import {ElementPosition} from './ElementPosition.js';

export default class Element extends HTMLElement {
    public internalID: number;
    public static ANIMATION_FRAMES: number = 50;
    private _position: ElementPosition;

    constructor() {
        super();
    }

    set position(value: ElementPosition) {
        this.style.top = value.top + "px";
        this.style.left = value.left + "px";
        this._position = value;
    }

    get position(): ElementPosition {
        return this._position;
    }
}
