"use strict";
// ==UserScript==
// @name        АКТЫ
// @version     6.5.5
// @date        2022-01-10
// @author      kazakovstepan
// @namespace   ITMO University
// @description Генерирует неотсорированный акт
// @homepage    https://vk.com/kazakovstepan
// @icon        https://isu.ifmo.ru/i/libraries/frontend/logo/isu.png
// @updateURL   https://isu.ksrt12.ru/scripts/akt.user.js
// @downloadURL https://isu.ksrt12.ru/scripts/akt.user.js
// @match       https://abit.itmo.ru/order/*
// @match       https://abit.itmo.ru/bachelor/rating/*/
// @match       https://abit.itmo.ru/postgraduate/rating*
// @match       https://isu.ifmo.ru/pls/apex/f?p=2175:9:*
// @run-at      document-end
// @grant       none
// ==/UserScript==
function Err(str) {
    // @ts-ignore
    G2.notify(str, 'Ошибка', true);
}
function Warn(str) {
    // @ts-ignore
    G2.notify(str, null, false, true);
}
function Info(str) {
    // @ts-ignore
    G2.notify(str);
}
const abit = isSite("abit.itmo");
const recomm = isSite("bachelor/rating");
let json_raw, file_name;
let source, go, clear;
window.addEventListener("load", () => {
    if (abit) {
        const prikaz = document.querySelector("body > div.main.page > section.static-page-rule > div > h1");
        prikaz.after(makeExport(prikaz.innerText));
    }
    else if (isSite("isu.ifmo")) {
        makeExportISU();
    }
});
/** Generate report on enrollment order pages or recommended (https://abit.itmo.ru/page/110/) */
function makeExport(prikaz) {
    let name, result;
    if (recomm) {
        const n = prikaz.search("\n") + 1;
        name = prikaz.substring(n, n + 8);
        result = makeAktTable(name, "B");
    }
    else if (isSite("postgraduate/rating")) {
        name = "Postgraduate";
        result = postgraduate();
    }
    else {
        const page = document.querySelector("body > div.main.page > section.static-page-rule > div");
        const grad = isMaga(page.querySelector("h3").innerText) ? "M" : "B";
        name = grad + ' ' + prikaz.substring(9).toLowerCase();
        result = makeAktTable(page.querySelector("table > tbody > tr.hdr").childElementCount, grad);
    }
    const div = document.createElement("div");
    div.style.display = "flex";
    if (result.dubles) {
        div.appendChild(makeDlink(name + " дубликаты", result.dubles, "xls", "Дубликаты"));
    }
    else if (result.akt_table) {
        div.appendChild(makeDlink(name, result.akt_table, "xls"));
    }
    div.appendChild(makeDlink(name, result.akt_json, "json"));
    div.appendChild(makeButton(`Итого: ${result.count} человек`));
    return div;
}
/** Generate report in ISU ABIT system (https://isu.ifmo.ru/pls/apex/f?p=2175:9) */
function makeExportISU() {
    const div = document.createElement("div");
    div.id = "isuEXT";
    source = document.createElement("input");
    go = makeButton("Go!", "fa-upload");
    clear = makeButton("Clear", "fa-refresh");
    disable(clear);
    disable(go);
    source.type = "file";
    source.onchange = () => readFile(source);
    go.onclick = initReport;
    clear.onclick = makeClear;
    div.appendChild(source);
    div.appendChild(go);
    document.querySelector("div.form-group").after(div);
}
/** Initialize report */
function initReport() {
    const json = loadJSON();
    if (json) {
        const input = document.querySelector("#report_list_filter > label > input");
        const length = document.querySelector("#report_list_length > label > select");
        const ND = document.querySelector("#report_list > thead > tr > th:nth-child(1)");
        const keys = Object.keys(json.data);
        /** Forced change of ISU table by adding an empty row element */
        const manual = () => setTimeout(() => document.querySelector("#report_list > tbody").firstElementChild.after(document.createElement("tr")), 50);
        Info("JSON загружен!\nУникальных ключей: " + keys.length);
        console.group(file_name);
        console.time("done");
        source.style.display = "none";
        go.style.display = "none";
        source.after(clear);
        console.group("init table...");
        Promise.resolve()
            .then(() => {
            const grad = json.info.grad;
            if (input.value === grad) {
                manual();
            }
            else {
                input.value = grad;
                input.dispatchEvent(new Event('input'));
                Log("set input to " + grad);
            }
        })
            .then(waitTable)
            .then(() => {
            if (ND.getAttribute("aria-sort") === "ascending") {
                manual();
            }
            else {
                ND.click();
                Log("sort");
            }
        })
            .then(waitTable)
            .then(() => {
            length.selectedIndex = 6;
            length.dispatchEvent(new Event('change'));
            Log("set 1000");
        })
            .then(waitTable)
            .then(() => {
            console.groupEnd();
            console.timeLog("done");
            console.group("creating report...");
            createReport(makeBaseTable(), json, keys);
        });
    }
}
/** Create ISU report */
function createReport(old_table, json, keys) {
    const merged_table = addList(old_table, json.data, json.info);
    const next = document.querySelector("#report_list_next");
    if (isEnabled(next)) {
        Promise.resolve()
            .then(next.click)
            .then(waitTable)
            .then(() => createReport(merged_table, json, keys));
    }
    else {
        addWindowNum();
        const report = makeDlink(file_name, merged_table, "xls");
        console.groupEnd();
        clear.after(report);
        const new_keys = Array.from(merged_table.querySelectorAll("tbody > tr > td:nth-child(6)")).map(a => a.innerText);
        Log(`created! (${new_keys.length}/${keys.length})`, "white; font-weight: bold;");
        console.groupEnd();
        console.timeEnd("done");
        const diff = keys.filter((key) => !new_keys.includes(key));
        const mess = `Найдено ключей: ${new_keys.length} из ${keys.length}`;
        if (diff.length) {
            Warn(mess);
            const notfound = { xls: makeBaseTable(), json: { info: json.info, data: {} } };
            for (const i of diff) {
                createFullTable(notfound.xls.tBodies[0], json.data, false, i);
                notfound.json.data[i] = json.data[i];
            }
            for (const [key, val] of Object.entries(notfound)) {
                report.after(makeDlink(file_name, val, key, "NotFound"));
            }
        }
        else {
            Info(mess);
        }
        enable(clear);
    }
}
/** Add new rows form ISU table to report table */
function addList(delo_table, data, info) {
    let count = 0;
    const isu_tbt = document.querySelectorAll("#report_list > tbody > tr[role]");
    const tbody = delo_table.querySelector("tbody");
    for (const i of isu_tbt) {
        const fio_id = i.querySelector("td:nth-child(2)");
        const fio = fio_id.innerText;
        const orig = i.querySelector("td:nth-child(3)").innerText.includes("Да") ? "оригинал" : "";
        const isu_usl = i.querySelector("td:nth-child(5)").innerText;
        if (data[fio] && !isu_usl.includes("Нет")) {
            let usl = data[fio].usl;
            const stream = data[fio].stream;
            if (!isMaga(stream)) {
                switch (isu_usl) {
                    case "без вступительных испытаний":
                        usl += (usl === "БВИ") ? "" : "?";
                        break;
                    case "на бюджетное место в пределах целевой квоты":
                        usl += ":ЦК";
                        break;
                    case "на бюджетное место в пределах особой квоты":
                        usl += ":ОК";
                        break;
                    default:
                        usl += ":К";
                        break;
                }
            }
            const toTable = [
                'G' + stream,
                usl,
                getID(fio_id),
                i.querySelector("td:nth-child(1)").innerText,
                data[fio].fac,
                fio // ФИО
            ];
            if (!info.small) {
                toTable.push("01.09.2021", // Дата
                "50 л., ЭПК ст. 450", // срок хранения
                orig // Оригинал
                );
            }
            tbody.appendChild(tableRow(toTable));
            count += 1;
        }
    }
    const page = document.querySelector("#report_list_paginate > ul > li.paginate_button.active").innerText;
    Info("Данные добавлены: " + page);
    Log(`added from page ${page}: ${count}`);
    return delo_table;
}
/** Parse loaded file */
function loadJSON() {
    let json_data;
    try {
        json_data = JSON.parse(json_raw);
    }
    catch (err) {
        Err("Некорректный JSON!");
        return;
    }
    return json_data;
}
/** Crear function */
function makeClear() {
    const first_page = document.querySelector("#report_list_first");
    document.querySelector("#isuEXT").remove();
    if (isEnabled(first_page)) {
        first_page.click();
    }
    makeExportISU();
}
/** Check if an element is enabled */
function isEnabled(elem) {
    return !elem.classList.contains("disabled");
}
/** Enable an element */
function enable(elem) {
    elem.classList.remove("disabled");
}
/** Disable an element */
function disable(elem) {
    elem.classList.add("disabled");
}
/** Get person ID from ISU table */
function getID(elem) {
    const a = document.createElement("a");
    const pid = elem.querySelector("span:nth-child(2)").getAttribute("pid");
    a.href = 'https://isu.ifmo.ru/pls/apex/f?p=2175:SU_OFFICE:101431868275662:GET:NO::ST_ID:' + pid;
    a.text = pid;
    return a;
}
/** Generate report from current table in https://abit.itmo.ru pages */
function makeAktTable(hdr, grad) {
    let count = 0;
    const akt_meta = { small: recomm, grad: grad };
    const akt_data = {};
    const akt_table = makeBaseTable();
    const dubl_table = makeBaseTable();
    const tbody = akt_table.querySelector("tbody");
    const dubl = dubl_table.querySelector("tbody");
    if (recomm) {
        for (const i of document.querySelectorAll("body > div.main.page.table-page > section.static-page-rule > div > div > table > tbody > tr:not(.hdr)")) {
            if (i.cells[2].className === "grn") {
                const shift = Number(Number(i.cells[0].getAttribute("rowspan")) >= 1);
                const preusl = i.cells[3 + shift].innerText;
                const usl = preusl || "БВИ";
                const fio = i.cells[2 + shift].innerText;
                const fac = getFacBak(hdr);
                akt_data[fio] = createFullTable(tbody, akt_data, dubl, fio, fac, usl, hdr);
                count++;
            }
        }
    }
    else {
        for (const stream of document.querySelectorAll("body > div.main.page > section.static-page-rule > div > h3")) {
            const streamCode = stream.innerText.substring(0, 8);
            for (const i of stream.nextElementSibling.querySelectorAll("tbody > tr:not(.hdr)")) {
                const usl = (hdr === 1) ? "ГЛ" : (hdr === 3) ? "БВИ" : i.cells[1].innerText;
                const fac = isMaga(streamCode) ? getFacMaga(usl.replace(' (СОП)', ''), streamCode) : getFacBak(streamCode);
                const fio = i.cells[0].innerText;
                akt_data[fio] = createFullTable(tbody, akt_data, dubl, fio, fac, usl, streamCode);
                count++;
            }
        }
    }
    return {
        akt_table: akt_table,
        akt_json: { info: akt_meta, data: akt_data },
        count: count,
        dubles: (dubl.hasChildNodes()) ? dubl_table : undefined
    };
}
function createFullTable(tbody, json, dubl, fio, fac, usl, streamCode) {
    const toTbody = (arr) => tbody.appendChild(tableRow(arr));
    if (dubl instanceof HTMLTableSectionElement) {
        if (json.hasOwnProperty(fio)) {
            const dubl_mess = `Дубликат: ${fio}\nПредыдущее вхождение: ${json[fio].stream}, ${json[fio].usl}\nТекущее вхождение: ${streamCode}, ${usl}`;
            alert(dubl_mess);
            console.warn(dubl_mess);
            dubl.appendChild(tableRow([fio, 'G' + json[fio].stream, json[fio].usl, 'G' + streamCode, usl]));
        }
        toTbody(['G' + streamCode, usl, fio, fac]);
        return { fac: fac, usl: usl, stream: streamCode };
    }
    else {
        const { fac, usl, stream } = json[fio];
        toTbody(['G' + stream, usl, fio, fac]);
    }
}
/** Generate postgraduate report */
function postgraduate() {
    let stream = "", count = 0;
    const json = {};
    const trs = Array.from(document.querySelectorAll("body > div.main.page.table-page > section.static-page-rule > div > div > table > tbody > tr")).filter(tr => tr.style.backgroundColor === "");
    for (const i of trs) {
        const npr = i.querySelector("td.npr");
        if (npr) {
            const text = npr.innerText;
            stream = text.substring(text.indexOf(":") + 2, text.indexOf("КЦП") - 1);
            json[stream] = {};
        }
        else if (i.cells[2].classList.contains("grn")) {
            const shift = (Number(i.cells[0].getAttribute("rowspan")) >= 1) ? 2 : 0;
            const getText = (cell) => i.cells[cell + shift].innerText;
            const getNum = (cell) => Number(getText(cell));
            json[stream][getText(2)] = getNum(3) + getNum(4) + getNum(5);
            count++;
        }
    }
    return {
        akt_json: json,
        count: count,
    };
}
/** Check current stream is master or bachelor */
function isMaga(str) {
    return str.includes(".04.");
}
/** Get bachelor's faculty name by stream */
function getFacBak(str) {
    let fac;
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
            fac = "ФФ";
            break;
        case "12.03.02":
            fac = "ИИФ";
            break;
        case "12.03.04":
        case "18.03.02":
            fac = "Центр ХИ";
            break;
        case "05.03.06": // 2022
        case "13.03.01":
        case "16.03.03":
            fac = "ФЭиЭТ";
            break;
        case "12.03.05":
            fac = "ФНЭ";
            break;
        case "16.03.01":
            fac = "ФизФак|ФФ"; // 2022
            break;
        case "18.03.01":
            fac = "НОЦ Инфохимии";
            break;
        case "19.03.01":
            fac = "ФБТ";
            break;
        case "27.03.05":
        case "38.03.05":
            fac = "ФТМИ";
            break;
        default:
            fac = "???";
    }
    return fac;
}
/** Get master's faculty name by programm and stream */
function getFacMaga(prog, stream) {
    let fac;
    switch (prog) {
        case "Математическое и компьютерное моделирование":
        case "Индустриальные киберфизические системы":
        case "Электроинженерия":
        case "Робототехника и искусственный интеллект / Robotics and artificial intelligence":
        case "Системы управления движением и навигация / Motion control and navigation":
        case "Цифровые системы управления / Digital control systems":
            fac = "ФСУиР";
            break;
        case "Аналитика данных":
            fac = "ВШЦК";
            break;
        case "Биоинформатика и системная биология / Bioinformatics and systems biology":
        case "Программирование и искусственный интеллект":
        case "Разработка программного обеспечения / Software Engineering":
        case "Программирование и интернет-технологии":
        case "Речевые информационные системы":
        case "Информационные системы бизнеса / Business information systems":
            fac = "ФИТиП";
            break;
        case "Большие данные и машинное обучение / Big data and machine learning":
        case "Цифровые геотехнологии":
        case "Технологии разработки компьютерных игр":
        case "Финансовые технологии больших данных":
            fac = "ФЦТ";
            break;
        case "Умный город и урбанистика":
        case "Световой дизайн / Lighting design":
            fac = "ИДУ";
            break;
        case "Компьютерные системы и технологии":
        case "Веб-технологии":
        case "Мультимедиа-технологии, дизайн и юзабилити":
        case "Нейротехнологии и программная инженерия":
        case "Программное обеспечение радиоэлектронных систем":
        case "Системное и прикладное программное обеспечение":
        case "Технологии интернета вещей":
            fac = "ФПИиКТ";
            break;
        case "Программное обеспечение интеллектуальных систем и технологий":
        case "Мобильные и облачные технологии":
        case "Инфокоммуникации и цифровые медиа / Infocommunications and digital media":
            fac = "ФИКТ";
            break;
        case "Стратегии и технологии цифровой трансформации":
            switch (stream) {
                case "27.04.05":
                case "38.04.05":
                case "12.04.02":
                    fac = "ФТМИ";
                    break;
                case "09.04.02":
                    fac = "ФЦТ";
                    break;
                default:
                    fac = "???";
            }
            break;
        case "Информационная безопасность / Information security":
        case "Функциональная безопасность беспилотных транспортных средств":
            fac = "ФБИТ";
            break;
        case "Прикладная оптика / Applied optics":
            fac = "ИИФ";
            break;
        case "Квантовые коммуникации и фемтотехнологии / Quantum communications and femtotechnologies":
        case "Квантовые технологии в индустрии":
        case "Физика и технология наноструктур / Physics and technology of nanostructures":
            fac = "ФФ";
            break;
        case "Техническая физика / Physics and engineering":
            fac = "ФизФак";
            break;
        case "Биоинженерия и биотехнические системы / Bioengineering and biotechnical systems":
        case "Биоэкономика и управление ресурсами":
            fac = "Центр ХИ";
            break;
        case "Лазерные технологии":
            fac = "ФНЭ";
            break;
        case "Световодная фотоника и программируемая электроника / Light Guide Photonics and Programmable Electronics":
            fac = "ИВИШ";
            break;
        case "Процессы и аппараты пищевых производств":
        case "ФудТех / Foodtech":
        case "Индустриальная экология / Industrial ecology":
        case "Агробиотехнология":
        case "Прикладная геномика / Applied genomics":
            fac = "ФБТ";
            break;
        case "Технологии и системы преобразования энергии":
        case "Водородная энергетика":
        case "Информационные технологии в теплофизике":
        case "Техника и технологии сжиженного природного газа":
        case "Техногенная безопасность и метрология":
            fac = "ФЭиЭТ";
            break;
        case "Перспективные системы передачи данных / Advanced Data Transfer Systems":
            fac = "ИПСПД";
            break;
        case "Инфохимия / Infochemistry":
            fac = "НОЦ Инфохимии";
            break;
        case "Химия прикладных материалов / Chemistry of Applied Materials":
        case "Молекулярная биология и биотехнология / Molecular Biology and Biotechnology":
            fac = "ХБК";
            break;
        case "Управление качеством":
        case "Инновационное предпринимательство / Innovation Entrepreneurship":
        case "Инновационный маркетинг":
        case "Корпоративные финансы и венчурные инвестиции":
        case "Стратегическое управление интеллектуальной собственностью":
        case "Технонаука, инновации, экономика":
            fac = "ФТМИ";
            break;
        case "Искусство и наука / Art & Science":
        case "Научная коммуникация":
        case "Анализ культурных данных и визуализация/ Data, Culture and Visualization":
            fac = "ИМРиП";
            break;
        default:
            fac = "???";
    }
    return fac;
}
/** Function awaiting table changes */
function waitTable() {
    const isuTbody = document.querySelector("#report_list > tbody");
    return new Promise(resolve => {
        const num = (first) => {
            const tr = (first) ? isuTbody.firstElementChild : isuTbody.lastElementChild;
            return tr.firstElementChild.innerText.substring(3, 7);
        };
        new MutationObserver((_, observer) => {
            Log(`table ready: ${num(true)}-${num(false)}`, "grey");
            resolve(true);
            observer.disconnect();
        }).observe(isuTbody, { childList: true });
    });
}
/** Read file from input as text */
function readFile(input) {
    const file = input.files[0];
    Promise.resolve(readToText(file)).then(result => {
        enable(go);
        json_raw = result;
        file_name = file.name.replace(/.json/i, '');
    });
}
/** Add window number to search input */
function addWindowNum() {
    const wind = document.querySelector("#P9_WINDOW").value;
    if (wind) {
        file_name = file_name.substring(0, 1) + wind + file_name.substring(1);
    }
}
/** Check current site page href */
function isSite(str) {
    return document.location.href.includes(str);
}
/** Colorize console.log */
function Log(str, color = "deepskyblue") {
    console.log("%c" + str, "color:" + color);
}
/** Make button function */
function makeButton(name, span_class) {
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
/**
 * Make download link button
 * @param name A name of button
 * @param source JSON data or HTML table
 * @param form Form: json | xls
 * @param rename Like name by defalt
 */
function makeDlink(name, source, form, rename = name) {
    const xls = (source instanceof HTMLTableElement);
    const a = makeButton(`${rename}.${form}`, xls ? "fa-file-excel-o" : "fa-download");
    a.href = xls ? akt2xls(source, name) : akt2json(source);
    a.download = `${name}.${form}`.replace(/ /g, '_');
    return a;
}
/** Create download url for HTML table */
function akt2xls(table, name) {
    const template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>', ctx = { worksheet: name, table: table.innerHTML }, base64 = (s) => window.btoa(decodeURIComponent(encodeURIComponent(s))), format = (s, c) => s.replace(/{(\w+)}/g, (_, p) => c[p]);
    return 'data:application/vnd.ms-excel;base64,' + base64(format(template, ctx));
}
/** Create download url for JSON data */
function akt2json(json_data) {
    return URL.createObjectURL(new Blob([JSON.stringify(json_data)], { type: 'application/json' }));
}
/** Add child nodes to HTML element */
function addEntry(x, tgt) {
    if ((typeof x === 'string') || (typeof x === 'number')) {
        tgt.appendChild(makeText("" + x));
    }
    else if (Array.isArray(x)) {
        for (const i of x) {
            addEntry(i, tgt);
        }
    }
    else {
        tgt.appendChild(x);
    }
}
/** Create table row from input array */
function tableRow(l) {
    const tr = document.createElement('tr');
    for (const i of l) {
        const g = document.createElement('td');
        addEntry(i, g);
        tr.appendChild(g);
    }
    return tr;
}
/** Create text node */
function makeText(str) {
    return document.createTextNode(str);
}
/** Make base table template */
function makeBaseTable() {
    const base_table = document.createElement('table');
    base_table.setAttribute('rules', 'all');
    base_table.setAttribute('border', 'all');
    base_table.createTBody();
    return base_table;
}
/** Read file from input as text */
async function readToText(file) {
    const tmpFR = new FileReader();
    return new Promise((resolve, reject) => {
        tmpFR.onerror = () => {
            tmpFR.abort();
            reject(new Error("Problem parsing input file."));
        };
        tmpFR.onload = () => resolve(tmpFR.result);
        tmpFR.readAsText(file);
    });
}
