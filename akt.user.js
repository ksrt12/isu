// ==UserScript==
// @name        АКТЫ
// @version     3.8
// @date        2020-09-04
// @author      kazakovstepan
// @namespace   ITMO University
// @description Генерирует неотсорированный акт
// @homepage    https://vk.com/kazakovstepan
// @icon        https://isu.ifmo.ru/i/libraries/frontend/misc/favicon.ico
// @updateURL   https://ksrt12.github.io/isu/akt.user.js
// @downloadURL https://ksrt12.github.io/isu/akt.user.js
// @match       https://abit.itmo.ru/order/*
// @match       https://isu.ifmo.ru/pls/apex/f?p=2175:9:*
// @run-at      document-end
// @grant       none
// ==/UserScript==


const HREF = document.location.href;
var json_raw, json_raw_name;

window.addEventListener("load", function() {
	if (HREF.includes("abit")) {
		let prikaz = document.querySelector("body > div.main.page > section.static-page-rule > div > h1");
		prikaz.after(make_export(prikaz));
	} else if (HREF.includes("isu")) {
		make_export_isu()
	}
})

function make_button(name) {
	let a = document.createElement("a");
	a.type = "button";
	a.className = "btn btn-labeled btn-xs btn-margined";
	a.style.marginTop = "5px";
	if (HREF.includes("abit")) {
		a.style.marginRight = "5px";
	}
	a.style.marginBottom = "5px";
	if (name) {
		a.appendChild(make_text(name));
	}
	return a;
}

function checked_1000() {
	return (document.querySelector("#report_list_length > label > select").selectedIndex === 6);
}

function make_text(str) {
	return document.createTextNode(str);
}

function make_export_isu() {
	let result, json_data, delo_table, c = 0;
	let isu_rep_num = document.querySelector("#report_list_paginate > ul");
	let win = document.querySelector("#list > div > div.grid-container > div > div > div");
	//let source = document.createElement("textarea"); source.type = "text";
	let source = document.createElement("input"); source.type = "file"; source.style.marginBottom = "5px";
	let load = make_button("LOAD");
	let run = make_button("RUN");
	if (source.type === "file") {
		source.onchange = function() {
			try {
				readFile(source);
			} catch(err) {
				console.log(err);
			}
		}
	}
	load.onclick = function() {
		result = run_search(source);
		json_data = result[1];
		delo_table = result[0];
		if (json_data) {
			if (checked_1000()) {
				G2.notify("JSON загружен!");
				source.style.display = "none";
				load.style.display = "none";
				source.after(run);
			} else {
				G2.notify("Выбирите 1000 дел!", null, false, true);
			}
		}
	};
	run.onclick = function() {
		delo_table = add_list(delo_table, json_data);
		c++;
		create_report(delo_table, c, run);
	};
	win.after(source);
	source.after(load);
}

function create_report(table, count, elem) {
	let old_akt = document.getElementById("akt_xls");
	if (old_akt) {old_akt.remove()}
	if (count > 0) {
		G2.notify("Данные добавлены: " + count);
		let report = make_dlink(json_raw_name + '-' + count, [table, null], "xls")
		elem.after(report);
	}
}

function run_search(input) {
	let to_json = (input.type === "file") ? json_raw : input.value;
	let json_data, delo_table = make_base_table('delo_table');
	try {
		json_data = JSON.parse(to_json);
	} catch(err) {
		G2.notify("Некорректный JSON!", 'Ошибка', true);
		json_data = false;
	}
	return [delo_table, json_data];
}

function add_list(delo_table, json_data) {
	let isu_tbt = document.querySelectorAll("#report_list > tbody > tr");
	let tbody = delo_table.querySelector("tbody");
	for (let i of isu_tbt) {
		let fio = i.querySelector("td:nth-child(2)");
		if (json_data[fio.innerText]) {
			tbody.appendChild(table_row([
				json_data[fio.innerText].prikaz,
				json_data[fio.innerText].usl,
				get_id(fio),
				json_data[fio.innerText].fac,
				i.querySelector("td:nth-child(1)").innerText,
				fio.innerText
			]));
		}
	}
	return delo_table;
}

function get_id(elem) {
	let a = document.createElement("a");
	let pid = elem.querySelector("span:nth-child(2)").getAttribute("pid");
	a.href = 'https://isu.ifmo.ru/pls/apex/f?p=2175:SU_OFFICE:101431868275662:GET:NO::ST_ID:' + pid;
	a.appendChild(make_text(pid));
	return a;
}

function readFile(input) {
	let file = input.files[0];
	let reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function() {
		json_raw = reader.result;
		json_raw_name = file.name.replace(/.json/i, '')
	}
}

function make_export(prikaz) {
	let name = prikaz.innerText.substr(9);
	let hdr = document.querySelector("body > div.main.page > section.static-page-rule > div > table > tbody > tr.hdr");
	let result = make_akt_table(name.substring(0, 4), hdr);
	let xls = make_dlink(name, result, "xls");
	let json = make_dlink(name, result, "json");
	let div = document.createElement("div");
	div.style.display = "flex";
	div.appendChild(xls);
	div.appendChild(json);
	return div;
}

function make_dlink(name, source, forma) {
	let a = make_button();
	let span = document.createElement("span");
	span.className = "btn-label icon fa fa-file-excel-o";
	a.href = (forma === "xls" ) ? akt_to_xls(source[0], name) : akt_to_json(source[1]);
	a.id = "akt_" + forma;
	a.download = (name + '.' + forma).replace(/ /g, '_');
	a.appendChild(span);
	a.appendChild(make_text("Акт." + forma));
	return a;
}

function akt_to_xls(table, name) {
	const uri = 'data:application/vnd.ms-excel;base64,',
		template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>';
	function base64(s) { return window.btoa(unescape(encodeURIComponent(s))) }
	function format(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; })}
	let ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
	return uri + base64(format(template, ctx));
}

function akt_to_json(json_data) {
	return URL.createObjectURL(new Blob([JSON.stringify(json_data)], {type: 'text/plain'}));
}

function add_entry(x, tgt) {
	if (typeof(x) == 'string') {
		tgt.appendChild(make_text(x));
	} else if (typeof(x) == 'number') {
		tgt.appendChild(make_text('' + x));
	} else if (Array.isArray(x)) {
		for (let i in x) {
			add_entry(x[i], tgt);
		}
	} else {
		tgt.appendChild(x);
	}
}

function table_row(l) {
	let tr = document.createElement('tr');
	for (let i in l) {
		let g = document.createElement('td');
		add_entry(l[i], g);
		tr.appendChild(g);
	}
	return tr;
}

function make_akt_table(prikaz_n, hdr) {
	let akt_json = {};
	let akt_table = make_base_table('akt_table');
	let tbody = akt_table.querySelector("tbody");
	let length = hdr.querySelectorAll("td").length;
	let bvi_gos = (length === 0) ? "ГЛ" : (length >= 3) ? (hdr.querySelector("td:nth-child(3)").innerText.includes("Олимпиа") === true) ? "БВИ" : false : false;
	for (let stream of document.querySelectorAll("body > div.main.page > section.static-page-rule > div > h3")) {
		let str = stream.innerText;
		for (let i of stream.nextElementSibling.querySelectorAll("tbody > tr")) {
			if (i.className !== "hdr") {
				let usl = bvi_gos ? bvi_gos : i.cells[1].innerText;
				let fac = getFAC(str.substr(0, 8), str);
				let fio = i.cells[0].innerText;
				let local_obj = {};
				local_obj.fac = fac;
				local_obj.usl = usl;
				local_obj.prikaz = prikaz_n;
				akt_json[fio] = local_obj;
				tbody.appendChild(table_row([prikaz_n, usl, fio, fac]));
			}
		}
	}
	return [akt_table, akt_json];
}

function make_base_table(table_id) {
	let base_table = document.createElement('table');
	base_table.id = table_id;
	base_table.setAttribute('rules', 'all');
	base_table.setAttribute('border', 'all');
	base_table.createTBody();
	return base_table;
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
				fac = "ФТФ|ФЛФО";
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