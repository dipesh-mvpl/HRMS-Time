// ==UserScript==
// @name         HRMS Buffer Minutes Only
// @namespace    https://github.com/dipesh-mvpl/hrms-tampermonkey
// @version      3.4
// @description  Show ONLY buffer minutes till 07:30 PM (no time display)
// @match        https://hrms.microvistatech.com/EmployeeDashBoard/*
// @updateURL    https://raw.githubusercontent.com/dipesh-mvpl/HRMS-Time/main/hrmsScript.js
// @downloadURL  https://raw.githubusercontent.com/dipesh-mvpl/HRMS-Time/main/hrmsScript.js
// @grant        none
// ==/UserScript==

(function () {

    function parseTime(text) {
        const parts = text.match(/(\d{1,2}):(\d{2}):(\d{2})/);
        if (!parts) return null;
        return (parseInt(parts[1], 10) * 60) + parseInt(parts[2], 10);
    }

    function run() {
        const all = document.querySelectorAll("*");

        let workingMinutes = null;
        let remainingElement = null;

        all.forEach(el => {
            const t = el.innerText?.trim();
            if (!t) return;

            if (/Working\s*Hours/i.test(t)) {
                const mins = parseTime(t);
                if (mins !== null) workingMinutes = mins;
            }

            if (/Remaining\s*Hours/i.test(t)) {
                remainingElement = el;
            }
        });

        if (workingMinutes === null || !remainingElement) return;

        const TOTAL_REQUIRED = 510; // 8h 30m

        const now = new Date();
        const loginTime = new Date(now.getTime() - workingMinutes * 60000);
        const expectedTime = new Date(loginTime.getTime() + TOTAL_REQUIRED * 60000);

        // Fixed office leave time → 07:30 PM
        const officeLeave = new Date(expectedTime);
        officeLeave.setHours(19, 30, 0, 0);

        const bufferMinutes = Math.round((officeLeave - expectedTime) / 60000);

        const bufferLine = remainingElement.cloneNode(true);

        // ✅ ONLY MINUTES DISPLAY
        if (bufferMinutes > 0) {
            bufferLine.innerText = `${bufferMinutes}`;
        } else if (bufferMinutes < 0) {
            bufferLine.innerText = `${Math.abs(bufferMinutes)} min overtime`;
        } else {
            bufferLine.innerText = `0 min`;
        }

        remainingElement.insertAdjacentElement("afterend", bufferLine);
    }

    setTimeout(run, 1200);

})();
