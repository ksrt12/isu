// ==UserScript==
// @name         Del exam
// @date         2020-08-28
// @version      1.1
// @author       kazakovstepan
// @namespace    ITMO University
// @description  Make расписки great again!
// @homepage     https://vk.com/kazakovstepan
// @icon         https://isu.ifmo.ru/i/libraries/frontend/misc/favicon.ico
// @updateURL    https://ksrt12.github.io/isu/de.user.js
// @downloadURL  https://ksrt12.github.io/isu/de.user.js
// @match        https://abit.itmo.ru/ums/system/print/bachelor/*
// @grant        none
// @run-at       document-start
// ==/UserScript==


if (document.querySelector("body > table > tbody > tr:nth-child(2) > td").innerText.includes("Расписка о получении")) {
for (var i = 19; i > 10; i--) {
 document.querySelector("tbody > tr:nth-child(" + i + ")").remove();
}
document.querySelector("tbody > tr:nth-child(9) > td").innerText = '"28" августа 2020 г.';
document.querySelector("tbody > tr:nth-child(7)").remove();
var a=document.querySelector("body > table > tbody > tr:nth-child(2)").innerText;
document.querySelector("body > table > tbody > tr:nth-child(2) > td").innerText = a.replace("Расписка о получении документов", "Опись личного дела");
}