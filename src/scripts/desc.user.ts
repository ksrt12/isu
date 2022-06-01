export { };
// ==UserScript==
// @name         Описи
// @version      2.1
// @author       kazakovstepan
// @namespace    ITMO University
// @description  Make описи great again!
// @homepage     https://vk.com/kazakovstepan
// @icon         https://isu.ifmo.ru/i/libraries/frontend/misc/favicon.ico
// @updateURL    https://isu.ksrt12.ru/scripts/de.user.js
// @downloadURL  https://isu.ksrt12.ru/scripts/de.user.js
// @match        https://abit.itmo.ru/ums/system/print/*/receipt/
// @grant        none
// @run-at       document-start
// ==/UserScript==

window.addEventListener("load", () => {
    let td = document.querySelector("tbody > tr:nth-child(2) > td") as HTMLTableElement;
    let ank = document.querySelector("tbody > tr:nth-child(5) > td") as HTMLTableElement;
    let photoOrig = document.querySelector("tbody > tr:nth-child(7)") as HTMLTableElement;
    const line = (document.querySelector(`[style='width: 100%; border-bottom: solid 1px; padding-top: 20px;']`)!.parentElement as HTMLTableRowElement).rowIndex + 1;
    const removePhoto = (elem: HTMLElement) => {
        if (elem.innerText.includes("Фотограф")) {
            elem.remove();
        }
    };
    td.innerText = td.innerText.replace("Расписка о получении документов", "Опись личного дела");
    if (td.innerText.includes("B2-")) {
        ank.innerText = ank.innerText.replace("Анкета", "Экзаменационный лист");
    }
    while (document.querySelector("tbody")!.childElementCount > line) {
        document.querySelector("tbody")!.lastElementChild!.remove();
    }
    document.querySelector("tbody")!.lastElementChild!.previousElementSibling!.querySelector("td")!.innerText = new Date().toLocaleString("ru", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    if (photoOrig.innerText.includes("Оригинал")) {
        removePhoto(photoOrig.nextElementSibling as HTMLElement);
    } else {
        removePhoto(photoOrig);
    }
});