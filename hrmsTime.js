// ==UserScript==
// @name         HRMS Buffer Minutes Only
// @namespace    https://github.com/dipesh-mvpl/hrms-tampermonkey
// @version      3.4
// @description  Show ONLY buffer minutes till 07:30 PM (no time display)
// @match        https://hrms.microvistatech.com/EmployeeDashBoard/*
// @updateURL    https://raw.githubusercontent.com/dipesh-mvpl/HRMS-Time/main/hrmsTime.js
// @downloadURL  https://raw.githubusercontent.com/dipesh-mvpl/HRMS-Time/main/hrmsTime.js
// @grant        none
// ==/UserScript==
/* eslint-disable */

(function () {
    const _a1 = /(\d{1,2}):(\d{2}):(\d{2})/;
    const _a2 = 510;
    const _a3 = 19;
    const _a4 = 30;

    function _b1(_t) {
        const _m = _t.match(_a1);
        if (!_m) return null;
        return parseInt(_m[1], 10) * 60 + parseInt(_m[2], 10);
    }

    function _b2() {
        const _els = document.querySelectorAll("*");
        let _work = null;
        let _remain = null;

        for (const _el of _els) {
            const _txt = _el.innerText && _el.innerText.trim();
            if (!_txt) continue;

            if (/Working\s*Hours/i.test(_txt)) {
                const _v = _b1(_txt);
                if (_v !== null) _work = _v;
            }

            if (/Remaining\s*Hours/i.test(_txt)) {
                _remain = _el;
            }
        }

        if (_work === null || !_remain) return;

        const _now = new Date();
        const _login = new Date(_now.getTime() - _work * 60000);
        const _expected = new Date(_login.getTime() + _a2 * 60000);

        const _leave = new Date(_expected);
        _leave.setHours(_a3, _a4, 0, 0);

        const _buffer = Math.round((_leave - _expected) / 60000);

        const _line = _remain.cloneNode(true);
        _line.innerText =
            _buffer > 0 ? `${_buffer}` :
            _buffer < 0 ? `${Math.abs(_buffer)} min overtime` :
            `0 min`;

        _remain.insertAdjacentElement("afterend", _line);
    }

    setTimeout(_b2, 1500);
})();

