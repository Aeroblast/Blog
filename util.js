function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
}
function isNum(char) {
    return char >= '0' && char <= '9';
}
function TryGetDate(str) {
    let date = new Date();
    let p = 0;
    let d = 0;
    let temp = "";
    while (str.length > p) {
        if (isNum(str[p])) {
            temp += str[p];
            d++;
            if (d == 4) { date.setFullYear(parseInt(temp)); temp = ""; }
            if (d == 6) { date.setMonth(parseInt(temp) - 1); temp = ""; }
            if (d == 8) { date.setDate(parseInt(temp)); temp = ""; }
            if (d == 10) { date.setHours(parseInt(temp)); temp = ""; }
            if (d == 12) { date.setMinutes(parseInt(temp)); temp = ""; }
            if (d == 14) { date.setSeconds(parseInt(temp)); temp = ""; }
        }
        p++;
    }
    if (d < 8) return null;
    return date;
}
function ReplaceEntity(c) {
    return c.replace('<', '&lt;').replace('>', '&rt;');
}