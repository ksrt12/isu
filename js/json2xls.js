/* json2xls.js
	(c) 2020 kazakovstepan
*/

window.addEventListener("DOMContentLoaded", main)
let out2 = {};

function main() {
	const div = document.querySelector("#main");
	let jsons, download;
	
	let load = document.createElement("button");
	load.appendChild(document.createTextNode("LOAD"));
	load.style.width = "fit-content";
	load.onclick = () => mergeJSONs(div);
	
	let source = document.createElement("input");
	source.type = "file"; 
	source.multiple = true;
	source.accept = "application/json";
	source.onchange = function() {
		try {
			readFiles(source);
		} catch(err) {
			console.log(err);
		}
	}
	
	div.appendChild(source);
	div.appendChild(load);
	
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

function mergeJSONs(div) {
	if (out2) {
		let download = make_dlink("IntJSON", [null, out2], "json");
		div.appendChild(download);
	}
}