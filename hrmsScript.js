// ==UserScript==
// @name         HRMS Buffer Minutes Only
// @namespace    https://github.com/dipesh-mvpl/hrms-tampermonkey
// @version      4.0
// @description  Show buffer time (HH:mm) till 07:30 PM
// @match        https://hrms.microvistatech.com/*
// @updateURL    https://raw.githubusercontent.com/dipesh-mvpl/HRMS-Time/main/hrmsScript.js
// @downloadURL  https://raw.githubusercontent.com/dipesh-mvpl/HRMS-Time/main/hrmsScript.js
// @grant        none
// ==/UserScript==

/* =========================================================
   HELPERS
   ========================================================= */
function toHHMM(min) {
    const sign = min < 0 ? "-" : "";
    min = Math.abs(min);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return sign + String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

/* =========================================================
   DASHBOARD LOGIC
   ========================================================= */
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

        const officeLeave = new Date(expectedTime);
        officeLeave.setHours(19, 30, 0, 0);

        const bufferMinutes = Math.round((officeLeave - expectedTime) / 60000);

        const bufferLine = remainingElement.cloneNode(true);
        bufferLine.innerText = toHHMM(bufferMinutes);

        remainingElement.insertAdjacentElement("afterend", bufferLine);
    }

    setTimeout(run, 1200);

})();

/* =========================================================
   MODAL LOGIC
   ========================================================= */
(function () {

    const TOTAL_REQUIRED = 510;
    const OFFICE_END = 19 * 60 + 30;

    function toMinutes(hm) {
        const [h, m] = hm.split(":").map(Number);
        return h * 60 + m;
    }

    function calculateAndInject() {
        const modal = document.querySelector("#inOutDetailsModel");
        if (!modal) return;

        const rows = modal.querySelectorAll("table tbody tr");
        if (rows.length < 2) {
            setTimeout(calculateAndInject, 300);
            return;
        }

        const dateLabel = modal.querySelector("label");
        if (!dateLabel || dateLabel.dataset.bufferAdded) return;

        let workedMinutes = 0;
        let lastOutTime = null;
        let lastIn = null;

        rows.forEach(r => {
            const td = r.querySelectorAll("td");
            if (td.length !== 2) return;

            const time = td[0].innerText.trim();
            const status = td[1].innerText.trim().toLowerCase();
            if (!/^\d{2}:\d{2}$/.test(time)) return;

            const minutes = toMinutes(time);

            if (status === "in") lastIn = minutes;

            if (status === "out" && lastIn !== null) {
                workedMinutes += minutes - lastIn;
                lastOutTime = minutes;
                lastIn = null;
            }
        });

        if (lastIn !== null) {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            workedMinutes += nowMinutes - lastIn;
            lastOutTime = nowMinutes;
        }

        const remaining = TOTAL_REQUIRED - workedMinutes;
        const expectedEnd = remaining > 0
            ? (lastOutTime ?? 0) + remaining
            : lastOutTime;

        let buffer = OFFICE_END - expectedEnd;

        if (lastIn === null && lastOutTime !== null) {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            buffer -= Math.max(0, nowMinutes - lastOutTime);
        }

        const span = document.createElement("span");
        span.style.marginLeft = "10px";
        span.style.fontWeight = "600";
        span.innerText = toHHMM(buffer);

        dateLabel.appendChild(span);
        dateLabel.dataset.bufferAdded = "true";
    }

    document.addEventListener("click", function (e) {
        if (e.target?.innerText?.trim() === "View Log") {
            setTimeout(() => {
                const label = document.querySelector("#inOutDetailsModel label");
                if (label) delete label.dataset.bufferAdded;
                calculateAndInject();
            }, 400);
        }
    });

})();
