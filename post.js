//For nodejs , not web page
const fs = require("fs");
const path = require("path");
var aes = require("./aes");
var args = process.argv.splice(2);

/**
command
post [filename] class? [classname]?
en-post [pw] [filename] 
en [pw] [filename]
de [pw] [filename]
 */


if (args.length == 0) PostBlog();
else {
    switch (args[0]) {
        case "post": {
            if (args.length < 2) { break; }
            let src = args[1];
            let className = null;
            if (args.length >= 4 && args[2] == "class") {
                className = args[3];
            }
            PostBlog(src, className);
        } break;
        case "en-post": {
            if (args.length < 3) { break; }
            let pw = args[1];
            let src = args[2];
            let className = null;
            if (args.length >= 5 && args[3] == "class") {
                className = args[4];
            }
            PostBlog(src, className, pw);
        } break;
        case "en": {
            console.log(`encrypt ${args[2]}`);
            let data = fs.readFileSync(args[2], 'utf-8').replaceAll('\r', '');
            const name = path.parse(args[2]).name;
            let pw = args[1];
            let encrypted = aes.encrypt(pw + "\n" + data, pw).toString();
            const output_name = name.endsWith("_decrypted") ?
                name.substring(0, name.length - "_decrypted".length)
                : name + "_encrypted";
            console.log(`write ${output_name}.atxt`)
            fs.writeFileSync(output_name + '.atxt', "ENCRYPTED\n" + encrypted);
        } break;
        case "de": {
            console.log(`decrypt ${args[2]}`);
            let data = fs.readFileSync(args[2], 'utf-8').replaceAll('\r', '');
            const name = path.parse(args[2]).name;
            let pw = args[1];
            let ds = data.split('\n');
            if (ds[0] == 'ENCRYPTED') {
                let decrypted = aes.decrypt(ds[1], pw).toString(aes.enc);
                if (pw == decrypted.split('\n')[0]) {
                    console.log('Success');
                    console.log(`write ${name}_decrypted.atxt`)
                    fs.writeFileSync(name + '_decrypted.atxt', decrypted.substring(decrypted.indexOf('\n') + 1));
                } else {
                    console.error("Failure");
                    console.log(decrypted)
                }
            } else {
                console.log(`Not ENCRYPTED: ${ds[0]}`)
            }
        } break;
        default:
            PostBlog();
            break;
    }
}


function PostBlog(src = null, className = null, pw = null) {
    if (!src) { src = "temp.atxt"; }
    let stamp;
    let filename;
    {
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
    let data = fs.readFileSync(src);
    let blog_len = CleanText(data.toString()).replace("\n", "").replace("\r", "").length;
    data += "\n[time]" + stamp + "[/time]";
    let blog_path = "docs/Text/" + filename + ".atxt";
    let record = filename + "," + blog_len + ",";
    let reg_title = /^#title:(.*)/;
    let title_match = data.match(reg_title);
    if (title_match != null) {
        record += (className ? `【${className}】` : "") + title_match[1];
    }
    if (className) {
        record += "," + className
    }
    console.log(record);
    if (pw) {
        let encrypted = aes.encrypt(pw + "\n" + data, pw).toString();
        fs.writeFileSync(blog_path, "ENCRYPTED\n" + encrypted);
        fs.appendFileSync("index.txt", record + "\n");
        return;
    }
    fs.writeFileSync(blog_path, data);
    fs.appendFileSync("docs/index.txt", record + "\n");
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
        [/\[mask\](.*?)\[\/mask\]/, "$1"],
        [/\[tag\](.*?)\[\/tag\]/, "$1"],
        [/^#left:(.*)/, "$1"],
        [/^#center:(.*)/, "$1"],
        [/^#right:(.*)/, "$1"],
        [/^#title:(.*)/, "$1"],
        [/^#spoiler/, ""],
        [/^#\/spoiler/, ""],
        [/^#quote$/, ""],
        [/^#\/quote/, ""],
        [/^#quote:(.*)/, "$1"],
        [/^#h([1-6]):/, ""]
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