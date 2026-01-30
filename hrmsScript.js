// ==UserScript==
// @name         HRMS Buffer Minutes Only
// @namespace    https://github.com/dipesh-mvpl/hrms-tampermonkey
// @version      3.5
// @description  Show ONLY buffer minutes till 07:30 PM (no time display)
// @match        https://hrms.microvistatech.com/*
// @updateURL    https://raw.githubusercontent.com/dipesh-mvpl/HRMS-Time/main/hrmsScript.js
// @downloadURL  https://raw.githubusercontent.com/dipesh-mvpl/HRMS-Time/main/hrmsScript.js
// @grant        none
// ==/UserScript==

/* =========================================================
   DASHBOARD LOGIC (UNCHANGED)
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

        // Fixed office leave time → 07:30 PM
        const officeLeave = new Date(expectedTime);
        officeLeave.setHours(19, 30, 0, 0);

        const bufferMinutes = Math.round((officeLeave - expectedTime) / 60000);

        const bufferLine = remainingElement.cloneNode(true);

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

/* =========================================================
   MODAL LOGIC (BREAK-AWARE, CLICK BASED)
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
        if (rows.length < 3) {
            // Modal loads async → retry
            setTimeout(calculateAndInject, 300);
            return;
        }

        const dateLabel = modal.querySelector("label");
        if (!dateLabel || dateLabel.dataset.bufferAdded) return;

        let firstIn = null;
        let breakMinutes = 0;

        // Find first IN
        rows.forEach(r => {
            const td = r.querySelectorAll("td");
            if (td.length !== 2) return;

            const time = td[0].innerText.trim();
            const status = td[1].innerText.trim().toLowerCase();

            if (status === "in" && /^\d{2}:\d{2}$/.test(time) && firstIn === null) {
                firstIn = toMinutes(time);
            }
        });

        if (firstIn === null) return;

        // Calculate breaks (out → next in)
        for (let i = 0; i < rows.length - 1; i++) {
            const cur = rows[i].querySelectorAll("td");
            const next = rows[i + 1].querySelectorAll("td");

            if (cur.length !== 2 || next.length !== 2) continue;

            const curTime = cur[0].innerText.trim();
            const curStatus = cur[1].innerText.trim().toLowerCase();
            const nextTime = next[0].innerText.trim();
            const nextStatus = next[1].innerText.trim().toLowerCase();

            if (
                curStatus === "out" &&
                nextStatus === "in" &&
                /^\d{2}:\d{2}$/.test(curTime) &&
                /^\d{2}:\d{2}$/.test(nextTime)
            ) {
                breakMinutes += toMinutes(nextTime) - toMinutes(curTime);
            }
        }

        const expectedEnd = firstIn + TOTAL_REQUIRED + breakMinutes;
        const buffer = OFFICE_END - expectedEnd;

        const span = document.createElement("span");
        span.style.marginLeft = "10px";
        span.style.fontWeight = "600";

        span.innerText =
            buffer > 0 ? `${buffer}`
          : buffer < 0 ? `(Overtime: ${Math.abs(buffer)})`
          : `(0 min)`;

        dateLabel.appendChild(span);
        dateLabel.dataset.bufferAdded = "true";
    }

    // Hook View Log click (SPA-safe)
    document.addEventListener("click", function (e) {
        if (e.target?.innerText?.trim() === "View Log") {
            setTimeout(() => {
                const modal = document.querySelector("#inOutDetailsModel");
                const label = modal?.querySelector("label");
                if (label) delete label.dataset.bufferAdded;

                calculateAndInject();
            }, 400);
        }
    });

})();
