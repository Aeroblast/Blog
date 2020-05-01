
var mainwin = document.getElementById("mainwin");
var mainwin_container = document.getElementById("mainwin_container");
var list_shift_button = document.getElementById("list_shift_button");
var index = new Array();
var loader = new XMLHttpRequest();
var toc = document.getElementById('toc');
var title;
var filename;
var raw_index;

var query_n;
var query_code;
var query_tag_string;
var query_tags;
var query_pw;
ReadQuery();
PrepareIndexAnime();

loader.open('GET', "index.txt?" + RandomQuery(), true);
loader.onload = LoadIndex;
loader.send(null);

/////////////Main//////////////
//LoadIndex()-LoadQuery()
function ReadQuery() {
    query_n = GetQueryString("n");
    query_code = GetQueryString("code");


    query_tag_string = "&tags=" + GetQueryString("tags");
    query_tags = GetQueryString("tags");
    if (query_tags == null || query_tags == "") query_tag_string = ""; else query_tags = query_tags.split(",");

    query_pw = GetQueryString("pw");
    if (query_pw) query_pw = "&pw=" + query_pw;
    else query_pw = "";
}
function LoadIndex() {
    raw_index = loader.responseText.split("\n");
    _LoadIndex();
    LoadBlogByQuery();
}
function LoadBlogByQuery() {
    let hit = false;
    if (query_n && query_n.length > 1) {
        for (let i = 0; i < index.length; i++) {
            if (index[i][0] == query_n) { _LoadBlog(i); hit = true; break; }
        }
    }
    if (!hit) {
        filename = "welcome";
        _LoadBlog(0);
    }
}
function ReloadIndex(tags_ = null) {
    if (tags_) {
        query_tags = tags_;
        query_tag_string = "&tags=" + tags_;
    }
    PushState();
    if (list_state == 0) ListShift();
    _LoadIndex();
}
function _LoadIndex() {
    index = new Array();

    let starter = ""
    if (query_tags) {
        starter = "Tag Search<div class='inline button' onclick='ClearTags()'>❌</div>:<br>"
            + Tags2HTML(query_tags)
            + "<br><div class='toc_item' style='height:0'></div>";
    }
    toc.innerHTML = starter;

    let refnode = null;
    raw_index.forEach(element => {
        let ele = ReadIndex(element);
        let fn = ele.getAttribute("filename");
        if (fn) {
            ele.onmouseover = function () { IndexInfoOn(ele); }
            ele.onmouseout = function () { IndexInfoOff(ele); }
            if (query_tags && fn.startsWith("Tag")) {
                if (ele.getAttribute("selected") == "true") {
                    ele.style.display = "block";
                    toc.insertBefore(ele, refnode);
                    return;
                }
            }
        }
        toc.insertBefore(ele, refnode);
        refnode = ele;//删去则是正序
    });

    let place = document.createElement('div');
    place.style.height = "40%";
    toc.appendChild(place);

    let w = toc.offsetWidth;
    SetIndexAnimeCSS(w);
}
var list_state = 0;
function ListShift() {
    if (list_state == 0) {
        list_state = 1;
        toc.style.animation = "OpenIndex 0.3s";
        toc.style.animationFillMode = "forwards";
        mainwin_container.style.animation = "OpenIndex 0.3s";
        mainwin_container.style.animationFillMode = "forwards";
        //list_shift_button.style.animation = "OpenIndex 0.3s";
        //list_shift_button.style.animationFillMode="forwards";
    } else if (list_state == 1) {
        list_state = 0;
        toc.style.animation = "CloseIndex 0.3s";
        toc.style.animationFillMode = "forwards";
        mainwin_container.style.animation = "CloseIndex 0.3s";
        mainwin_container.style.animationFillMode = "forwards";
        //list_shift_button.style.animation = "CloseIndex 0.3s";
        //list_shift_button.style.animationFillMode="forwards";
    }
}
function CloseIndex() {
    if (list_state == 1) ListShift();
    infoBox.style.display = "none";
};
function ClearTags() {
    query_tags = null;
    query_tag_string = "";
    ReloadIndex();
}
function ReadIndex(element) {
    let es = element.split(',');
    let select = "false";
    let classstr = "toc_item";
    if (query_tags)
        for (let i = 2; i < es.length; i++) {//Tags check
            if (IsInQueryTags(es[i])) {
                select = "true";
            }
        }
    else { select = "noselect"; }
    if (es[0] == query_n) {
        classstr += " toc_item_selected";
    }
    if (!isNum(es[0][0])) {
        classstr += " toc_item_sp";
    }
    let display_title;
    if (es.length > 2 && es[2].length > 0) {
        display_title = es[2];
    }
    else {
        display_title = es[0];
    }
    let r = document.createElement("a");
    r.className = classstr;
    let t = index.length;
    r.onclick = function () { ClickLoadBlog(t); return false; }
    r.setAttribute("selected", select);
    r.setAttribute("filename", es[0]);
    r.setAttribute("href", "?n=" + es[0]);
    r.setAttribute("len", es[1]);
    r.innerText = display_title;
    index.push(es);
    return r;
}
////////////////helpers/////////////
function ViewerURL(n) { return "viewer.html?n=" + filename + "&" + RandomQuery() + query_pw; }
function PushState() {
    history.pushState({}, title, location.pathname + "?n=" + filename + query_tag_string + query_pw);
    query_n = GetQueryString("n");
}
function Tags2HTML(a) {
    let s = "";
    for (let i = 0; i < a.length; i++)s += "<div class='tag'>" + a[i] + "</div>";
    return s;
}
function Index2HTML(a) {
    let s = "";
    if (a.length > 2)
        s += "Title:<span class='title'>" + a[2] + "</span><br>Tags:";
    for (let i = 3; i < a.length; i++)if (a[i]) s += "<div class='tag' onclick='ClickTag(this,event);'>" + a[i] + "</div>";
    return s;
}
//////////Anime////////
var openindex_css;
var closeindex_css;
function PrepareIndexAnime() {
    let classes = document.styleSheets[0].rules || document.styleSheets[0].cssRules;
    for (let x = 0; x < classes.length; x++) {
        if (classes[x].name == "OpenIndex") {
            openindex_css = classes[x];
        }
        if (classes[x].name == "CloseIndex") {
            closeindex_css = classes[x];
        }
    }
}
function SetIndexAnimeCSS(px) {
    openindex_css.appendRule("from{transform:none}");
    openindex_css.appendRule("to{transform:translate(" + px + "px,0)}");
    closeindex_css.appendRule("to{transform:none}");
    closeindex_css.appendRule("from{transform:translate(" + px + "px,0)}");
}
//////////Anime->InfoBox
var infoBox = document.getElementById("infobox");
var infoBoxState = 0;
var moveInfoBox_keyframes = document.createElement("style");
moveInfoBox_keyframes.type = 'text/css';
document.head.appendChild(moveInfoBox_keyframes);
const moveInfoBox_template = "\
@keyframes MoveInfoBox{\
    50%{color:#586069;}\
    100%{top:[2]px;color:antiquewhite;height:auto;}}";
const infoBox_content_template = "<div>[1]<br>长度：[2]</div>";
function IndexInfoOn(div) {
    let d = TryGetDate(div.getAttribute("filename"));
    if (d) d = new Intl.DateTimeFormat('zh-CN-u-hc-h24', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
    else d = "";
    infoBox.innerHTML = infoBox_content_template.replace("[1]", d).replace("[2]", div.getAttribute("len"));
    if (infoBoxState == 0) {
        infoBox.style.display = "block";
        infoBox.style.left = div.offsetWidth + div.offsetLeft + "px";
        infoBox.style.top = div.offsetTop + "px";
        infoBox.style.animation = "OpenInfoBox 0.3s";
        infoBox.style.animationFillMode = "forwards";
    } else {
        infoBox.style.color = "#586069";
        infoBox.style.width = "10em";
        infoBox.style.height = infoBox.offsetHeight + "px";
        infoBox.style.top = infoBox.offsetTop + "px";
        moveInfoBox_keyframes.innerHTML = moveInfoBox_template.replace("[2]", div.offsetTop);
        infoBox.style.animation = "none";
        setTimeout(function () {
            infoBox.style.animation = "MoveInfoBox 0.3s";
            infoBox.style.animationFillMode = "forwards";
        }, 10);

    }
    infoBoxState = 1;
}
function IndexInfoOff(div) {
    infoBoxState = 2;
    setTimeout(function () {
        if (infoBoxState == 2) {
            infoBox.style.width = "0";
            infoBox.style.height = "0";
            infoBox.style.top = div.offsetTop + "px";
            infoBox.style.animation = "CloseInfoBox 0.3s";
            infoBox.style.animationFillMode = "forwards";
            infoBoxState = 0;
        }
    }, 100);
}
function IsInQueryTags(s) {
    if (s == "") return false;
    for (let i = 0; i < query_tags.length; i++) {
        if (query_tags[i] != "" && query_tags[i] == s) return true;
    }
    return false;
}
//////////Viewer//////////
mainwin_container.addEventListener("click", function () {
    CloseIndex();
});
var content_ok;
var log;
var main;
var info;
var loader;
var txtcontent;
var main_frame = document.getElementById("main_frame");
var main_template = '\
    <div id="info_container" class="main_width">\
        <p id="log"></p>\
        <div id="info"></div>\
        <p id="pw_zone">加密内容：<input id="pw_input" type="text" /></p>\
    </div>\
    <div id="main" class="main_width">加载中……</div>\
    <div id="gitalk-container" class="main_width" onclick="LoadGitalk()"></div>';
function ClickLoadBlog(i) {
    _LoadBlog(i);
    PushState();
    _LoadIndex();
}
function _LoadBlog(i) {
    CloseIndex();
    let i_n = parseInt(i);
    filename = index[i_n][0];
    title = index[i_n][1] || index[i_n][0];
    main_frame.innerHTML = main_template;
    log = document.getElementById("log");
    main = document.getElementById("main");
    info = document.getElementById("info");
    log.innerHTML += "文档【" + filename + "】;";
    info.innerHTML = Index2HTML(index[i_n]);
    content_ok = false;
    let txtpath = "Text/" + filename + ".atxt";
    loader = new XMLHttpRequest();
    loader.open('GET', txtpath + "?" + RandomQuery(), true);
    loader.onload = ProcContent;
    loader.send(null);
}
function ProcContent() {
    if (loader.status == 200) {
        txtcontent = loader.responseText.split("\n");
        if (txtcontent[0] == "ENCRYPTED") {
            main.innerHTML = "等待输入密码……";
            document.getElementById("pw_zone").style.display = "block";
            var pw = document.getElementById("pw_input");
            pw.onkeydown = function (e) {
                if (e.key == 'Enter') { pw.blur(); TryLoadEncrpyted(pw.value); }
            }
            let q_pw = GetQueryString("pw");
            if (q_pw) { TryLoadEncrpyted(q_pw); }
            return;
        }
        RenderContent();
    }
    else if (loader.status == 404) {
        log.innerHTML += "【404】似乎不存在这个文档呢……:" + n;
    }
}
var note_count;
var notes;
function RenderContent() {
    note_count = 0;
    notes = new Array();
    var code = "";
    var line = 0;
    txtcontent.forEach(ele => {
        var c = ele.replace('\r', '');
        c = EncodeAtxt(c);
        var cla = "";
        if (c.length == 0) c = "<br>";
        if (c[0] == "「" || c[0] == "『" || c[0] == "（") cla += " drawout";
        if (c.startsWith("<div") || c.startsWith("</div"))
            code += c;
        else
            code += "<p id='line" + line + "' class='" + cla + "'>" + c + "</p>";
        line++;
    });
    main.innerHTML = code;
    var ua = navigator.userAgent;
    var iPad = ua.match(/(iPad).*OS\s([\d_]+)/),
        iPhone = !iPad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        isAndroid = ua.match(/(Android)\s+([\d.]+)/),
        isMobile = iPhone || isAndroid;
    if (isMobile) {
        log.innerHTML += "Mobile;";
        main.style.fontSize = "4vw";
        main.style.width = "95%";
    }
    if (iPad) {
        main.style.width = "95%";
    }
    content_ok = true;
    if (query_code) {
        LoadGitalk();
    }
}

function EncodeAtxt(c) {
    var reg = [
        [/\[align=(.*?)\](.*?)\[\/align\]/i, "<p class='aligned' style='text-align:$1'>$2</p>"],
        [/\[note\]/, ""],
        [/\[note=(.*?)\]/, ""],
        [/\[img\](.*?)\[\/img\]/, "<img class='aimg' src='Images/$1'>"],
        [/\[img=(.*?),(.*?)\](.*?)\[\/img\]/, "<img class='aimg' style='width:$1;height:$2' src='Images/$3'>"],
        [/\[b\](.*?)\[\/b\]/, "<b>$1</b>"],
        [/\[title\](.*?)\[\/title\]/, "<p class='title0'>$1</p>"],
        [/\[ruby=(.*?)\](.*?)\[\/ruby\]/, "<ruby>$2<rt>$1</rt></ruby>"],
        [/(\/\*.*?\*\/)/, ""],
        [/\/\/\/.*/, ""],
        [/\[emphasis\](.*?)\[\/emphasis\]/, "<span class=\"emph\">$1</span>"],
        [/\[s\](.*?)\[\/s\]/, "<s>$1</s>"],
        [/\[time\](.*?)\[\/time\]/, "<p class='time'>$1</p>"],
        [/\[h1\](.*?)\[\/h1\]/, "<h1>$1</h1>"],
        [/\[h2\](.*?)\[\/h2\]/, "<h2>$1</h2>"],
        [/\[h3\](.*?)\[\/h3\]/, "<h3>$1</h3>"],
        [/\[h4\](.*?)\[\/h4\]/, "<h4>$1</h4>"],
        [/\[h5\](.*?)\[\/h5\]/, "<h5>$1</h5>"],
        [/\[size=(.*?)\](.*?)\[\/size\]/, "<span style=\"font-size:$1em\">$2</span>"],
        [/\[link=(.*?)\](.*?)\[\/link\]/, "<a href=\"$1\"target=\"_blank\">$2</a>"],
        [/\[ASIN\](.*?)\[\/ASIN\]/, "ASIN:<a href=\"https://www.google.com/search?q=$1\" target=\"_blank\">$1</a>"],
        [/\[ASIN=(.*?)\](.*?)\[\/ASIN\]/, "<a href=\"https://www.google.com/search?q=$1\" target=\"_blank\">$2</a>"],
        [/\[spoiler\]/, "<div class='spoiler'><div onclick='SpoilerShift(this)' title='该块可能包含剧透内容'>Spoiler</div>"],
        [/\[\/spoiler\]/, "</div>"],
        [/\[quote\]/, "<div class='quote'>"],
        [/\[\/quote\]/, "</div>"],
        [/\[mask\](.*?)\[\/mask\]/, "<span class=\"mask\" title=\"你知道的太多了\">$1</span>"]
    ];
    var r = c;
    var matched = true;
    while (matched) {
        matched = false;
        for (var i = 0; i < reg.length; i++) {
            var match = reg[i][0].exec(r);
            if (match != null) {
                var rep = reg[i][1];
                switch (i) {
                    case 1://[note]
                        rep = "<a class='note' onclick='Footnote(" + note_count + ")'><sup>注</sup></a>";
                        note_count++;
                        r = r.replace(reg[i][0], rep);
                        break;
                    case 2://[note=...]
                        notes.push(match[1]);
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


    }
    return r;
}
function Footnote(a) {
    alert(notes[a]);
}
function TryLoadEncrpyted(pw) {
    console.log(pw);
    let r = CryptoJS.AES.decrypt(txtcontent[1], pw).toString(CryptoJS.enc.Utf8);
    r = r.split('\n');
    if (r.shift() == pw) {
        log.innerHTML += "解密成功;";
        txtcontent = r;
        document.getElementById("pw_zone").style.display = "none";
        RenderContent();
    } else {
        log.innerHTML += ("Fail;");
    }
}
function SpoilerShift(e) {
    if (e.parentNode.style.color == "antiquewhite") {
        e.parentNode.style.color = "transparent";
    } else
        e.parentNode.style.color = "antiquewhite";
}
function ClickTag(a, event) {
    ReloadIndex(new Array(a.innerText));
    event.stopPropagation();
}
function LoadGitalk() {
    if (!content_ok) return;
    if (query_code)
        history.pushState({}, title, location.pathname + "?code=" + query_code);

    let x = document.getElementById('gitalk-container');
    x.onclick = "";
    var gitalk = new Gitalk({
        clientID: 'bdb84036d2da38be8d03',
        clientSecret: '8f1edc27c5ede8c0ec4b8b44ca8b679e1365319c',
        repo: 'Blog',
        owner: 'Aeroblast',
        admin: ['Aeroblast'],
        createIssueManually: true,
        id: filename,
        title: 'Comment',
        distractionFreeMode: false,
        pagerDirection: 'first'
    })
    gitalk.render('gitalk-container');
    if (query_code)
        history.back();
    x.style.height = "auto";
    x.style.cursor = "";
}

//////////////Event//////////
main_frame.oncopy = OnCopy;
function OnCopy(oEvent)//不要给每个p都加空行啦！于是有了这个函数
{
    oEvent.preventDefault();
    let s = window.getSelection().toString();
    let str = s.replace(/\n\n/g, '\n');
    oEvent.clipboardData.setData("text", str);
}
window.onpopstate = function (event) {
    ReadQuery();
    LoadBlogByQuery();
    _LoadIndex();
};