// ==UserScript==
// @name        Абитуриент
// @version     6.8.3
// @date        2020-12-27
// @author      kazakovstepan
// @namespace   ITMO University
// @description IT's MOre than the Система Абитуриент
// @homepage    https://vk.com/kazakovstepan
// @icon        https://snegiry.art/favicon.ico
// @updateURL   https://snegiry.art/isu/abit.user.js
// @downloadURL https://snegiry.art/isu/abit.user.js
// @include     https://isu.ifmo.ru/pls/apex/f?p=2175:*
// @run-at      document-end
// @grant       none
// ==/UserScript==

function getID(someID) {
    return document.getElementById(someID);
}

function NotifyErr(str) {
    G2.notify(str, 'Ошибка', true);
}

function NotifyWarn(str) {
    G2.notify(str, null, false, true);
}

function NotifyInfo(str) {
    G2.notify(str);
}

function getSelectedText(elem) {
    return elem.options[elem.options.selectedIndex].text;
}

// make buttons
function addCheckButton(str, ISUid, func) {
    let ISUELEM = getID(ISUid);
    if ((ISUELEM !== null) && (getID("ButCheck") === null)) {
        let CheckButton = document.createElement("button");
        CheckButton.id = "ButCheck";
        CheckButton.value = str;
        CheckButton.className = "btn btn-labeled";
        CheckButton.type = "button";
        CheckButton.style.marginRight = "5px";
        ISUELEM.parentNode.insertBefore(CheckButton, ISUELEM);
        let span = document.createElement("span");
        span.className = "btn-label icon fa fa-refresh";
        CheckButton.appendChild(span);
        CheckButton.appendChild(document.createTextNode(str));
        CheckButton.onclick = func;
    }
}

// generate link for checking all olymps
function addAllOlympsCheck() {
    let LN = getID('ST_LASTNAME').value;
    let FN = getID('ST_FIRSTNAME').value;
    let MN = getID('ST_MIDDLENAME').value;
    let BD = getID('ST_DOB').value.split('.');
    let DN = getID('P2_DELO').value;
    return 'https://snegiry.art/abit/?LN=' + LN + '&FN=' + FN + '&MN=' + MN + '&BDD=' + BD[0] + '&BDM=' + BD[1] + '&BDY=' + BD[2] + '&DN=' + DN;
}

function getONUM() {
    return getID('OLYMP_NUM').value.replace(/[. -]+/g, "");
}

// generate link for checking current olymp
function addOlympCheck() {
    let OLYMPNUM = getONUM();
    let OLYMPYEAR = getID('OLYMP_YEAR').value;
    return (OLYMPNUM.startsWith('0000')) ? ((OLYMPYEAR === '2020') || (OLYMPYEAR === '2019') || (OLYMPYEAR === '2018')) ? 'https://snegiry.art/files/' +
        OLYMPYEAR + '.pdf' : 'https://www.google.ru/' : 'https://diploma.rsr-olymp.ru/files/rsosh-diplomas-static/compiled-storage-' +
        OLYMPYEAR + '/by-code/' + OLYMPNUM + '/white.pdf';
}

// set checkboxes automatically if 'LK_DELO_0' is checked
function autophotocopy(DZCH) {
    let LK_PHOTO = getID('LK_PHOTO_0');
    let LK_COPY = getID('LK_PODL_COPY_0');
    DZCH.onclick = function() {
        LK_PHOTO.checked = DZCH.checked;
        LK_COPY.checked = DZCH.checked;
    };
}

// set default EGE date for subject
function sedate(subIndex) {
    let EGEDATE = getID('EGE_DATE');
    if (EGEDATE.selectedIndex === 0) {
        switch (subIndex) {
            case 4:
                EGEDATE.selectedIndex = 6;
                break;
            default:
                EGEDATE.selectedIndex = 5;
                break;
        }
    }
    delete(EGEDATE);
}

// parsing page for 'ege_form'
function autoEGE() {
    let EGESUBJ = getID('EGE_SUBJ');
    let EGEFORM = getID('ege_form');
    if (EGEFORM !== null) {
        EGEFORM.onclick = function() {
            sedate(EGESUBJ.selectedIndex);
        };
    }
}

// add check button for current olymp
function listenOLYMP() {
    if ((getID('ButCheck') === null) && (getID('OLYMP_DELETE') !== null) && (getONUM() !== "")) {
        addCheckButton("Печать", "OLYMP_DELETE", function() {
            window.open(addOlympCheck(), '_blank');
        });
    }
}

// check BVI without agree
function checkBVIwoAGREE() {
    let orig = getID('LK_PODL_0').checked;
    let agree = getSelectedText(getID('LK_AGREE')).substr(0, 8);
    for (let i of document.querySelectorAll("#report_rating_rep > tbody > tr")) {
        if (i.querySelector('td:nth-child(5)').innerText === 'без вступительных испытаний') {
            if (agree !== i.querySelector('td:nth-child(2)').innerText.substr(0, 8)) {
                NotifyErr('БВИ без согласия!');
            }
            if (!orig) {
                NotifyErr('БВИ без оригинала!');
            }
        }
    }
}

// get min points for current stream
function getMinPoints(stream) {
    let points, math, subj;
    if (stream === '01.03.02') {
        math = 76;
    } else {
        math = 62;
    }
    let minpoints = {
        'Математика': math,
        'Русский язык': 60
    };
    if ((stream === '12.03.03') || (stream === '16.03.01') ||
        (stream === '12.05.01') || (stream === '16.03.03')) {
        points = 60;
        subj = 'Физика';
    } else if ((stream === '18.03.02') || (stream === '19.03.01')) {
        points = 60;
        subj = 'Химия';
    } else if (stream === '12.03.04') {
        points = 60;
        subj = 'Биология';
    } else if (stream === '38.03.05') {
        points = 60;
        subj = 'Обществознание';
    } else if ((stream === '27.03.05') || (stream === '45.03.04')) {
        points = 60;
        subj = 'Иностранный язык';
    } else if (stream === '01.03.02') {
        points = 75;
        subj = 'Информатика';
    } else {
        points = 61;
        subj = 'Информатика';
    }
    minpoints[subj] = points;
    return minpoints;
}

// get subjects for VSOSH
function getVSEROS(stream) {
    let vsosh = { 'Математика': true };
    let subj;
    switch (stream) {
        case '01.03.02':
        case '09.03.01':
        case '09.03.02':
        case '09.03.03':
        case '09.03.04':
        case '10.03.01':
        case '11.03.02':
        case '11.03.03':
        case '12.03.01':
        case '13.03.02':
        case '14.03.01':
        case '15.03.04':
        case '15.03.06':
        case '24.03.02':
        case '27.03.04':
        case '44.03.04':
            subj = ["Информатика"];
            break;
        case '12.03.04':
        case '18.03.02':
        case '19.03.01':
            subj = ["Химия", "Биология"];
            break;
        case '12.03.02':
        case '12.03.03':
        case '12.03.05':
        case '12.05.01':
        case '16.03.01':
        case '16.03.03':
        case '23.03.03':
            subj = ["Физика", "Астрономия"];
            break;
        case '45.03.04':
            subj = ["Иностранный язык", "Информатика"];
            break;
        case '27.03.05':
            subj = ["Иностранный язык", "Обществознание", "Право"];
            break;
        case '38.03.05':
            subj = ["Экономика", "Обществознание", "Право"];
            break;
    }
    for (let i of subj) {
        vsosh[i] = true;
    }
    return vsosh;
}

// get EGE points
function loadEGEpoints() {
    let EGE_points = {};
    for (let i of document.querySelectorAll("#report_baki_ege_rep > tbody > tr")) {
        EGE_points[i.querySelector('td:nth-child(2)').innerText] = Number(i.querySelector('td:nth-child(4)').innerText);
    }
    return EGE_points;
}

// get olymps
function loadOLYMPS() {
    let OLYMPSbyName = {};
    for (let i of document.querySelectorAll("#report_olymp_rep > tbody > tr > td:nth-child(1)")) {
        let a = i.innerText;
        let olymp_subj = a.substring(a.indexOf(' (') + 2, a.indexOf(', '));
        let olymp_name = a.substring(0, a.indexOf(' ('));
        OLYMPSbyName[olymp_name] = olymp_subj;
    }
    return OLYMPSbyName;
}

// check current stream
function checkSTREAM() {
    let points, err_mes, err_count = 0,
        warn_count = 0,
        sum = 0;
    let EGE_points = loadEGEpoints();
    let OLYMPSbyName = loadOLYMPS();
    let annul = (getID('APPL_STATUS').selectedIndex === 1);
    let annul_text = 'Аннулировано ' + getID('APPL_ANN').textContent;
    let curr_stream = getSelectedText(getID('APPL_PROG')).substr(0, 8);
    let curr_olymp = getSelectedText(getID('APPL_OLYMP'));
    let minpoints = getMinPoints(curr_stream);
    let appl_usl = getID('APPL_USL').selectedIndex;
    let isBVI = (appl_usl === 1);
    let isOlymps = (getID('report_olymp_rep') !== null);

    if (getID('APPL_MEGA_N').selectedIndex === 1) {
        NotifyErr(curr_stream + ': ИМРИП поменять на ТИНТ!')
    } else {
        if (isBVI) {
            // БВИ
            if (isOlymps) {
                if (OLYMPSbyName[curr_olymp] === 'Русский язык') {
                    NotifyErr(curr_olymp + ' (Русский язык)\n Не даёт БВИ!');
                    err_count++;
                }
            } else {
                NotifyErr('Нет олимпиад!');
                err_count++;
            }
            sum = 'БВИ';
        } else if (appl_usl === 4) {
            NotifyInfo('Гос. линия');
        } else {
            // не БВИ
            for (let subj in minpoints) {
                points = EGE_points[subj];
                console.log(subj + ' ' + minpoints[subj] + ':' + points);
                if (points === undefined) {
                    err_mes = 'Нет ЕГЭ! (' + subj + ')';
                } else if (points < minpoints[subj]) {
                    err_mes = curr_stream + ': ' + subj + ': ' + points + '\nМинимальный балл: ' + minpoints[subj];
                } else {
                    sum += points;
                }
                if (err_mes) {
                    if (annul) {
                        NotifyInfo(annul_text + ':\n' + err_mes);
                        err_count = 0;
                        warn_count++;
                    } else {
                        NotifyErr(err_mes);
                        err_count++;
                    }
                }
                err_mes = null;
            }
            if (appl_usl === 3) {
                if (sum < 250) {
                    err_mes = 'Минимальная сумма баллов для целевого: 250! (' + sum + ')';
                    if (annul) {
                        NotifyInfo(annul_text + ':\n' + err_mes);
                        err_count = 0;
                        warn_count++;
                    } else {
                        NotifyErr(err_mes);
                        err_count++;
                    }
                }
            }
            sum = 'ЕГЭ: ' + sum;
            if (warn_count !== 0) {
                annul = false;
                err_mes = true;
            }
        }
        if (isOlymps) {
            if (curr_olymp === '...') {
                if (isBVI) {
                    NotifyErr('БВИ без олимпиады!');
                    err_count++;
                } else {
                    NotifyWarn('Обнаружены непроставленные олимпиады');
                }
            } else {
                let curr_subj = OLYMPSbyName[curr_olymp];
                if (curr_olymp === 'Всероссийская олимпиада школьников') {
                    if (getVSEROS(curr_stream)[curr_subj]) {
                        if (isBVI) {
                            NotifyInfo(curr_stream + ': ВСЕРОС!');
                        } else {
                            NotifyErr('ВСЕРОС без БВИ');
                            err_count++;
                        }
                    } else {
                        NotifyErr('Олимпиада не подходит!');
                        err_count++;
                    }
                } else {
                    points = EGE_points[curr_subj];
                    if ((points < 75) || (points === undefined)) {
                        NotifyErr('Олимпиада не подтверждена! (' + curr_subj + ': ' + points + ')');
                        err_count++;
                    }
                }
            }
        }
        if (err_count === 0) {
            if (annul) {
                NotifyErr(annul_text);
                NotifyWarn('И зря!');
            } else {
                if (!err_mes) {
                    NotifyInfo(curr_stream + ': OK! (' + sum + ')');
                }
                getID('APPL_UPDATE').click();
            }
        }
    } // ИМРИП
}

// listen application
function checkAPPL() {
    let HASH = document.location.hash;
    if (HASH === '#olymp') {
        document.addEventListener('click', listenOLYMP);
    } else {
        document.removeEventListener('click', listenOLYMP);
    }
    if (HASH === '#appl') {
        console.log("opened appl");
        document.querySelector("#appl_form > div.panel-body").onchange = addCheckButton("Проверить", "APPL_UPDATE", checkSTREAM);
    }
}

function main() {
    let url = document.location.href;
    if ((url.includes('ST_FORM')) || (url.includes('=2175:2:'))) {
        addCheckButton("Проверить олимпиады", "PERS_UPDATE", function() {
            window.open(addAllOlympsCheck(), '_blank');
        });
    } else if ((url.includes('APPLICATIONS')) || (url.includes('=2175:4:'))) {
        autoEGE();
        checkAPPL();
        window.addEventListener('hashchange', checkAPPL);
    } else if ((url.includes('SU_OFFICE')) || (url.includes('=2175:5:'))) {
        let LK_UPD = getID('LK_UPDATE');
        let DZCH = getID('LK_DELO_0');
        if (LK_UPD !== null) {
            LK_UPD.onclick = checkBVIwoAGREE;
        }
        if (DZCH !== null) {
            autophotocopy(DZCH);
        }
    }
}

main();