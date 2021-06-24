const sharedDatetimeFormat = new Intl.DateTimeFormat('zh-CN-u-hc-h24', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
}
function isNum(char) {
    return char >= '0' && char <= '9';
}
function TryGetDate(str) {
    let year = 0, month = 0, day = 0, hours = 0, minutes = 0, seconds = 0;
    let p = 0;
    let d = 0;
    let temp = "";
    while (str.length > p) {
        if (isNum(str[p])) {
            temp += str[p];
            d++;
            if (d == 4) { year = parseInt(temp); temp = ""; }
            if (d == 6) { month = parseInt(temp) - 1; temp = ""; }
            if (d == 8) { day = parseInt(temp); temp = ""; }
            if (d == 10) { hours = parseInt(temp); temp = ""; }
            if (d == 12) { minutes = parseInt(temp); temp = ""; }
            if (d == 14) { seconds = parseInt(temp); temp = ""; }
        }
        p++;
    }
    if (d < 8) return null;
    return new Date(year, month, day, hours, minutes, seconds, 0);
}
function ReplaceEntity(c) {
    return c.replace('<', '&lt;').replace('>', '&rt;');
}