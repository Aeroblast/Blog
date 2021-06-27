<template>
  <div :style="tocAnimationVar">
    <div
      id="mainwin_container"
      style="
        -webkit-overflow-scrolling: touch;
        overflow-x: hidden;
        display: inline-block;
        width: 90%;
        height: 100%;
      "
      ref="mainContainer"
      :data-toc-play="tocAnimationCtrl"
      @click="ListClose()"
    >
      <div
        id="main_frame"
        style="
          width: 100%;
          height: 100%;
          border: 0 none;
          overflow-x: hidden;
          text-align: left;
          padding-top: 1em;
        "
      >
        <AtxtArticle
          ref="aritcle"
          :password="queryPassword"
          :indexItem="currentIndex"
          @tag="ActiveTag($event)"
        ></AtxtArticle>
        <div
          v-if="flowTrigger == 0"
          class="main_width"
          style="height: 3em; cursor: help"
          @click="ActiveFlow()"
        ></div>
        <component
          v-for="f in flowIndexList"
          v-bind:is="'AtxtArticle'"
          :key="f.filename"
          :password="queryPassword"
          :indexItem="f"
          @tag="ActiveTag($event)"
        ></component>
      </div>
    </div>
    <Toc
      ref="toc"
      :items="indexItems"
      :tocAnimationCtrl="tocAnimationCtrl"
      :currentFile="currentFile"
      :queryTags="queryTags"
      @ClickItem="LoadAritcle($event)"
      @ClearQueryTags="ClearTags()"
    ></Toc>
    <div
      id="list_shift_button"
      class="button"
      style="
        position: fixed;
        width: 3em;
        left: 0;
        height: 100%;
        margin: 0;
        bottom: 0;
        cursor: pointer;
      "
      @click="ListShift"
    ></div>
  </div>
</template>

<script>
import Toc from "./components/Toc.vue";
import AtxtArticle from "./components/AtxtArticle.vue";

export default {
  name: "App",
  components: {
    Toc,
    AtxtArticle,
  },
  data() {
    return {
      title: "",
      indexItems: [],
      tocState: 0,
      tocAnimationVar: "",
      tocAnimationCtrl: 0,
      tocWidth: 100,
      queryFilename: "",
      queryTags: [],
      queryPassword: "",
      flowTrigger: 0,
      flowIndexList: [],
    };
  },
  computed: {
    currentFile() {
      if (this.queryFilename) {
        return this.queryFilename;
      } else {
        return "welcome";
      }
    },
    currentIndex() {
      let f = this.currentFile;
      for (const i of this.indexItems) {
        if (i.filename == f) {
          return i;
        }
      }
      return null;
    },
  },
  watch: {
    currentIndex(val) {
      document.title =
        "Floating Whirl Island" + (val.title ? " | " + val.title : "");
    },
  },
  mounted() {
    let vm = this;
    window.addEventListener("scroll", this.OnScroll);
    window.onpopstate = function (event) {
      vm.LoadFromQuery();
    };
    this.LoadFromQuery();
  },
  methods: {
    LoadFromQuery() {
      this.queryFilename = GetQueryString("n");
      let queryTagString = GetQueryString("tags");
      if (queryTagString) this.queryTags = queryTagString.split(",");
      else this.queryTags = [];
      this.queryPassword = GetQueryString("pw");
      this.DownloadIndex();
      this.$refs.aritcle.Read(this.currentFile);
    },
    async DownloadIndex() {
      if (this.indexItems.length > 0) return;
      for (let page = indexPageCount - 1; page >= 0; page--) {
        let r = await fetch(indexRoot + "page" + page + ".txt");
        let t = await r.text();
        let indexPage = t.split("\n");
        for (let i = indexPage.length - 1; i >= 0; i--) {
          let obj = Record2Object(indexPage[i].replace("\r", ""));
          if (obj) {
            if (obj.special) {
              this.indexItems.splice(0, 0, obj);
            } else this.indexItems.push(obj);
          }
        }
      }
      this.$nextTick(() => {
        this.$refs.toc.ScrollDisplay(this.currentFile);
      });
    },
    ListShift() {
      if (this.tocState == 0) {
        this.ListOpen();
      } else {
        this.ListClose();
      }
    },
    ListOpen() {
      let start = 0;
      if (this.tocState == 1) {
        start = this.tocWidth;
      }
      this.tocState = 1;
      this.$nextTick(function () {
        this.tocWidth = this.$refs.toc.GetWidth();

        this.tocAnimationVar =
          "--toc-move-start:" +
          start +
          "px;" +
          "--toc-move-end:" +
          this.tocWidth +
          "px;";
        this.tocAnimationCtrl = (this.tocAnimationCtrl + 1) % 2;
      });
    },
    ListClose() {
      if (this.tocState == 0) return;
      let start = this.tocWidth;
      this.tocState = 0;
      this.$nextTick(function () {
        this.tocAnimationVar =
          "--toc-move-start:" + start + "px;" + "--toc-move-end:0px;";
        this.tocAnimationCtrl = (this.tocAnimationCtrl + 1) % 2;
      });
    },
    LoadAritcle(filename) {
      this.flowTrigger = 0;
      this.flowIndexList = [];
      this.queryFilename = filename;
      this.$refs.aritcle.Read(this.currentFile);
      this.$refs.toc.ScrollDisplay(filename);
      this.ListClose();
      this.PushState();
    },
    PushState() {
      let querys = this.queryFilename ? "n=" + this.queryFilename : "";
      querys +=
        this.queryTags.length > 0
          ? (querys ? "&" : "") + "tags=" + this.queryTags.join(",")
          : "";
      querys += this.queryPassword
        ? (querys ? "&" : "") + "pw=" + this.queryPassword
        : "";

      let url = location.pathname + (querys ? "?" + querys : "");

      history.pushState({}, "", url);
      //History.replaceState()
    },
    ActiveTag(tag) {
      this.flowTrigger = 0;
      this.flowIndexList = [];
      this.queryTags = [tag.name];
      if (tag.index.filename != this.currentFile) {
        this.queryFilename = tag.index.filename;
        this.$refs.aritcle.Read(this.currentFile);
      } else {
        this.$nextTick(() => {
          this.$refs.toc.ScrollDisplay(this.currentFile);
        });
      }
      this.ListOpen();
      this.PushState();
    },
    ClearTags() {
      this.flowTrigger = 0;
      this.flowIndexList = [];
      this.queryTags = [];
      this.$nextTick(() => {
        this.$refs.toc.ScrollDisplay(this.currentFile);
      });
      this.ListOpen();
      this.PushState();
    },
    ActiveFlow() {
      if (this.flowTrigger == 0) {
        this.flowTrigger = 1;
        let next = this.$refs.toc.GetNext(this.currentIndex);
        if (next) this.flowIndexList.push(next);
      }
    },
    OnScroll() {
      if (this.flowTrigger > 0) {
        let e = this.$refs.mainContainer;
        if (e.offsetHeight + e.scrollTop >= document.body.scrollHeight - 20) {
          let next = this.$refs.toc.GetNext(
            this.flowIndexList[this.flowIndexList.length - 1]
          );
          if (next) this.flowIndexList.push(next);
        }
      }
    },
  },
};
function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return decodeURIComponent(r[2]);
  return null;
}
function Record2Object(line) {
  let args = line.split(",");
  if (args.length < 2) return null;
  let obj = {
    filename: args[0],
    length: args[1],
    title: args[2],
  };
  let tags = [];
  for (let i = 3; i < args.length; i++) {
    if (args[i]) tags.push(args[i]);
  }
  obj.tags = tags;
  if (obj.filename[0] < "0" || obj.filename[0] > "9") {
    if (obj.filename.startsWith("Tag-")) {
      obj.special = "tag";
    } else {
      obj.special = "sp";
    }
  }
  return obj;
}
</script>

<style>
@charset "UTF-8";
a:link {
  color: pink;
  text-decoration: none;
}

a:visited {
  color: palevioletred;
}

a.hide_link {
  color: inherit;
  text-decoration: none;
}

b {
  color: #ffdd9f;
}

.tag {
  display: inline-block;
  border: 1px solid brown;
  border-radius: 3px;
  cursor: pointer;
  padding: 0;
  padding-left: 0.2em;
  padding-right: 0.2em;
  margin-right: 0.1em;
  margin-left: 0.1em;
  text-indent: 0;
}

/* 给这里的主要div和Toc.vue里的生效 */
@keyframes TocMove {
  from {
    transform: translate(var(--toc-move-start), 0);
  }
  to {
    transform: translate(var(--toc-move-end), 0);
  }
}
@keyframes TocMove2 {
  from {
    transform: translate(var(--toc-move-start), 0);
  }
  to {
    transform: translate(var(--toc-move-end), 0);
  }
}

[data-toc-play="0"] {
  animation: TocMove 0.3s;
  animation-fill-mode: forwards;
}
[data-toc-play="1"] {
  animation: TocMove2 0.3s;
  animation-fill-mode: forwards;
}
</style>
