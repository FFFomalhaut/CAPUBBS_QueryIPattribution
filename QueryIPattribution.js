// ==UserScript==
// @name         CAPUBBS QueryIPattribution
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  rt
// @author       FFFomalhaut
// @match        https://*.chexie.net/bbs/online/*
// @icon         https://chexie.net/assets/images/capu.jpg
// @grant        none
// @require      https://chexie.net/assets/js/jquery.min.js
// @require      file:///C:/Users/admin/Desktop/PlayWithBBS/QueryIPattribution/data-utf8.js
// ==/UserScript==

(function() {
    'use strict';
    /* global data, $ */

    function compare(ip1, ip2) {
        var list1 = ip1.split(".");
        var list2 = ip2.split(".");
        var oct1,oct2,i=0;
        while ((oct1=parseInt(list1[i])) && (oct2=parseInt(list2[i])) && ++i) {
            if (oct1 < oct2) {
                return -1;
            }
            if (oct1 > oct2) {
                return 1;
            }
        }
        return 0;
    }

    function locate(ip) {
        if (ip.includes(":")) {
            return "-无IPv6数据-";
        }
        var l=0, r=data.length;
        while (l<r) {
            var mid = (l+r)/2 |0
            if (compare(ip,data[mid][0]) == -1) {
                r=mid;
            }
            else if (compare(ip,data[mid][1]) == 1) {
                l=mid+1;
            }
            else {
                return data[mid][2];
            }
        }
    }

    if ($("tr:first").children().length == 6) {
        $("colgroup > :eq(2)").after($("<col width='130'>"));
        $("tr:first >:eq(2)").after($("<th>IP归属地</th>"));
        $("tbody").children().not(":first").each(function(i,tr) {
            var td_ip = tr.childNodes[2];
            try {
                var location = locate(td_ip.innerHTML).replace(" ","<br>");
            } catch (Error) {
                location = "发生错误";
            }
            $(tr).children().eq(2).after($("<td></td>").html(location));
        })
        $("tbody").append($("<tr><td colspan='6'>归属地数据来源：纯真IP地址数据库</td></tr>"));
        $("tbody").append($("<tr><td colspan='6'>最后更新：2023年08月23日</td></tr>"));
    }

    // Your code here...
})();
