"use strict";
// ==UserScript==
// @name        ГТО
// @version     1.1
// @date        2021-09-01
// @author      kazakovstepan
// @namespace   ITMO University
// @description Let's do it
// @homepage    https://vk.com/kazakovstepan
// @icon        https://www.gto.ru/bundles/gtofront/img/logo-h4.png
// @updateURL   https://isu.ksrt12.ru/scripts/gto.user.js
// @downloadURL https://isu.ksrt12.ru/scripts/gto.user.js
// @include     https://www.gto.ru/sign/*LN*
// @exclude     https://www.gto.ru/sign/check#result
// @run-at      document-end
// @grant       none
// ==/UserScript==
function load_params() {
    let params = decodeURIComponent(window.location.search.replace('?', '')).split('&').reduce((p, e) => {
        const [key, val] = e.split('=');
        p[key] = val;
        return p;
    }, {});
    params.NAME = `${params.LN} ${params.FN} ${params.MN}`;
    return params;
}
window.addEventListener("load", () => {
    const params = load_params();
    if (params) {
        document.querySelector("#gto_front_feedback_name").value = params.NAME;
        document.querySelector("#gto_front_feedback_birthday").value = params.BD;
        document.querySelector("#gto_front_feedback_submit").click();
    }
});
