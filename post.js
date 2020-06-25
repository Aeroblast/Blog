//For nodejs , not web page
const fs = require("fs");
var aes = require("./aes");
var args = process.argv.splice(2);
var stamp;
var filename;
SetTimeString();
let data = fs.readFileSync("temp.atxt");
let blog_len = CleanText(data.toString()).replace("\n", "").replace("\r", "").length;
data += "\n[time]" + stamp + "[/time]";
let blog_path = "Text/" + filename + ".atxt";
let record = filename + "," + blog_len + ",";
let reg_title = /\[title\](.*?)\[\/title\]/;
let title_match = data.match(reg_title);
if (title_match != null) {
    record += title_match[1];
}
console.log(record);
if (args.length > 1) {
    let pw = args[1];
    if (args[0] == 'en') {
        let encrypted = aes.encrypt(pw + "\n" + data, pw).toString();
        fs.writeFileSync(blog_path, "ENCRYPTED\n" + encrypted);
        fs.appendFileSync("index.txt", record + "\n");
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
    fs.writeFileSync(blog_path, data);
    fs.appendFileSync("index.txt", record + "\n");
}




function SetTimeString() {
    let d = new Date();
    let y = "" + d.getFullYear();
    let dd = d.getDate(); if (dd < 10) dd = "0" + dd;
    let mm = d.getMonth(); mm++; if (mm < 10) mm = "0" + mm;
    let hh = d.getHours(); if (hh < 10) hh = "0" + hh;
    let mi = d.getMinutes(); if (mi < 10) mi = "0" + mi;
    let ss = d.getSeconds(); if (ss < 10) ss = "0" + ss;
    stamp = y + mm + dd + " " + hh + ":" + mi + ":" + ss;
    filename = y + mm + dd + "_" + hh + mi;
}
function CleanText(atext) {
    let lines = atext.split('\n');
    let result = "";
    var reg = [
        [/\[align=(.*?)\](.*?)\[\/align\]/i, "$2"],
        [/\[note\]/, ""],
        [/\[note=(.*?)\]/, ""],
        [/\[img\](.*?)\[\/img\]/, ""],
        [/\[img=(.*?),(.*?)\](.*?)\[\/img\]/, ""],
        [/\[b\](.*?)\[\/b\]/, "$1"],
        [/\[title\](.*?)\[\/title\]/, "$1"],
        [/\[ruby=(.*?)\](.*?)\[\/ruby\]/, "$2$1"],
        [/(\/\*.*?\*\/)/, ""],
        [/\/\/\/.*/, ""],
        [/\[emphasis\](.*?)\[\/emphasis\]/, "$1"],
        [/\[s\](.*?)\[\/s\]/, "$1"],
        [/\[time\](.*?)\[\/time\]/, ""],
        [/\[h1\](.*?)\[\/h1\]/, "$1"],
        [/\[h2\](.*?)\[\/h2\]/, "$1"],
        [/\[h3\](.*?)\[\/h3\]/, "$1"],
        [/\[h4\](.*?)\[\/h4\]/, "$1"],
        [/\[h5\](.*?)\[\/h5\]/, "$1"],
        [/\[size=(.*?)\](.*?)\[\/size\]/, "$2"],
        [/\[link=(.*?)\](.*?)\[\/link\]/, "$2"],
        [/\[ASIN\](.*?)\[\/ASIN\]/, ""],
        [/\[ASIN=(.*?)\](.*?)\[\/ASIN\]/, "<$2"],
        [/\[spoiler\]/, ""],
        [/\[\/spoiler\]/, ""],
        [/\[quote\]/, ""],
        [/\[\/quote\]/, ""],
        [/\[mask\](.*?)\[\/mask\]/, "$1"]
    ];
    lines.forEach(line => {
        let r = line;
        var matched = true;
        while (matched) {
            matched = false;
            for (var i = 0; i < reg.length; i++) {
                var match = reg[i][0].exec(r);
                if (match != null) {
                    var rep = reg[i][1];
                    switch (i) {
                        case 2://[note=...]
                            r = r.replace(reg[i][0], rep);
                            break;
                        default:
                            r = r.replace(reg[i][0], rep);
                            break;
                    }
                    matched = true;

                    break;
                }
            }


        }//end of while
        result += r;
    });
    return result;
}