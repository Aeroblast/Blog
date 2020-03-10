//For nodejs , not web page
const fs = require("fs");
var aes = require("./aes");
var args = process.argv.splice(2);
var stamp;
var filename;
SetTimeString();
let data = fs.readFileSync("temp.atxt");
data += "\n[time]" + stamp + "[/time]";
if (args.length > 1) {
    let pw = args[1];
    if (args[0] == 'en') {
        let encrypted = aes.encrypt(pw + "\n" + data, pw).toString();
        fs.writeFileSync("Text/" + filename + ".atxt", "ENCRYPTED\n" + encrypted);
        fs.appendFileSync("index.txt", "\n" + filename + ",");
    }
    if (args[0] == 'de') {
        let ds = data.split('\n');
        if (ds[0] == 'ENCRYPTED') {
            let decrypted = aes.decrypt(ds[1], pw).toString(aes.enc);
            if (pw == decrypted.split('\n')[0]) {
                console.log('Success');
                fs.writeFileSync('temp_decrypted.atxt', decrypted.substring(decrypted.indexOf('\n') + 1));
            }
        }
    }


} else {
    fs.writeFileSync("Text/" + filename + ".atxt", data);
    fs.appendFileSync("index.txt", "\n" + filename + ",");
}




function SetTimeString() {
    let d = new Date();
    let y = "" + d.getFullYear();
    let dd = d.getDate(); if (dd < 10) dd = "0" + dd;
    let mm = d.getMonth(); mm++;if (mm < 10) mm = "0" + mm;
    let hh = d.getHours(); if (hh < 10) hh = "0" + hh;
    let mi = d.getMinutes(); if (mi < 10) mi = "0" + mi;
    let ss = d.getSeconds(); if (ss < 10) ss = "0" + ss;
    stamp = y + mm + dd + " " + hh + ":" + mi + ":" + ss;
    filename = y + mm + dd + "_" + hh + mi;
}