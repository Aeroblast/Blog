<template>
  <div class="main_width info_container">
    <div class="index_info" v-if="indexItem">
      <table>
        <tr>
          <td><span @click="activeFilenameInput = true">文档</span></td>
          <td>
            【<a
              class="hide_link"
              ref="filename"
              @click.prevent
              :href="'?n=' + filename"
              >{{ filename }}</a
            >】;<span class="article_log">{{ log }}</span>
          </td>
        </tr>
        <tr v-if="indexItem.title">
          <td>标题:</td>
          <td>{{ indexItem.title }}</td>
        </tr>
        <tr v-if="indexItem.tags.length > 0">
          <td>标签:</td>
          <td>
            <div
              class="tag"
              v-for="tag in indexItem.tags"
              :key="tag"
              @click.stop="$emit('tag', { name: tag, index: indexItem })"
            >
              {{ tag }}
            </div>
          </td>
        </tr>
      </table>
    </div>
    <p class="password_zone" :data-display="waitPassword">
      加密内容：<input
        @keyup.enter="TryLoadEncrypted(passwordInput)"
        v-model="passwordInput"
        class="password_input"
        type="text"
      />
    </p>
  </div>
  <article
    :data-mode="mode"
    class="main_width"
    v-html="renderedContent"
    ref="article"
  ></article>
  <div class="footer main_width">
    <div>
      ©<span> Aeroblast </span><br /><a href="./"> Home </a>|<a href="?n=about">
        About
      </a>
    </div>
  </div>
</template>
<script>
import { TryGetDate } from "../utils.js";
import { CryptoJS } from "../lib/aes.js";
import hljs from "../lib/highlight.min.js";
import RetroFilter from "./RetroFilter.js";

export default {
  name: "Atxt-Article",
  emits: ["tag"],
  props: { password: String, indexItem: Object },
  data() {
    return {
      filename: "",
      renderedContent: "加载中……",
      waitPassword: false,
      log: "",
      activeFilenameInput: false,
      rawText: "",
      passwordInput: "",
      mode: "",
    };
  },
  computed: {},
  methods: {
    async Read(filename) {
      console.log(filename);
      this.filename = filename;
      this.renderedContent = "加载中……";
      this.waitPassword = false;
      this.log = "";
      this.activeFilenameInput = false;
      this.rawText = "";
      this.passwordInput = "";
      this.mode = "";
      let r = await fetch(textRoot + filename + ".atxt");
      if (r.status != 200) {
        this.renderedContent =
          "文档【" +
          filename +
          "】无法加载。<br>" +
          r.status +
          ": " +
          r.statusText;
        return;
      }
      this.rawText = await r.text();

      if (this.rawText.startsWith("ENCRYPTED")) {
        this.renderedContent = "等待输入密码……";
        this.waitPassword = true;
        this.rawText = this.rawText.split("\n")[1].replace("\r", "");
        if (this.password) {
          this.TryLoadEncrypted(this.password);
        }
        return;
      }
      this.LoadContent(this.rawText);
    },
    LoadContent(content) {
      if (typeof content == "string") {
        content = content.split("\n");
      }
      let settings = content[0].replace("\r", "");
      if (settings == "#mode:tech") {
        this.mode = "tech";
      }
      this.renderedContent = RenderContent(content, this.filename);
      this.$nextTick(() => {
        this.$refs.article.querySelectorAll("code").forEach((block) => {
          hljs.highlightBlock(block);
        });
        let vm = this;
        let inlineTags = this.$refs.article.getElementsByClassName("tag");
        for (let inlineTag of inlineTags) {
          inlineTag.onclick = function (e) {
            vm.$emit("tag", { name: inlineTag.innerText, index: vm.indexItem });
            e.stopPropagation();
          };
        }
        RetroFilter.ApplyToAllImage("img.retro");
        RetroFilter.ApplyToAllVideo("video.retro");
      });
    },
    TryLoadEncrypted(password) {
      let de = this.TryDecrypt(this.rawText, password);
      if (de) {
        this.waitPassword = false;
        this.LoadContent(de);
      }
    },
    TryDecrypt(encrypted, password) {
      let r = CryptoJS.AES.decrypt(encrypted, password)
        .toString(CryptoJS.enc.Utf8)
        .split("\n");
      if (r.shift() == password) {
        console.log("decrypt success");
        this.log += "解密成功；";
        return r;
      } else {
        console.log("decrypt fail");
        return null;
      }
    },
  },

  mounted() {
    if (this.indexItem) {
      this.Read(this.indexItem.filename);
    }
  },
};
const atxtLeveledBlockRegex = [
  /^#h([1-6]):(.*)/,
  "<h$1>$2</h$1><div class='leveled-block h$1block'>",
];

const atxtBlockEndRegexList = [
  [/^#\/(quote)/, "</div>"],
  [/^#\/(spoiler)/, "</div>"],
];
const atxtBlockRegexList = [
  [
    /^#(spoiler)/,
    "<div class='spoiler'><div onclick='SpoilerShift(this)' title='该块可能包含剧透内容'>Spoiler</div>",
  ],

  [/^#(quote)$/, "<div class='quote'>"],
];
const atxtRegexList = [
  [/\[color=(.*?)\](.*?)\[\/color\]/, '<span style="color:$1">$2</span>'],
  [/\[img\](.*?)\[\/img\]/, "<img class='aimg' src='" + imageRoot + "$1'>"],
  [
    /\[img=(.*?),(.*?)\](.*?)\[\/img\]/,
    "<img class='aimg' style='width:$1;height:$2' src='" + imageRoot + "$3'>",
  ],
  [/\[b\](.*?)\[\/b\]/, "<b>$1</b>"],
  [/\[ruby=(.*?)\](.*?)\[\/ruby\]/, "<ruby>$2<rt>$1</rt></ruby>"],
  [/(\/\*.*?\*\/)/, ""],
  [/\/\/\/.*/, ""],
  [/\[s\](.*?)\[\/s\]/, "<s>$1</s>"],
  [/\[size=(.*?)\](.*?)\[\/size\]/, '<span style="font-size:$1em">$2</span>'],
  [
    /\[ASIN\](.*?)\[\/ASIN\]/,
    '<a class="asin" title="$1" href="https://www.google.com/search?q=$1" target="_blank">🔗<span class="underline">ASIN</span></a>',
  ],
  [
    /\[ASIN=(.*?)\](.*?)\[\/ASIN\]/,
    '<a class="asin" href="https://www.google.com/search?q=$1" target="_blank">$2</a>',
  ],
  [
    /\[mask\](.*?)\[\/mask\]/,
    '<span class="mask" title="你知道的太多了">$1</span>',
  ],
  [/\[tag\](.*?)\[\/tag\]/, '<span class="tag">$1</span>'],
  [/^#left:(.*)/, "<p class='aligned' style='text-align:left'>$1</p>"],
  [/^#center:(.*)/, "<p class='aligned' style='text-align:center'>$1</p>"],
  [/^#right:(.*)/, "<p class='aligned' style='text-align:right'>$1</p>"],
  [/^#title:(.*)/, "<p class='title0'>$1</p>"],
  [/^#quote:(.*)/, "<div class='quote aligned'>$1</div>"],
  [/^#mode:(.*)/, "<p><!--skip--></p>"],
  [/\[link=(.*?)\](.*?)\[\/link\]/, '<a href="$1"target="_blank">$2</a>'],
  [/\[link\](.*?)\[\/link\]/, '<a href="$1"target="_blank">$1</a>'],
  [/^\+ (.*)/, '<p class="list_item">$1</p>'],
];
const atxtRegexList_old = [
  [
    /\[spoiler\]/,
    "<div class='spoiler'><div onclick='SpoilerShift(this)' title='该块可能包含剧透内容'>Spoiler</div>",
  ],
  [/\[\/spoiler\]/, "</div>"],
  [/\[quote\]/, "<div class='quote'>"],
  [/\[\/quote\]/, "</div>"],
  [/\[title\](.*?)\[\/title\]/, "<p class='title0'>$1</p>"],
  [/\[h([1-6])\](.*?)\[\/h[1-6]\]/, "<h$1>$2</h$1>"],
  [
    /\[align=(.*?)\](.*?)\[\/align\]/i,
    "<p class='aligned' style='text-align:$1'>$2</p>",
  ],
];

function RenderContent(lines, filename) {
  let year = parseInt(filename.substring(0, 4));
  let oldPost = false;
  if (year && year < 2021) oldPost = true;

  let r = "";
  let encodeState = "";
  let count = 0;
  let leveledBlockStack = [];
  let blockStack = [];
  for (const line of lines) {
    count++;
    let rendered = line.replace("\r", "");
    if (encodeState == "code") {
      if (rendered == "[/code]") {
        encodeState = "";
        r += "</code></pre>";
        continue;
      }
      r += ReplaceEntity(rendered) + "\n";
      continue;
    }
    let spMatch = /\[code=(.*?)\]/.exec(rendered);
    if (rendered == "[code]" || spMatch) {
      encodeState = "code";
      if (spMatch) {
        r += rendered.replace(/\[code=(.*?)\]/, "<pre><code class='lang-$1'>");
      } else {
        r += "<pre><code>";
      }
      continue;
    }
    //[time]
    spMatch = /\[time\](.*?)\[\/time\]/.exec(rendered);
    if (spMatch) {
      let time = TryGetDate(spMatch[1]);
      rendered = rendered.replace(
        spMatch[0],
        "<p class='time' >" + sharedDatetimeFormat.format(time) + "</p>"
      );
    }

    let canStop = false;
    let leveledBlockTest = RenderContentLine(rendered, [atxtLeveledBlockRegex]);
    rendered = leveledBlockTest.result;
    if (leveledBlockTest.matches.length > 0) {
      let level = leveledBlockTest.matches[0][1];
      level = parseInt(level);
      while (leveledBlockStack.length > 0) {
        let lastlevel = leveledBlockStack[leveledBlockStack.length - 1];
        if (lastlevel > level) {
          leveledBlockStack.pop();
          rendered = "</div>\n" + rendered;
        } else if (lastlevel == level) {
          leveledBlockStack.pop();
          rendered = "</div>\n" + rendered;
          break;
        } else if (lastlevel < level) {
          break;
        }
      }
      leveledBlockStack.push(level);
      let s = leveledBlockTest.matches[0][2];
      if (needDrawOut(s)) {
        rendered = rendered.replace(/(<h[1-6])/, "$1 class='drawout-h'");
      }

      canStop = true;
    }
    if (!canStop) {
      let blockTest = RenderContentLine(rendered, atxtBlockRegexList);
      if (blockTest.matches.length > 0) {
        rendered = blockTest.result;
        blockStack.push({
          name: blockTest.matches[0][1],
          levelCount: leveledBlockStack.length,
        });
        canStop = true;
      }
    }
    if (!canStop) {
      let blockTest = RenderContentLine(rendered, atxtBlockEndRegexList);
      if (blockTest.matches.length > 0) {
        rendered = blockTest.result;
        let info = blockStack.pop();
        //to-do: 验证info.name不可交叉……但博客都是自己写的就不验证了
        while (leveledBlockStack.length > info.levelCount) {
          leveledBlockStack.pop();
          rendered = "</div>\n" + rendered;
        }
        canStop = true;
      }
    }

    rendered = RenderContentLine(rendered, atxtRegexList).result;

    // 类MD的图片&视频
    {
      let match;
      do {
        match = /\!((\[.*?\])+)\((.*?)\)/.exec(rendered);
        if (!match) break;
        let path = match[3];
        let classNames = "";
        let w, h;
        let param = match[1].substring(1, match[1].length - 1).split("][");
        let tag = "img";
        const video_option_kw = ["loop", "controls", "autoplay"];
        let v_options = [];
        for (const p of param) {
          if (p[0] <= "9" && p[0] >= "0") {
            if (!w) w = p;
            else if (!h) h = p;
          } else {
            if (p == "v") {
              tag = "video";
              continue;
            }
            if (tag == "video" && video_option_kw.includes(p)) {
              v_options.push(p);
              continue;
            }
            classNames += " " + p;
          }
        }
        let html;
        let sizeStyle = `${w ? "width:" + w + ";" : ""}${
          h ? "height:" + h + ";" : ""
        }`;
        if (tag == "video") {
          html = ` <video class='aimg${classNames}'
            style='${sizeStyle}'
            ${v_options.join(" ")} preload
            src='${imageRoot + path}' 
            onclick='this.paused?this.play():this.pause()'></video>`;
        } else {
          html = `<img class='aimg${classNames}' style='${sizeStyle}' src='${
            imageRoot + path
          }'>`;
        }
        rendered = rendered.replace(match[0], html);
      } while (match);
    }

    if (oldPost)
      rendered = RenderContentLine(rendered, atxtRegexList_old).result;

    //empty line
    if (rendered == "") rendered = "<br>";

    if (
      //if should add <p></p>
      !((str) => {
        const reg_startswith = [
          /^<div/,
          /^<\/div/,
          /<^\/code>/,
          /^<p /,
          /^<h[1-6]/,
        ];
        for (let i = 0; i < reg_startswith.length; i++) {
          if (str.match(reg_startswith[i])) {
            return true;
          }
        }
        return false;
      })(rendered)
    ) {
      //should add <p></p>
      let pClass = "";
      if (needDrawOut(rendered)) {
        pClass += " drawout";
      }
      rendered =
        "<p id='line" + count + "' class='" + pClass + "'>" + rendered + "</p>";
    }

    r += rendered + "\n";
  }
  return r;
}

function RenderContentLine(line, reg) {
  let r = line;
  let matched = true;
  let matches = [];
  while (matched) {
    matched = false;
    for (let i = 0; i < reg.length; i++) {
      let match = reg[i][0].exec(r);
      if (!match) continue;
      r = r.replace(reg[i][0], reg[i][1]);
      matched = true;
      matches.push(match);
      break;
    }
  }
  return { result: r, matches: matches };
}
function ReplaceEntity(c) {
  return c.replaceAll("<", "&lt;").replaceAll(">", "&rt;");
}

function needDrawOut(content) {
  const list = ["「", "『", "（"];
  for (const k of list) {
    if (content[0] == k) return true;
  }
  return false;
}
</script>
<style src="./article.css">
</style>
<style src="../lib/highlightjs.css">
</style>
<style  scoped>
*[data-display="false"] {
  display: none;
}
input[type="text"] {
  font-size: 16px;
}
.index_info,
.info_container {
  line-height: 1.5;
  margin-top: 0;
  margin-bottom: 0.2em;
  padding: 0;
}
table {
  border: none;
  border-spacing: 0;
}
td {
  vertical-align: super;
}
tr > td:nth-child(1) {
  white-space: nowrap;
}
</style>