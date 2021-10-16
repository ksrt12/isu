import { IAllJson } from "./interfaces";

function makeButton(name: string, span_class?: string, abit?: boolean) {
    const a = document.createElement("a");
    a.type = "button";
    a.className = "btn btn-labeled btn-xs btn-margined";
    a.style.margin = "6px 6px 6px 0";
    a.style.fontSize = "13px";
    a.id = name;
    if (!abit) {
        const span = document.createElement("span");
        span.className = "btn-label icon fa " + span_class;
        span.style.fontSize = "12px";
        span.style.marginRight = "6px";
        a.appendChild(span);
    }
    a.appendChild(makeText(name));
    return a;
}

function makeDlink(name: string, source: IAllJson | HTMLTableElement, form: string, rename = name) {
    const xls = (source instanceof HTMLTableElement);
    const a = makeButton(`${rename}.${form}`, xls ? "fa-file-excel-o" : "fa-download");
    a.href = xls ? akt2xls(source, name) : akt2json(source);
    a.download = `${name}.${form}`.replace(/ /g, '_');
    return a;
}

function akt2xls(table: HTMLTableElement, name: string) {
    interface Ictx {
        worksheet: string;
        table: string;
    }
    const uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>',
        ctx: Ictx = { worksheet: name, table: table.innerHTML },
        base64 = (s: string) => window.btoa(unescape(encodeURIComponent(s))),
        format = (s: string, c: Ictx) => s.replace(/{(\w+)}/g, (_, p: string) => c[p as keyof Ictx]);

    return uri + base64(format(template, ctx));
}

function akt2json(json_data: IAllJson) {
    return URL.createObjectURL(new Blob([JSON.stringify(json_data)], { type: 'application/json' }));
}

function addEntry(x: any, tgt: HTMLTableCellElement) {
    if ((typeof x === 'string') || (typeof x === 'number')) {
        tgt.appendChild(makeText("" + x));
    } else if (Array.isArray(x)) {
        for (const i of x) {
            addEntry(i, tgt);
        }
    } else {
        tgt.appendChild(x);
    }
}

function tableRow(l: any[]) {
    const tr = document.createElement('tr');
    for (const i of l) {
        const g = document.createElement('td');
        addEntry(i, g);
        tr.appendChild(g);
    }
    return tr;
}

function makeText(str: string) {
    return document.createTextNode(str);
}

function makeBaseTable() {
    const base_table = document.createElement('table');
    base_table.setAttribute('rules', 'all');
    base_table.setAttribute('border', 'all');
    base_table.createTBody();
    return base_table;
}

async function readToText(file: Blob): Promise<string> {
    const tmpFR = new FileReader();
    return new Promise((resolve, reject) => {
        tmpFR.onerror = () => {
            tmpFR.abort();
            reject(new Error("Problem parsing input file."));
        };
        tmpFR.onload = () => resolve(tmpFR.result as string);
        tmpFR.readAsText(file);
    });
}

export { makeBaseTable, tableRow, makeButton, makeDlink, akt2json, akt2xls, readToText };