import Puzzle from './Puzzle.js';
import CookieStore from './CookieStore.js';
import Modal from './Modal.js';
import {formatTime} from './Utils.js';
import ImageTimer from './ImageTimer.js';

const IMAGE_URL = "./img/image{}.jpg";
const BEST_RESULTS_REGISTER = "best_results";
const NUMBER_OF_LAST_IMAGE = 6;
const IMAGE_WIDTH = 132;
const MODES = [3, 4, 5, 6];
const PHOTO_SOURCES = [
    "<span>Photo by <a href=\"https://unsplash.com/@majesticlukas?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Lukas Medvedevas</a> on <a href=\"https://unsplash.com/t/health?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Unsplash</a></span>",
    "<span>Photo by <a href=\"https://unsplash.com/@kendra_allen?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Kendra Allen</a> on <a href=\"https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Unsplash</a></span>",
    "<span>Photo by <a href=\"https://unsplash.com/@franzharvin?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Franz Harvin Aceituna</a> on <a href=\"https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Unsplash</a></span>",
    "<span>Photo by <a href=\"https://unsplash.com/@laviebohemo?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Mary Oloumi</a> on <a href=\"https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Unsplash</a></span>",
    "<span>Photo by <a href=\"https://unsplash.com/@wolfgang_hasselmann?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Wolfgang Hasselmann</a> on <a href=\"https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Unsplash</a></span>",
    "<span>Photo by <a href=\"https://unsplash.com/@peejayvisual?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Pranav Kumar Jain</a> on <a href=\"https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Unsplash</a></span>",
    "<span>Photo by <a href=\"https://unsplash.com/@majesticlukas?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Lukas Medvedevas</a> on <a href=\"https://unsplash.com/t/health?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText\">Unsplash</a></span>",
];
let timer;

let currentImage = 6;

(function () {
    const nextImageButton = document.getElementById("nextImage") as HTMLButtonElement;
    const previousImageButton = document.getElementById("prevImage") as HTMLButtonElement;
    const sliderDiv = document.getElementById("slider");
    const imageSourceP = document.getElementById("photoSource");
    imageSourceP.innerHTML = PHOTO_SOURCES[currentImage];

    // TODO: Refactor - similar functions
    nextImageButton.addEventListener('click', async () => {
        nextImageButton.disabled = true;
        previousImageButton.disabled = true;
        if (currentImage == NUMBER_OF_LAST_IMAGE) {
            currentImage = 0;
            await scrollToImage(sliderDiv, 0, 1);
        }
        currentImage++;
        await scrollToImage(sliderDiv, currentImage * IMAGE_WIDTH, IMAGE_WIDTH);
        nextImageButton.disabled = false;
        previousImageButton.disabled = false;
        imageSourceP.innerHTML = PHOTO_SOURCES[currentImage];
    });

    previousImageButton.addEventListener('click', async () => {
        previousImageButton.disabled = true;
        nextImageButton.disabled = true;
        if (currentImage == 0) {
            currentImage = NUMBER_OF_LAST_IMAGE;
            await scrollToImage(sliderDiv, NUMBER_OF_LAST_IMAGE * IMAGE_WIDTH, 1);
        }
        currentImage--;
        await scrollToImage(sliderDiv, currentImage * IMAGE_WIDTH, IMAGE_WIDTH);
        previousImageButton.disabled = false;
        nextImageButton.disabled = false;
        imageSourceP.innerHTML = PHOTO_SOURCES[currentImage];
    });

    if (!!new URLSearchParams(window.location.search).get("custom")) {
        MODES.push(Number(new URLSearchParams(window.location.search).get("custom")));
    }
    for (const mode of MODES) {
        let modeButton = document.createElement('button');
        let bestsResultsButton = document.createElement('button');
        modeButton.addEventListener('click', async () => await startGame(mode, currentImage));
        bestsResultsButton.addEventListener('click', () => changeLeaderboard(mode));
        modeButton.innerText = `Mode ${mode}x${mode}`;
        bestsResultsButton.innerText = `Mode ${mode}x${mode}`;
        document.getElementById("buttonsGameMode").appendChild(modeButton);
        document.getElementById("buttonsBestResults").appendChild(bestsResultsButton);
    }
    changeLeaderboard(MODES[0]);

})();

async function startGame(mode: number, imageNumber: number) {
    clearInterval(timer);
    const timerDiv = document.getElementById("timer");
    timerDiv.innerHTML = '';
    let imageTimer = new ImageTimer(timerDiv, 0);
    changeLeaderboard(mode);
    let imageUrl = IMAGE_URL.replace(/{}/, imageNumber.toString());
    let gameArea = document.getElementById("game-area");
    gameArea.innerHTML = "";
    const game = new Puzzle(mode, gameArea, 512, imageUrl);
    await game.Shuffle(!new URLSearchParams(window.location.search).get("cheat") ? 70 * mode : 1);
    timer = setInterval(() => {
        imageTimer.ChangeTime(Date.now() - game.startTime.valueOf());
    }, 75);
    game.OnVictory(duration => {
        clearInterval(timer);
        const finalPuzzleSolvingTime = formatTime(duration).replace(/c/g, ":").replace("d", ".");
        imageTimer.ChangeTime(duration);
        let finalModal = Modal.Create("You won!", "Congratulations!\nYour time: " + finalPuzzleSolvingTime, "white");
        finalModal.Show();
        let bestResults = CookieStore.Read(BEST_RESULTS_REGISTER) as bestResults;
        if (!bestResults[mode.toString()]) {
            bestResults[mode.toString()] = [];
        }
        // @ts-ignore
        let playerName = document.getElementById("playerNameInput").value as string;
        if (playerName.length > 10) {
            playerName = playerName.slice(0, 10) + "...";
        }
        bestResults[mode.toString()].push({
            name: !playerName ? "No Name" : playerName,
            time: duration
        });
        bestResults[mode.toString()].sort((a, b) => (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0));
        bestResults[mode.toString()] = bestResults[mode.toString()].slice(0, Math.min(bestResults[mode.toString()].length, 10));
        CookieStore.Write(BEST_RESULTS_REGISTER, bestResults);
        changeLeaderboard(mode);
    });
}

function changeLeaderboard(mode: number) {
    const leaderBoard = document.getElementById('bestResultsList');
    document.getElementById('bestResultsListMode').innerText = `${mode}x${mode}`;
    leaderBoard.innerHTML = "";
    try {
        let bestResults = CookieStore.Read(BEST_RESULTS_REGISTER) as bestResults;
        if (bestResults == undefined || bestResults[mode.toString()] == undefined || bestResults[mode.toString()].length < 1) {
            let obj = bestResults;
            if (bestResults == undefined) {
                obj = {};
            }
            CookieStore.Write(BEST_RESULTS_REGISTER, obj);
            // noinspection ExceptionCaughtLocallyJS
            throw new Error();
        }
        let currentlySelectedBestResultsArray = bestResults[mode.toString()];
        for (const bestResult of currentlySelectedBestResultsArray) {
            let leaderBoardListElement = document.createElement("li");
            leaderBoardListElement.innerText = `${bestResult.name} - ${formatTime(bestResult.time).replace(/c/g, ":").replace("d", ".")}`;
            leaderBoard.appendChild(leaderBoardListElement);
        }
    } catch {
        let errorInfoElement = document.createElement("li");
        errorInfoElement.innerText = "It seems that the list is empty";
        leaderBoard.appendChild(errorInfoElement);
    }
}

async function scrollToImage(scrollElement: HTMLElement, desiredScrollPosition: number, numberOfFrames: number) {
    return new Promise((resolve) => {
        if (numberOfFrames < 1) throw new Error("Argument numberOfFrames out of range");
        let currentScrollPosition = scrollElement.scrollLeft;
        let difference = desiredScrollPosition - currentScrollPosition;
        let stepValue = difference / numberOfFrames;
        let currentFrame = 1;

        function doScroll() {
            scrollElement.scrollTo(currentScrollPosition + stepValue * currentFrame, 0);
            currentFrame++;
            if (currentFrame <= numberOfFrames) window.requestAnimationFrame(doScroll); else resolve();
        }

        doScroll();
    });

}

type bestResults = {
    [mode: string]: {
        name: string,
        time: number,
    }[]
}
