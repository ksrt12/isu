export { };
// ==UserScript==
// @name        Средний балл (приложение к диплому)
// @version     1.2.2
// @date        2021-10-20
// @author      kazakovstepan
// @namespace   ITMO University
// @description Считает текущий средний балл по приложению
// @homepage    https://vk.com/kazakovstepan
// @icon        https://isu.ifmo.ru/i/libraries/frontend/misc/favicon.ico
// @updateURL   https://isu.ksrt12.ru/scripts/dip.user.js
// @downloadURL https://isu.ksrt12.ru/scripts/dip.user.js
// @match       https://isu.ifmo.ru/pls/apex/f?p=2437:97:*LIST_2:2,1
// @run-at      document-end
// @grant       none
// ==/UserScript==

let rating: { [key: number]: number; };

function makeSum(table: number, col: number) {
    for (const i of document.querySelectorAll("table").item(table).querySelectorAll("tbody > tr:not(.info)")) {
        const b = i.querySelector<HTMLTableCellElement>(`td:nth-child(${col})`)!.innerText;
        if (b.includes('отлично')) {
            rating[5] += 1;
        } else if (b.includes('хорошо')) {
            rating[4] += 1;
        } else if (b.includes('удовлетворительно')) {
            rating[3] += 1;
        }
    }
}

function updateSum() {
    rating = { 5: 0, 4: 0, 3: 0 };
    let sum = 0, c = 0, marks = "";
    makeSum(2, 3);
    makeSum(3, 2);
    for (const [mark, count] of Object.entries(rating)) {
        // @ts-ignore
        sum += mark * count;
        c += count;
        marks += `${mark}: ${count}, `;
    }
    const str = (c === 0) ? "Оценок нет" : "Средний балл: " + (sum / c).toFixed(4);
    // @ts-ignore
    G2.notify(str);
    document.querySelector("#ias")!.textContent = `${str} (${marks.slice(0, -2)})`;
}

window.addEventListener("load", () => {
    const P = document.createElement('h4');
    P.title = "Обновить";
    P.id = "ias";
    P.style.cursor = "pointer";
    P.onclick = () => updateSum();

    const VKR = document.querySelector(".note.note-info");
    if (VKR && !document.querySelector("#ias")) {
        VKR.after(P);
        P.after(document.createElement('br'));
        updateSum();
    }
});