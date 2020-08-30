// ==UserScript==
// @name        ПсевдоАКТы
// @version     2.0
// @date        2020-08-30
// @author      kazakovstepan
// @namespace   ITMO University
// @description Генерирует неотсорированный акт
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
	var dbut = make_dlink(prikaz.innerText.substr(9), "Акт");
	prikaz.after(dbut);
};

function make_dlink(name, str) {
	var a = document.createElement("a");
	a.style.cursor = "pointer";
	a.text = str;
	a.download = (name + '.xls').replace(/ /g, '_');;
	a.href = akt_xls(make_akt_table(), name);
	return a;
}

function akt_xls(table, name) {
	const uri = 'data:application/vnd.ms-excel;base64,',
		template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>';
	function base64(s) { return window.btoa(unescape(encodeURIComponent(s))) }
	function format(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; })}
	let ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
	return uri + base64(format(template, ctx));
}

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
	for (let stream of document.querySelectorAll("body > div.main.page > section.static-page-rule > div > h3")) {
		let str = stream.innerText;
		for (let i of stream.nextElementSibling.querySelectorAll("tbody > tr")) {
			let text = i.cells[1].innerText;
			if ((text === 'ВИ') || (text === "ЕГЭ")) {
				tbody.appendChild(table_row([
					i.cells[0].innerText,
					getFAC(str.substr(0, 8), str)
				], false));
			}
		}
	}
	return akt_table;
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
			fac = "ФПИиКТ";
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