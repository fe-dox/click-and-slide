import {formatTime} from './Utils.js';

const TIMER_IMAGE_PATH = "./img/c{}.gif";

export default class ImageTimer {

    private readonly _hook: HTMLElement;
    private _imgElements: HTMLImageElement[] = new Array<HTMLImageElement>(12);

    constructor(hook: HTMLElement, time: number) {
        this._hook = hook;
        let timeStrArray = formatTime(time).split('');
        timeStrArray.forEach((value, i) => {
            this.createImg(i);
        });
        this._imgElements.forEach(element => this._hook.appendChild(element));
    }

    private createImg(id: number) {
        this._imgElements[id] = document.createElement('img');
    }

    public ChangeTime(time: number): void {
        let timeString = formatTime(time).split('');
        timeString.forEach((character, i) => {
            this._imgElements[i].src = TIMER_IMAGE_PATH.replace(/{}/, character);
        });
    }

}
