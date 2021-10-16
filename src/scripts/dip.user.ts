export { };
// ==UserScript==
// @name        Средний балл (приложение к диплому)
// @version     1.1
// @date        2021-08-02
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

let rating: { five: number; four: number; three: number; };

function Info(str: string) {
    // @ts-ignore
    G2.notify(str);
}

function makeSum(table: number, col: number) {
    let a = document.querySelectorAll("table").item(table).querySelectorAll("tbody > tr:not(.info)");
    for (let i of a) {
        let b = i.querySelector<HTMLTableElement>(`td:nth-child(${col})`)!.innerText;
        if (b.includes('отлично')) {
            rating.five++;
        } else if (b.includes('хорошо')) {
            rating.four++;
        } else if (b.includes('удовлетворительно')) {
            rating.three++;
        }
    }
}

function get_sum() {
    makeSum(2, 3);
    makeSum(3, 2);
    const sum = rating.five * 5 + rating.four * 4 + rating.three * 3;
    const c = rating.five + rating.four + rating.three;
    return 'Средний балл: ' + (sum / c).toFixed(4);
}

function updateSum() {
    rating = { five: 0, four: 0, three: 0 };
    const str = get_sum();
    Info(str);
    document.querySelector("#ias")!.textContent = `${str} (5: ${rating.five}, 4: ${rating.four}, 3: ${rating.three})`;
}

window.addEventListener("load", () => {
    let P = document.createElement('h4');
    P.id = "ias";
    P.style.cursor = "pointer";
    P.onclick = () => updateSum();

    let VKR = document.querySelector(".note.note-info");
    if (VKR && !document.querySelector("#ias")) {
        VKR.after(P);
        P.after(document.createElement('br'));
        updateSum();
    }
});