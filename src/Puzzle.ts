import Element from './Element.js';
import {ElementPosition, XYPosition} from './ElementPosition.js';

export default class Puzzle {
    private _puzzleState: PuzzleState = PuzzleState.Initialized;
    private _missingElement: Element;
    private _currentlyEmptyPosition: ElementPosition;
    private readonly _dimensions: number;
    private readonly _gameTable: Element[][] = [];
    private readonly _mountPoint: HTMLElement;
    private readonly _styleElement: HTMLElement;
    private readonly _imageUrl: string;
    private _onVictory: Function;
    private _startTime: Date;

    constructor(dimensions: number, mountPoint: HTMLElement, imageSize: number, imageUrl: string) {
        if (!window.customElements.get('puzzle-element'))
            window.customElements.define('puzzle-element', Element);

        this._styleElement = document.createElement("style");
        this._mountPoint = mountPoint;
        this._imageUrl = imageUrl;
        this._dimensions = dimensions;

        document.body.appendChild(this._styleElement);
        let dimensionsOfSprite = imageSize / dimensions;
        let internalIdCounter = 0;
        for (let i = 0; i < dimensions; i++) {
            let gameStateArrayLevel: Element[] = [];
            for (let j = 0; j < dimensions; j++) {
                let el = document.createElement('puzzle-element') as Element;
                el.position = new ElementPosition(i * dimensionsOfSprite, j * dimensionsOfSprite, i, j);
                el.internalID = internalIdCounter;
                internalIdCounter++;
                if (el instanceof Element) {
                    gameStateArrayLevel.push(el);
                }
                el.className = `el${j}-${i}`;
                el.addEventListener('click', () => {
                    if (this._puzzleState != PuzzleState.Started) return;
                    if (this.CanSwapWithCurrentlyEmpty(el.position)) {
                        this.SwapWithCurrentlyEmpty(el.position);
                        this.CheckIfWon();
                    }
                });
                this.AppendToStyle(Puzzle.CreateElementCssString(i, j, dimensionsOfSprite, imageUrl));
                if (internalIdCounter >= dimensions ** 2) {
                    this._currentlyEmptyPosition = new ElementPosition(i * dimensionsOfSprite, j * dimensionsOfSprite, i, j);
                    this._missingElement = el;
                    continue;
                }
                this.AppendToMountPoint(el);
            }
            this._gameTable.push(gameStateArrayLevel);
        }
    }

    private static CreateElementCssString(i: number, j: number, dimensionsOfSprite: number, imageUrl: string): string {
        return `
                .el${j}-${i} {
                    position: absolute;
                    width: ${dimensionsOfSprite}px;
                    height: ${dimensionsOfSprite}px;
                    background: url(${imageUrl}) -${j * dimensionsOfSprite}px -${i * dimensionsOfSprite}px;
                }`;
    }

    private AppendToStyle(css: string): void {
        this._styleElement.innerHTML += css;
    }

    private AppendToMountPoint(htmlElement: HTMLElement): void {
        this._mountPoint.append(htmlElement);
    }

    public async Shuffle(numberOfTimes: number): Promise<void> {
        for (let i = 0; i < numberOfTimes; i++) {
            await new Promise<void>((resolve) => {
                let position = this.GetPossiblePositions().GetRandomOption();
                let target = this._gameTable[position.x][position.y];
                let supportPosition = target.position;
                target.position = this._currentlyEmptyPosition;
                this._gameTable[position.x][position.y] = this._gameTable[this._currentlyEmptyPosition.x][this._currentlyEmptyPosition.y];
                this._gameTable[this._currentlyEmptyPosition.x][this._currentlyEmptyPosition.y] = target;
                this._currentlyEmptyPosition = supportPosition;
                setTimeout(() => resolve(), 10);
            });
        }
        this._puzzleState = PuzzleState.Started;
        this._startTime = new Date();
    }

    private SwapWithCurrentlyEmpty(position: ElementPosition) {
        if (!this.CanSwapWithCurrentlyEmpty(position)) throw new Error("Can't be swapped with empty");
        let target = this._gameTable[position.x][position.y];
        let supportPosition = target.position;
        target.position = this._currentlyEmptyPosition;
        this._gameTable[position.x][position.y] = this._gameTable[this._currentlyEmptyPosition.x][this._currentlyEmptyPosition.y];
        this._gameTable[this._currentlyEmptyPosition.x][this._currentlyEmptyPosition.y] = target;
        this._currentlyEmptyPosition = supportPosition;
    }

    private CanSwapWithCurrentlyEmpty(position: ElementPosition): boolean {
        return (this._currentlyEmptyPosition.x - 1 == position.x && this._currentlyEmptyPosition.y == position.y) ||
            (this._currentlyEmptyPosition.x + 1 == position.x && this._currentlyEmptyPosition.y == position.y) ||
            (this._currentlyEmptyPosition.y - 1 == position.y && this._currentlyEmptyPosition.x == position.x) ||
            (this._currentlyEmptyPosition.y + 1 == position.y && this._currentlyEmptyPosition.x == position.x);
    }

    private GetPossiblePositions(): PossibleOptions<XYPosition> {
        let possibleOptions = new PossibleOptions<XYPosition>();
        if (this._currentlyEmptyPosition.x + 1 < this._dimensions) {
            possibleOptions.AddOption(new XYPosition(this._currentlyEmptyPosition.x + 1, this._currentlyEmptyPosition.y));
        }
        if (this._currentlyEmptyPosition.x - 1 >= 0) {
            possibleOptions.AddOption(new XYPosition(this._currentlyEmptyPosition.x - 1, this._currentlyEmptyPosition.y));
        }
        if (this._currentlyEmptyPosition.y + 1 < this._dimensions) {
            possibleOptions.AddOption(new XYPosition(this._currentlyEmptyPosition.x, this._currentlyEmptyPosition.y + 1));
        }
        if (this._currentlyEmptyPosition.y - 1 >= 0) {
            possibleOptions.AddOption(new XYPosition(this._currentlyEmptyPosition.x, this._currentlyEmptyPosition.y - 1));
        }
        return possibleOptions;
    }

    private CheckIfWon() {
        let iterationArray = Array.from({length: this._dimensions ** 2 - 1}, (v, i) => i) as number[];
        if (iterationArray.every((value: number) => value == this._gameTable[Math.floor(value / this._dimensions)][value % this._dimensions].internalID)) {
            this._puzzleState = PuzzleState.Solved;
            this._onVictory(Date.now() - this._startTime.valueOf());
            this.AppendToMountPoint(this._missingElement);
        }
    }

    public OnVictory(fn: Function) {
        this._onVictory = fn;
    }

    get startTime(): Date {
        return this._startTime;
    }
}

class PossibleOptions<T> {
    private _optionsArray: T[] = [];

    // noinspection JSUnusedGlobalSymbols
    get options(): T[] {
        return this._optionsArray;
    }

    constructor() {

    }

    public static FromArray<T>(...options: T[]) {
        let possibleOptions = new PossibleOptions<T>();
        possibleOptions._optionsArray = options;
    }

    public AddOption(option: T) {
        this._optionsArray.push(option);
    }

    public GetRandomOption(): T {
        if (this._optionsArray.length < 1) throw new Error("No options to choose from");
        let index = Math.floor(Math.random() * this._optionsArray.length);
        return this._optionsArray[index];
    }

}

export enum PuzzleState {
    Initialized,
    Started,
    Solved,
}


