// ==UserScript==
// @name        ПсевдоАКТы
// @version     1.0
// @date        2020-08-29
// @author      kazakovstepan
// @namespace   ITMO University
// @description Генерирует акт json
// @homepage    https://vk.com/kazakovstepan
// @icon        https://isu.ifmo.ru/i/libraries/frontend/misc/favicon.ico
// @updateURL   https://ksrt12.github.io/isu/akt.user.js
// @downloadURL https://ksrt12.github.io/isu/akt.user.js
// @match       https://abit.itmo.ru/order/*
// @run-at      document-end
// @grant       none
// ==/UserScript==

window.onload = function() {
	let prikaz = document.querySelector("body > div.main.page > section.static-page-rule > div > h1");
	let a = document.createElement("a");
	a.onclick = function() {
		Spoiler();
	};
	a.className = "link_spoiler";
	a.id = "linkSpoiler";
	a.style.cursor = "pointer";
	a.appendChild(document.createTextNode("Акт"));
	let b = document.createElement("div");
	b.id = "contentSpoiler";
	b.style = "display: none;";
	b.appendChild(make_akt_table());
	prikaz.after(b);
	prikaz.after(a);
};

function add_entry(x, tgt) {
	if (typeof(x) == 'string') {
		tgt.appendChild(document.createTextNode(x));
	} else if (typeof(x) == 'number') {
		tgt.appendChild(document.createTextNode('' + x));
	} else if (Array.isArray(x)) {
		for (let i in x) {
			add_entry(x[i], tgt);
		}
	} else {
		tgt.appendChild(x);
	}
}

function table_row(l, p) {
	let tr = document.createElement('tr');
	for (let i in l) {
		let g = document.createElement('td');
		if (p) {
			g.className = "hdr";
		}
		add_entry(l[i], g);
		tr.appendChild(g);
	}
	return tr;
}

function make_akt_table() {
	let akt_table = document.createElement('table');
	akt_table.id = 'akt_table';
	akt_table.setAttribute('rules', 'all');
	akt_table.setAttribute('border', 'all');
	let tbody = document.createElement('tbody');
	akt_table.appendChild(tbody);
	tbody.appendChild(table_row([
		'ФИО',
		'Факультет'
	], true));
	let json = getTELO();
	for (let pip of Object.keys(json)) {
		tbody.appendChild(table_row([
			pip,
			json[pip]
		], false));
	}
	return akt_table;
}

function Spoiler() {
	var ele = document.getElementById("contentSpoiler");
	var text = document.getElementById("linkSpoiler");
	if (ele.style.display == "block") {
		ele.style.display = "none";
		text.innerHTML = "Акт";
	} else {
		ele.style.display = "block";
		text.innerHTML = "Скрыть";
	}
}

function getFAC(str, full) {
	var fac;
	switch (str) {
		case '01.03.02':
		case '09.03.02':
			fac = "ФИТиП";
			break;
		case "09.03.01":
		case "09.03.04":
		case "44.03.04":
			fac = "ПИиКТ";
			break;
		case "09.03.03":
		case "11.03.02":
		case "45.03.04":
			fac = "ФИКТ";
			break;
		case "10.03.01":
		case "11.03.03":
		case "23.03.03":
			fac = "ФБИТ";
			break;
		case "12.03.01":
		case "13.03.02":
		case "15.03.04":
		case "15.03.06":
		case "24.03.02":
		case "27.03.04":
			fac = "ФСУиР";
			break;
		case "12.03.03":
			fac = "ФФиОИ";
			break;
		case "12.03.02":
		case "12.03.04":
		case "12.05.01":
		case "18.03.02":
			fac = "ФПО";
			break;
		case "14.03.01":
		case "16.03.03":
			fac = "ФНТЭ";
			break;
		case "12.03.05":
			fac = "ФЛФО";
			break;
		case "16.03.01":
			if (full.includes("азерна")) {
				fac = "ФЛФО";
			} else {
				fac = "ФТФ";
			}
			break;
		case "19.03.01":
			fac = "ФБТ";
			break;
		case "27.03.05":
		case "38.03.05":
			fac = "ФТМИ";
			break;
	}
	return fac;
}

function getTELO() {
	var table = {};
	for (let stream of document.querySelectorAll("body > div.main.page > section.static-page-rule > div > h3")) {
		let str = stream.innerText;
		let fac = getFAC(str.substr(0, 8), str);
		for (let i of stream.nextElementSibling.querySelectorAll("tbody > tr")) {
			let text = i.cells[1].innerText;
			if ((text === 'ВИ') || (text === "ЕГЭ")) {
				table[i.cells[0].innerText] = fac;
			}
		}
	}


	return table;
}