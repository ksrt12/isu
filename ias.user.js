// ==UserScript==
// @name        Средний балл
// @version     1.4.1
// @date        2021-01-27
// @author      kazakovstepan
// @namespace   ITMO University
// @description Считает текущий средний балл
// @homepage    https://vk.com/kazakovstepan
// @icon        https://isu.ifmo.ru/i/libraries/frontend/misc/favicon.ico
// @updateURL   https://snegiry.art/isu/ias.user.js
// @downloadURL https://snegiry.art/isu/ias.user.js
// @match       https://isu.ifmo.ru/pls/apex/f?p=2437:110:*
// @run-at      document-end
// @grant       none
// ==/UserScript==

var sum = 0,
    c = 0;

function make_sum(table_num, col_name, col_point) {
    let json = {};
    const curr_table = document.querySelectorAll("#scrolltable-" + table_num + " > tbody > tr");
    for (let i of curr_table) {
        let a = i.querySelector("td:nth-child(" + col_point + ")");
        if (a) {
            let b = Number(a.innerText);
            if (!isNaN(b) && (b !== 0) && (b !== 2)) {
                let subj = i.querySelector("td:nth-child(" + col_name + ")").innerText;
                let curr_subj = json[subj];
                if (curr_subj) {
                    curr_subj.mark += b;
                    curr_subj.count += 1;
                } else {
                    json[subj] = {};
                    json[subj].mark = b;
                    json[subj].count = 1;
                }
            }
        }
    }

    for (let subj of Object.keys(json)) {
        let curr_subj = json[subj];
        if (curr_subj.count > 1) {
            json[subj].mark = Number((curr_subj.mark / curr_subj.count).toFixed(0));
            json[subj].count = 1;
        }
        sum += json[subj].mark;
        c++;
    }
}

function get_sum() {
    make_sum(1, 1, 8);
    make_sum(2, 2, 5);
    make_sum(3, 2, 8);
    return 'Средний балл: ' + (sum / c).toFixed(4);
}

function update_sum() {
    sum = 0;
    c = 0;
    let str = get_sum();
    G2.notify(str);
    document.querySelector("#ias").textContent = str;
}

window.addEventListener("load", function() {

    let P = document.createElement('h4');
    P.id = "ias";
    P.style.cursor = "pointer";
    P.onclick = () => { update_sum(); };

    let VKR = document.querySelectorAll("h4").item(3);
    if (VKR && (document.querySelector("#ias") === null)) {
        VKR.before(P);
        P.after(document.createElement('br'));
        update_sum();
    }
});