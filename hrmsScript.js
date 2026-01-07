// ==UserScript==
// @name         HRMS Expected Completion Time
// @namespace    https://github.com/your-username/hrms-tampermonkey
// @version      3.2
// @description  Show expected completion time + buffer till 07:30 PM (same HRMS style)
// @match        https://hrms.microvistatech.com/EmployeeDashBoard/*
// @updateURL    https://github.com/dipesh-mvpl/HRMS-Time/blob/main/hrmsScript.js
// @downloadURL  https://github.com/dipesh-mvpl/HRMS-Time/blob/main/hrmsScript.js
// @grant        none
// ==/UserScript==

(function() {

    function parseTime(text) {
        const parts = text.match(/(\d{1,2}):(\d{2}):(\d{2})/);
        if (!parts) return null;
        // return total minutes from HH:MM:SS (ignoring seconds for logic)
        return (parseInt(parts[1]) * 60) + parseInt(parts[2]);
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
                if (mins != null) {
                    workingMinutes = mins;
                }
            }

            if (/Remaining\s*Hours/i.test(t)) {
                remainingElement = el;
            }
        });

        if (workingMinutes == null || !remainingElement) return;

        const totalRequired = 510; // 8h 30m (08:30 hrs)

        const now = new Date();
        const loginTime = new Date(now.getTime() - (workingMinutes * 60000));
        const expectedTime = new Date(loginTime.getTime() + (totalRequired * 60000));

        // Expected completion time (e.g. 06:47 PM -> "06:47")
        const formatted = expectedTime.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        const cleanFormatted = formatted
            .replace(/ ?pm/i, "")
            .replace(/ ?am/i, "");

        // ⭐ Line 1: Expected completion time (same style as Remaining Hours)
        const expectedLine = remainingElement.cloneNode(true);
        expectedLine.innerText = cleanFormatted;

       //remainingElement.insertAdjacentElement("afterend", expectedLine);

        // ⭐ Line 2: Buffer time till 07:30 PM
        const officeLeave = new Date(expectedTime);
        officeLeave.setHours(19, 30, 0, 0); // 07:30 PM fixed

        let bufferMinutes = Math.round((officeLeave - expectedTime) / 60000);

        let bufferText;
        if (bufferMinutes > 0) {
            bufferText = "  " + bufferMinutes;
        } else if (bufferMinutes < 0) {
            bufferText = Math.abs(bufferMinutes) + " min extra (overtime)";
        } else {
            bufferText = "  0";
        }

        const bufferLine = remainingElement.cloneNode(true);
        bufferLine.innerText = bufferText;

        //expectedLine.insertAdjacentElement("afterend", bufferLine);
        remainingElement.insertAdjacentElement("afterend", bufferLine);
    }

    setTimeout(run, 1200);

})();
