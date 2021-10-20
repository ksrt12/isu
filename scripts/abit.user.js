"use strict";
// ==UserScript==
// @name        Абитуриент
// @version     7.6.2
// @date        2021-09-05
// @author      kazakovstepan
// @namespace   ITMO University
// @description IT's MOre than the Система Абитуриент
// @homepage    https://vk.com/kazakovstepan
// @icon        https://isu.ksrt12.ru/favicon.ico
// @updateURL   https://isu.ksrt12.ru/scripts/abit.user.js
// @downloadURL https://isu.ksrt12.ru/scripts/abit.user.js
// @include     https://isu.ifmo.ru/pls/apex/f?p=2175:*
// @exclude     https://isu.ifmo.ru/pls/apex/f?p=2175:9:*
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
const getElem = {
    id(id) {
        return document.getElementById(id);
    },
    input(id) {
        return this.id(id);
    },
    val(id) {
        return this.input(id).value;
    },
    selector(id) {
        return this.id(id);
    },
    index(id) {
        return this.selector(id).selectedIndex;
    },
    text(id) {
        const elem = this.selector(id);
        return elem.options[elem.options.selectedIndex].text;
    }
};
/**
 * Make button
 * @param str Button name
 * @param ISUid ISU element ID
 * @param func Callback
 * @returns HTMLButtonElement
 */
function addCheckButton(str, ISUid, func) {
    const ISUELEM = getElem.id(ISUid);
    let finalID = "ButCheck";
    const exist_btm = getElem.input(finalID);
    if (exist_btm) {
        if (exist_btm.value !== str) {
            finalID = "CheckGTO";
        }
    }
    console.log("making button: ", str);
    if (ISUELEM !== null && getElem.id(finalID) === null) {
        const CheckButton = document.createElement("button");
        CheckButton.id = finalID;
        CheckButton.value = str;
        CheckButton.className = "btn btn-labeled";
        CheckButton.type = "button";
        CheckButton.style.marginRight = "5px";
        ISUELEM.parentNode.insertBefore(CheckButton, ISUELEM);
        const span = document.createElement("span");
        span.className = "btn-label icon fa fa-refresh";
        CheckButton.appendChild(span);
        CheckButton.appendChild(document.createTextNode(str));
        CheckButton.onclick = func;
    }
}
/** Generate GET-link */
function getFullName() {
    return `?LN=${getElem.val('ST_LASTNAME')}&FN=${getElem.val('ST_FIRSTNAME')}&MN=${getElem.val('ST_MIDDLENAME')}`;
}
/** Generate link for checking all olymps on https://abit.snegiry.art */
function addAllOlympsCheck() {
    return `https://abit.snegiry.art/${getFullName()}&BD=${getElem.val('ST_DOB').split('.').reverse().join('-')}&DN=${getElem.val('P2_DELO')}`;
}
/** Generate link for checking GTO (https://www.gto.ru/sign/check) */
function gtoCheck() {
    return `https://www.gto.ru/sign/check${getFullName()}&BD=${getElem.val('ST_DOB')}`;
}
/** Get olymp number */
function getONUM() {
    return getElem.val('OLYMP_NUM').replace(/[. -]+/g, "");
}
/** Generate link for checking current olymp */
function addOlympCheck() {
    const OLYMPNUM = getONUM();
    const OLYMPYEAR = Number(getElem.val('OLYMP_YEAR'));
    if (OLYMPNUM.startsWith('0000')) {
        if (OLYMPYEAR >= 2018) {
            return `https://abit.snegiry.art/files/${OLYMPYEAR}.pdf`;
        }
        else {
            return 'https://www.google.ru/';
        }
    }
    else {
        return `https://diploma.rsr-olymp.ru/files/rsosh-diplomas-static/compiled-storage-${OLYMPYEAR}/by-code/${OLYMPNUM}/white.pdf`;
    }
}
/** Set checkboxes automatically if 'LK_DELO_0' is checked */
function autoPhotoCopy(DZCH) {
    DZCH.onclick = () => {
        getElem.input('LK_PHOTO_0').checked = DZCH.checked;
        getElem.input('LK_PODL_COPY_0').checked = DZCH.checked;
    };
}
/** Add check button for current olymp */
function listenOLYMP() {
    if (getElem.id('ButCheck') === null && getElem.id('OLYMP_DELETE') !== null && getONUM() !== "") {
        addCheckButton("Печать", "OLYMP_DELETE", () => window.open(addOlympCheck(), '_blank'));
    }
}
/** Check BVI without agree */
function checkBVIwoAgree() {
    const orig = getElem.input('LK_PODL_0').checked;
    const agree = getElem.text('LK_AGREE').substring(0, 8);
    for (const i of document.querySelectorAll("#report_rating_rep > tbody > tr")) {
        if (i.querySelector('td:nth-child(5)').innerText === 'без вступительных испытаний') {
            if (agree !== i.querySelector('td:nth-child(2)').innerText.substring(0, 8)) {
                Err('БВИ без согласия!');
            }
            if (!orig) {
                Warn('БВИ без оригинала!');
            }
        }
    }
}
/** Get min points for current stream */
function getMinPoints(stream) {
    let subj;
    const minpoints = {
        'Математика': 60,
        'Русский язык': 60
    };
    switch (stream) {
        case '12.03.02':
        case '12.03.05':
        case '13.03.01':
            subj = ["Информатика", "Физика"];
            break;
        case '12.03.03':
        case '16.03.01':
        case '16.03.03':
            subj = ['Физика'];
            break;
        case '12.03.04':
            subj = ['Биология'];
            break;
        case '18.03.01':
        case '18.03.02':
        case '19.03.01':
            subj = ['Химия'];
            break;
        case '27.03.05':
        case '45.03.04':
            subj = ['Иностранный язык'];
            break;
        case '38.03.05':
            subj = ['Обществознание'];
            break;
        default:
            subj = ["Информатика"];
    }
    for (const i of subj) {
        minpoints[i] = 60;
    }
    if (stream === '01.03.02') {
        minpoints['Математика'] = 75;
        minpoints['Информатика'] = 75;
    }
    return minpoints;
}
/** Get subjects for VSOSH */
function getVSEROS(stream) {
    const languages = ["Немецкий язык", "Французкий язык", "Английский язык", "Итальянский язык", "Китайский язык"];
    const social = ["Экономика", "Обществознание", "Право"];
    const vsosh = { 'Математика': true };
    let subj = [];
    switch (stream) {
        case '01.03.02':
        case '09.03.01':
        case '09.03.02':
        case '09.03.03':
        case '09.03.04':
        case '10.03.01':
        case '11.03.02':
        case '44.03.04':
            subj = ["Информатика"];
            break;
        case '11.03.03':
        case '12.03.01':
        case '13.03.02':
        case '15.03.04':
        case '15.03.06':
        case '24.03.02':
        case '27.03.04':
            subj = ["Информатика", "Технология"];
            break;
        case '12.03.04':
        case '18.03.01':
        case '18.03.02':
        case '19.03.01':
            subj = ["Химия", "Биология", "Экология", "Технология"];
            break;
        case '12.03.02':
        case '12.03.03':
        case '12.03.05':
        case '12.05.01':
        case '16.03.01':
        case '16.03.03':
            subj = ["Физика", "Астрономия", "Технология"];
            break;
        case '45.03.04':
            subj = [...languages, "Информатика"];
            break;
        case '27.03.05':
            subj = [...languages, ...social];
            break;
        case '38.03.05':
            subj = social;
            break;
    }
    for (const i of subj) {
        vsosh[i] = true;
    }
    return vsosh;
}
/** Get EGE points */
function loadEGEpoints() {
    const EGE_points = {};
    for (const i of document.querySelectorAll("#report_baki_ege_rep > tbody > tr")) {
        EGE_points[i.querySelector('td:nth-child(2)').innerText] = Number(i.querySelector('td:nth-child(4)').innerText);
    }
    return EGE_points;
}
/**
 * Get olymps
 * @returns List of olymps by names
 */
function loadOLYMPS() {
    const OLYMPSbyName = {};
    for (const i of document.querySelectorAll("#report_olymp_rep > tbody > tr > td:nth-child(1)")) {
        const a = i.innerText;
        OLYMPSbyName[a.substring(0, a.indexOf(' ('))] = a.substring(a.indexOf(' (') + 2, a.indexOf(', '));
    }
    return OLYMPSbyName;
}
/** Check current stream */
function checkSTREAM() {
    const EGE_points = loadEGEpoints(), OLYMPSbyName = loadOLYMPS(), annul_text = 'Аннулировано ' + getElem.id('APPL_ANN').textContent, curr_stream = getElem.text('APPL_PROG').substring(0, 8), curr_olymp = getElem.text('APPL_OLYMP'), appl_usl = getElem.index('APPL_USL'), isBVI = (appl_usl === 1), isOlymps = (getElem.id('report_olymp_rep') !== null);
    let points, mess = "", err_mes = false, err_count = 0, warn_count = 0, annul = (getElem.index('APPL_STATUS') === 1), minpoints = getMinPoints(curr_stream);
    const CountErr = (str) => {
        Err(str);
        err_count++;
    };
    if (getElem.index('APPL_MEGA_N') === 1) {
        Err(`${curr_stream}: ИМРИП поменять на ТИНТ!`);
    }
    else {
        if (isBVI) {
            // БВИ
            if (isOlymps) {
                if (OLYMPSbyName[curr_olymp] === 'Русский язык') {
                    CountErr(`${curr_olymp} (Русский язык)\n Не даёт БВИ!`);
                }
            }
            else {
                CountErr('Нет олимпиад!');
            }
            mess = 'БВИ';
        }
        else if (appl_usl === 4) {
            Info('Гос. линия');
        }
        else {
            // не БВИ
            let sum = 0;
            const minsubjects = () => Object.keys(minpoints);
            const checkAnnul = (err_mes) => {
                if (err_mes) {
                    if (annul) {
                        Info(`${annul_text}:\n${err_mes}`);
                        err_count = 0;
                        warn_count++;
                    }
                    else {
                        CountErr(err_mes);
                    }
                }
            };
            // вариативность ЕГЭ
            let deleted_subj = "";
            if (minsubjects().length === 4) {
                const subjects = minsubjects().slice(2);
                const delIndex = subjects.map(subj => EGE_points[subj]).indexOf(undefined);
                if (delIndex !== -1) {
                    deleted_subj = subjects[delIndex];
                    delete minpoints[deleted_subj];
                }
                else {
                    const [firstsubj, secondsubj] = subjects;
                    delete minpoints[(EGE_points[firstsubj] < EGE_points[secondsubj]) ? firstsubj : secondsubj];
                }
            }
            console.group(curr_stream);
            for (const subj of minsubjects()) {
                points = EGE_points[subj];
                console.log(`${subj} ${minpoints[subj]}:${points}`);
                if (points === undefined) {
                    err_mes = `Нет ЕГЭ! (${subj}`;
                    if (deleted_subj) {
                        err_mes += ` | ${deleted_subj}`;
                    }
                    err_mes += ')';
                }
                else if (points < minpoints[subj]) {
                    err_mes = `${curr_stream}: ${subj}: ${points}\nМинимальный балл: ${minpoints[subj]}`;
                }
                else {
                    sum += points;
                }
                checkAnnul(err_mes);
                err_mes = false;
            }
            console.groupEnd();
            if (appl_usl === 3) {
                if (sum < 255) {
                    err_mes = `Минимальная сумма баллов для целевого: 255! (${sum})`;
                    checkAnnul(err_mes);
                }
            }
            mess = `ЕГЭ: ${sum}`;
            if (warn_count !== 0) {
                annul = false;
                err_mes = true;
            }
        }
        if (isOlymps) {
            if (curr_olymp === '...') {
                if (isBVI) {
                    CountErr('БВИ без олимпиады!');
                }
                else {
                    Warn('Обнаружены непроставленные олимпиады');
                }
            }
            else {
                const curr_subj = OLYMPSbyName[curr_olymp];
                if (curr_olymp === 'Всероссийская олимпиада школьников') {
                    if (getVSEROS(curr_stream)[curr_subj]) {
                        if (isBVI) {
                            Info(`${curr_stream}: ВСЕРОС!`);
                        }
                        else {
                            CountErr('ВСЕРОС без БВИ');
                        }
                    }
                    else {
                        CountErr('Олимпиада не подходит!');
                    }
                }
                else {
                    points = EGE_points[curr_subj];
                    if (points < 75 || points === undefined) {
                        CountErr(`Олимпиада не подтверждена! (${curr_subj}: ${points})`);
                    }
                }
            }
        }
        if (err_count === 0) {
            if (annul) {
                Err(annul_text);
                Warn('И зря!');
            }
            else {
                if (!err_mes) {
                    Info(`${curr_stream}: OK! (${mess})`);
                }
                getElem.id('APPL_UPDATE').click();
            }
        }
    } // ИМРИП
}
/** Listen application */
function checkAPPL() {
    const HASH = document.location.hash;
    if (HASH === "#olymp") {
        new MutationObserver(() => listenOLYMP())
            .observe(document.querySelector("#st_form > div > div > div:nth-child(3) > div"), {
            attributes: true,
            attributeFilter: ["style"]
        });
    }
    if (HASH === "#appl") {
        console.log("opened appl");
        document.querySelector("#appl_form > div.panel-body").onchange = addCheckButton("Проверить", "APPL_UPDATE", checkSTREAM);
    }
}
/** Helper sleep function */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/** Download all documents automatically */
async function openAllDocs() {
    for (const i of getElem.id("report_R3997083729921636026").querySelectorAll("tbody > tr")) {
        const a = i.firstElementChild.firstElementChild;
        console.log(a.innerText);
        window.open(a.href, '_blank');
        await sleep(700);
    }
}
/** Set normal width of table columns */
function setWidth() {
    new MutationObserver((_, observer) => {
        for (const i of ["sorting_kp", "sorting_date", "sorting_status"]) {
            document.querySelector("#report_docs > thead > tr > th." + i).style.width = "100px";
        }
        observer.disconnect();
    }).observe(document.querySelector("#report_docs > tbody"), { childList: true });
}
function main() {
    const url = document.location.href;
    const bak = (document.querySelector("#ISU_POPUP") === null);
    if ((url.includes('ST_FORM') || url.includes('=2175:2:')) && bak) {
        addCheckButton("Олимпиады", "PERS_UPDATE", () => window.open(addAllOlympsCheck(), '_blank'));
        addCheckButton("ГТО", "PERS_UPDATE", () => window.open(gtoCheck(), '_blank'));
    }
    else if (url.includes('APPLICATIONS') || url.includes('=2175:4:')) {
        checkAPPL();
        window.addEventListener('hashchange', checkAPPL);
    }
    else if (url.includes('SU_OFFICE') || url.includes('=2175:5:')) {
        const LK_UPD = getElem.id('LK_UPDATE');
        const DZCH = getElem.input('LK_DELO_0');
        if ((LK_UPD !== null) && bak) {
            LK_UPD.onclick = checkBVIwoAgree;
        }
        if (DZCH !== null) {
            autoPhotoCopy(DZCH);
        }
    }
    else if (url.includes('ELECTRONIC_DOCUMENT') || url.includes('=2175:80:')) {
        addCheckButton("Скачать всё", "report_R3997083729921636026", openAllDocs);
    }
    else if (url.includes('=2175:81:')) {
        setWidth();
    }
}
main();
