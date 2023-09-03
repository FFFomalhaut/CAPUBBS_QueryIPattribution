// ==UserScript==
// @name         CAPUBBS QueryIPattribution
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  增加了一个可以免费查询的api，ipv4和ipv6都能查。但ipv4下校园网识别不佳。
// @author       FFFomalhaut
// @match        https://*.chexie.net/bbs/online/*
// @icon         https://chexie.net/assets/images/capu.jpg
// @grant        none
// @require      https://chexie.net/assets/js/jquery.min.js
// @require      file:///C:/Users/admin/Desktop/PlayWithBBS/QueryIPattribution/data-utf8.js
// ==/UserScript==

(function() {
    'use strict';
    /* global localData, $ */

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

    function locateAndFill_api(td_ip) {
        $.get("https://api.mir6.com/api/ip",{
            "ip": td_ip.innerHTML,
            "type": "json",
        }, "json").done(function (data) {
            var attribution = data.data.location +"<br>"+ data.data.isp +"<br>"+ data.data.net;
            $(td_ip).next().html(attribution);
        }).fail(function(errorThrown) {
            $(td_ip).next().html(errorThrown);
        })
    }

    function locateAndFill_local(td_ip) {
        var l=0, r=localData.length;
        var ip = td_ip.innerHTML;
        while (l<r) {
            var mid = (l+r)/2 |0
            if (compare(ip,localData[mid][0]) == -1) {
                r=mid;
            }
            else if (compare(ip,localData[mid][1]) == 1) {
                l=mid+1;
            }
            else {
                var attribution = localData[mid][2].replace(" ","<br>");
                $(td_ip).next().html(attribution);
                return;
            }
        }
    }

    if ($("tr:first").children().length == 6) {
        $("colgroup > :eq(2)").after($("<col width='200'>"));
        $("tr:first > :eq(2)").after($("<th>IP归属地</th>"));
        $("tbody").children().not(":first").each(function(i,tr) {
            var td_ip = tr.childNodes[2];
            $(td_ip).after($("<td></td>"));
            locateAndFill_api(td_ip);
        })
        $("tbody").append($("<tr><td id='v4' colspan='6'>IPv4归属地数据来源：<a href='https://api.mir6.com' target='_blank'>api.mir6.com</a></td></tr>"));
        $("tbody").append($("<tr><td id='v6' colspan='6'>IPv6归属地数据来源：<a href='https://api.mir6.com' target='_blank'>api.mir6.com</a></td></tr>"));
        $("table").after($(
            `<div>
                选择IPv4数据来源
                <select id='select' onchange=reload()>
                    <option value='cz88'>cz88.net</option>
                    <option value='mir' selected>api.mir6.com</option>
                </select>
            </div>`
        ));
    }

    window.reload = function() {
        var href;
        if ($("#select").prop("selectedIndex") == 0) {
            $("tbody").children().slice(1,-2).each(function(i,tr) {
                var td_ip = tr.childNodes[2];
                if (td_ip.innerHTML.includes(":")) {
                    return;
                }
                locateAndFill_local(td_ip);
            });
	    href = $("#select > option").eq(0).html();
        } else if ($("#select").prop("selectedIndex") == 1) {
            $("tbody").children().slice(1,-2).each(function(i,tr) {
                var td_ip = tr.childNodes[2];
                if (td_ip.innerHTML.includes(":")) {
                    return;
                }
                locateAndFill_api(td_ip);
            });
	    href = $("#select > option").eq(1).html();
        }
        $("#v4").html("IPv4归属地数据来源：<a href='https://"+href+"' target='_blank'>"+href+"</a>");
    }

    // Your code here...
})();
