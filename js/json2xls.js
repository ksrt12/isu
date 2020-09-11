/* json2xls.js
	(c) 2020 kazakovstepan
*/

window.addEventListener("DOMContentLoaded", main)
let out2 = {};
let first, second;

function main() {
	first = document.querySelector("#first");
	second = document.querySelector("#second");	
}

function load_files() {
	check_old();
	try {
		readFiles(source);
		document.querySelector("#merge").style.display = "";
	} catch(err) {
		console.log(err);
	}
}

function check_old() {
	for (let f of ["akt_json", "akt_xls"]) {
		let old = document.querySelector("#" + f);
		if (old) {
			old.remove();
		}
	}
}

function readFiles(input, retout) {
	let out = {};
	function callback(result) { 
		out2 = Object.assign(out, JSON.parse(result));

	};
	for (let file of input.files) {
		Promise.resolve(readToText(file)).then(callback);
	}
}

async function readToText(file) {
    const temporaryFileReader = new FileReader();
    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsText(file);
    });
};

function mergeJSONs() {
	if (out2) {
		let json = make_dlink("JSON_merged", [null, out2], "json");
		first.appendChild(json);
		second.style.display = "";
	}
}

function do_json2xls() {
	let akt_table = make_base_table('akt_table');
	let tbody = akt_table.querySelector("tbody");
	
	for (let key of Object.keys(out2)) {
		tbody.appendChild(table_row([out2[key].prikaz, out2[key].usl, key, out2[key].fac]));
	}

	let xls = make_dlink("JSON_merged", [akt_table, null], "xls");
	second.appendChild(xls);
}