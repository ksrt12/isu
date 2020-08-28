// ==UserScript==
// @name         Del exam
// @date         2020-08-29
// @version      1.2
// @author       kazakovstepan
// @namespace    ITMO University
// @description  Make описи great again!
// @homepage     https://vk.com/kazakovstepan
// @icon         https://isu.ifmo.ru/i/libraries/frontend/misc/favicon.ico
// @updateURL    https://ksrt12.github.io/isu/de.user.js
// @downloadURL  https://ksrt12.github.io/isu/de.user.js
// @match        https://abit.itmo.ru/ums/system/print/bachelor/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

var td = document.querySelector("tbody > tr:nth-child(2) > td");
if (td.innerText.includes("Расписка о получении")) {
	for (let i = 19; i > 10; i--) {
		document.querySelector("tbody > tr:nth-child(" + i + ")").remove();
	}
	document.querySelector("tbody > tr:nth-child(9) > td").innerText = "29 августа 2020 г.";
	document.querySelector("tbody > tr:nth-child(7)").remove();
	td.innerText = td.replace("Расписка о получении документов", "Опись личного дела");
}