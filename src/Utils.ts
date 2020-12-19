export function formatTime(time: number) {
    let d = new Date(time);
    let hours = Math.floor(time / 3600000) > 0 ? d.getHours().toString() : "0";
    let minutes: string = d.getMinutes().toString();
    let seconds = d.getSeconds().toString();
    let milliseconds = d.getMilliseconds().toString();
    return normalizeLength(hours, 2) + "c" + normalizeLength(minutes, 2) + "c" + normalizeLength(seconds, 2) + "d" + normalizeLength(milliseconds, 3);
}

function normalizeLength(str: string, length: number) {
    while (str.length < length) {
        str = "0" + str;
    }
    return str;
}
