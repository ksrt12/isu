"use strict";
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
