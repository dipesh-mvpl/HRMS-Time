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

(function(_0x5e4a2d,_0x3c1a47){const _0x2f1e=function(_0x4b5a7c){while(--_0x4b5a7c){_0x5e4a2d['push'](_0x5e4a2d['shift']());}};_0x2f1e(++_0x3c1a47);}(_0x4b32,0x1a3));
const _0x19d3=function(_0x5a2b,_0x3c12){_0x5a2b=_0x5a2b-0x0;let _0x4b32e=_0x4b32[_0x5a2b];return _0x4b32e;};
(function(){function _0x2b91(_0x1d2c){const _0x4c5a=_0x1d2c[_0x19d3('0x3')](/(\d{1,2}):(\d{2}):(\d{2})/);if(!_0x4c5a)return null;return parseInt(_0x4c5a[1],10)*60+parseInt(_0x4c5a[2],10);}function _0x59c3(){const _0x43b=document[_0x19d3('0x1')]('*');let _0x2a41=null;let _0x41de=null;_0x43b.forEach(_0x3e1d=>{var _0x4a6b;const _0x2c8e=(_0x4a6b=_0x3e1d[_0x19d3('0x2')])===null||_0x4a6b===void 0?void 0:_0x4a6b.trim();if(!_0x2c8e)return;if(/Working\s*Hours/i.test(_0x2c8e)){const _0x5c72=_0x2b91(_0x2c8e);if(_0x5c72!==null)_0x2a41=_0x5c72;}if(/Remaining\s*Hours/i.test(_0x2c8e))_0x41de=_0x3e1d;});if(_0x2a41===null||!_0x41de)return;const _0x55f6=510;const _0x1c92=new Date();const _0x5d43=new Date(_0x1c92.getTime()-_0x2a41*60000);const _0x3b5f=new Date(_0x5d43.getTime()+_0x55f6*60000);const _0x28de=new Date(_0x3b5f);_0x28de.setHours(19,30,0,0);const _0x4c92=Math.round((_0x28de-_0x3b5f)/60000);const _0x3f2e=_0x41de.cloneNode(true);_0x4c92>0?_0x3f2e.innerText=`${_0x4c92}`:_0x4c92<0?_0x3f2e.innerText=`${Math.abs(_0x4c92)} min overtime`:_0x3f2e.innerText='0 min';_0x41de.insertAdjacentElement('afterend',_0x3f2e);}setTimeout(_0x59c3,1200);}());
function _0x4b32(){return ['match','querySelectorAll','innerText','replace'];}
