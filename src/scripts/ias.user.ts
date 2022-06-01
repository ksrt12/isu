export { };
// ==UserScript==
// @name        Средний балл (по зачётке)
// @version     2.1
// @author      kazakovstepan
// @namespace   ITMO University
// @description Считает текущий средний балл
// @homepage    https://vk.com/kazakovstepan
// @icon        https://isu.ifmo.ru/i/libraries/frontend/logo/isu.png
// @updateURL   https://isu.ksrt12.ru/scripts/ias.user.js
// @downloadURL https://isu.ksrt12.ru/scripts/ias.user.js
// @match       https://isu.ifmo.ru/pls/apex/f?p=2437:110:*
// @run-at      document-end
// @grant       none
// ==/UserScript==

let rating: IRaiting, table_num: number;

interface IRaiting {
    [key: number]: number;
}

interface ISubjects {
    [subj: string]: {
        mark: number;
        count: number;
    };
}

function makeSum(tbody: HTMLTableSectionElement) {
    let json: ISubjects = {};
    let col_name = 0, col_point = 0, col_sem = 100;
    const curr_table = Array.from(tbody.querySelectorAll<HTMLTableRowElement>("tr:not(.header)"))
        .filter(tr => tr.style.backgroundColor === "" && tr.childElementCount > 5);

    head: for (const i of tbody.querySelectorAll("th")) {
        switch (i.innerText.toLowerCase()) {
            case "семестр":
                col_sem = i.cellIndex;
                break;
            case "дисциплина":
            case "вид практики":
                col_name = i.cellIndex;
                break;
            case "отметка":
            case "оценка":
                col_point = i.cellIndex;
                break head;
        }
    }

    for (const i of curr_table) {
        const b = Number(i.cells[col_point].innerText);
        const sem = (col_sem !== 100) ? " " + i.cells[col_sem].innerText : "";
        if (b > 2) {
            const subj = i.cells[col_name].innerText + sem;
            if (json.hasOwnProperty(subj)) {
                json[subj].mark += b;
                json[subj].count += 1;
            } else {
                json[subj] = {
                    mark: b,
                    count: 1
                };
            }
        }
    }

    for (const [subj, curr_subj] of Object.entries(json)) {
        if (curr_subj.count > 1) {
            json[subj].mark = Number((curr_subj.mark / curr_subj.count).toFixed(0));
            json[subj].count = 1;
        }
        countMarks(json[subj].mark);
    }
}

function countMarks(mark: number) {
    rating[mark] += 1;
}

function getDiploma() {
    let dip = 0;
    const diptext = (document.querySelectorAll("h4").item(table_num + 2).previousElementSibling!.previousElementSibling! as HTMLElement).innerText.toLowerCase();
    if (diptext.includes('отлично')) {
        dip = 5;
    } else if (diptext.includes('хорошо')) {
        dip = 4;
    } else if (diptext.includes('удовлетворительно')) {
        dip = 3;
    }
    if (dip) {
        countMarks(dip);
    }
}

function updateSum() {
    rating = { 5: 0, 4: 0, 3: 0 };
    let sum = 0, c = 0, marks = "";
    for (const tbody of document.querySelectorAll<HTMLTableSectionElement>(".table > tbody")) {
        makeSum(tbody);
    }
    getDiploma();
    for (const [mark, count] of Object.entries(rating)) {
        sum += Number(mark) * count;
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

    table_num = document.querySelectorAll("div.table-responsive").length;

    const VKR = document.querySelectorAll("h4").item(table_num);
    if (VKR && (document.querySelector("#ias") === null)) {
        VKR.before(P);
        P.after(document.createElement('br'));
        updateSum();
    }
});