<template>
  <div class="main_width info_container">
    <div class="index_info" v-if="indexItem">
      <table>
        <tr>
          <td><span @click="activeFilenameInput = true">文档</span></td>
          <td>
            【<span ref="filename">{{ filename }}</span
            >】;<span class="article_log">{{ log }}</span>
          </td>
        </tr>
        <tr>
          <td>标题:</td>
          <td>{{ indexItem.title }}</td>
        </tr>
        <tr>
          <td>Tags:</td>
          <td>
            <div
              class="tag"
              v-for="tag in indexItem.tags"
              :key="tag"
              @click="$emit('tag', tag)"
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
      ©<span> Aeroblast </span><br /><a href="?"> Home </a>|<a href="?n=about">
        About
      </a>
    </div>
  </div>

  <div id="gitalk-container" class="main_width" onclick="LoadGitalk()"></div>
</template>
<script>
import { TryGetDate } from "../utils.js";
import { CryptoJS } from "../lib/aes.js";
import hljs from "../lib/highlight.pack.js";
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
      this.filename = filename;
      this.renderedContent = "加载中……";
      this.waitPassword = false;
      this.log = "";
      this.activeFilenameInput = false;
      this.rawText = "";
      this.passwordInput = "";
      this.mode = "";
      let r = await fetch(textRoot + filename + ".atxt");
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
      this.renderedContent = RenderContent(content);
      this.$nextTick(() => {
        document.querySelectorAll("code").forEach((block) => {
          hljs.highlightBlock(block);
        });
        let vm = this;
        let inlineTags = this.$refs.article.getElementsByClassName("tag");
        for (let inlineTag of inlineTags) {
          inlineTag.onclick = function () {
            vm.$emit("tag", inlineTag.innerText);
          };
        }
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

  mounted() {},
};

const atxtRegex = [
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
    'ASIN:<a href="https://www.google.com/search?q=$1" target="_blank">$1</a>',
  ],
  [
    /\[ASIN=(.*?)\](.*?)\[\/ASIN\]/,
    '<a href="https://www.google.com/search?q=$1" target="_blank">$2</a>',
  ],
  [
    /\[mask\](.*?)\[\/mask\]/,
    '<span class="mask" title="你知道的太多了">$1</span>',
  ],
  [
    /\[tag\](.*?)\[\/tag\]/,
    '<span class="tag" onclick="ActiveInlineTag(\'$1\')">$1</span>',
  ],
  [/^#left:(.*)/, "<p class='aligned' style='text-align:left'>$1</p>"],
  [/^#center:(.*)/, "<p class='aligned' style='text-align:center'>$1</p>"],
  [/^#right:(.*)/, "<p class='aligned' style='text-align:right'>$1</p>"],
  [/^#title:(.*)/, "<p class='title0'>$1</p>"],
  [
    /^#spoiler/,
    "<div class='spoiler'><div onclick='SpoilerShift(this)' title='该块可能包含剧透内容'>Spoiler</div>",
  ],
  [/^#\/spoiler/, "</div>"],
  [/^#quote$/, "<div class='quote'>"],
  [/^#\/quote/, "</div>"],
  [/^#quote:(.*)/, "<div class='quote aligned'>$1</div>"],
  [/^#h([1-6]):(.*)/, "<h$1>$2</h$1>"],
  [/^#mode:(.*)/, "<p><!--skip--></p>"],
];
const atxtRegex_old = [
  [
    /\[spoiler\]/,
    "<div class='spoiler'><div onclick='SpoilerShift(this)' title='该块可能包含剧透内容'>Spoiler</div>",
  ],
  [/\[\/spoiler\]/, "</div>"],
  [/\[quote\]/, "<div class='quote'>"],
  [/\[\/quote\]/, "</div>"],
  [/\[title\](.*?)\[\/title\]/, "<p class='title0'>$1</p>"],
  [/\[link=(.*?)\](.*?)\[\/link\]/, '<a href="$1"target="_blank">$2</a>'],
  [/\[h([1-6])\](.*?)\[\/h[1-6]\]/, "<h$1>$2</h$1>"],
  [/\[align=(.*?)\](.*?)\[\/align\]/i, "<p class='aligned' style='text-align:$1'>$2</p>"],
];

function RenderContent(lines) {
  let r = "";
  let encodeState = "";
  let count = 0;
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
    rendered = RenderContentLine(rendered, atxtRegex);
    rendered = RenderContentLine(rendered, atxtRegex_old);

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
      if (
        //if should drawout
        ((c) => {
          const list = ["「", "『", "（"];
          for (const k of list) {
            if (c[0] == k) return true;
            return false;
          }
        })(rendered)
      ) {
        //should drawout
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
  while (matched) {
    matched = false;
    for (let i = 0; i < reg.length; i++) {
      let match = reg[i][0].exec(r);
      if (!match) continue;
      r = r.replace(reg[i][0], reg[i][1]);
      matched = true;
      break;
    }
  }
  return r;
}
function ReplaceEntity(c) {
  return c.replaceAll("<", "&lt;").replaceAll(">", "&rt;");
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
</style>