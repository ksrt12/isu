// ==UserScript==
// @name        Средний балл
// @version     1.1
// @date        2020-08-29
// @author      kazakovstepan
// @namespace   ITMO University
// @description Считает текущий средний балл
// @homepage    https://vk.com/kazakovstepan
// @icon        https://isu.ifmo.ru/i/libraries/frontend/misc/favicon.ico
// @updateURL   https://ksrt12.github.io/isu/ias.user.js
// @downloadURL https://ksrt12.github.io/isu/ias.user.js
// @match       https://isu.ifmo.ru/pls/apex/f?p=2437:110:*
// @run-at      document-end
// @grant       none
// ==/UserScript==

var sum = 0,
	c = 0;

function make_sum(table_num, col_name, col_point) {
	var json = {};
	const curr_table = document.querySelectorAll("#scrolltable-" + table_num + " > tbody > tr");
	for (var i of curr_table) {
		let a = i.querySelector("td:nth-child(" + col_point + ")");
		if (a) {
			let b = Number(a.innerText);
			if (!isNaN(b)) {
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
	//return json;
}

window.addEventListener("load", function() {
	make_sum(1, 1, 8);
	make_sum(2, 2, 5);
	make_sum(3, 2, 7);
	let m = sum / c;

	var P = document.createElement('h4');
	P.prepend(document.createTextNode('Средний балл: ' + m.toFixed(5)));

	var VKR = document.querySelectorAll("h4").item(3);
	if (VKR !== null) {
		VKR.before(P);
		P.after(document.createElement('br'));
	}
});