<template>
  <div :style="sidebarAnimationVar" :data-movement-play="sidebarAnimationCtrl">
    <div id="mainwin_container" style="
        -webkit-overflow-scrolling: touch;
        overflow-x: hidden;
        display: inline-block;
        width: 90%;
        height: 100%;
      " ref="mainContainer" @click="SidebarClose()">
      <div id="main_frame" style="
          width: 100%;
          height: 100%;
          border: 0 none;
          overflow-x: hidden;
          text-align: left;
          padding-top: 1em;
        ">
        <AtxtArticle ref="aritcle" :password="queryPassword" :indexItem="currentIndex" @tag="ActiveTag($event)"
          @loaded="ArticleLoaded($event)" @direct="LoadAritcle($event)">
        </AtxtArticle>
        <div v-if="flowTrigger == 0" class="main_width" style="height: 3em; cursor: help" @click="ActiveFlow()"></div>
        <component v-for="f in flowIndexList" v-bind:is="'AtxtArticle'" :key="f.filename" :password="queryPassword"
          :indexItem="f" @tag="ActiveTag($event)" @direct="LoadAritcle($event)"></component>
      </div>
    </div>
    <ArticleList ref="list" :items="indexItems" :currentFile="currentFile" :queryTags="queryTags"
      @ClickItem="LoadAritcle($event)" @ClearQueryTags="ClearTags()"></ArticleList>

    <TableOfContent ref="toc" :toc="toc" @ClickItem="ScrollArticle($event)"></TableOfContent>

  </div>
  <div id="shift_button_left" class="button" :data-state="sidebarState" style="
        position: fixed;
        width: 3em;
        left: 0;
        height: 100%;
        margin: 0;
        bottom: 0;
        cursor: pointer;
      " @click="SidebarLeftShift"></div>
  <div id="shift_button_right" class="button" :data-state="sidebarState" style="
        position: fixed;
        width: 3em;
        right: 0;
        height: 100%;
        margin: 0;
        bottom: 0;
        cursor: pointer;
      " @click="SidebarRightShift" :data-disable="toc == null"></div>

</template>

<script>
import ArticleList from "./components/ArticleList.vue";
import AtxtArticle from "./components/AtxtArticle.vue";
import TableOfContent from "./components/TableOfContent.vue"

export default {
  name: "App",
  components: {
    ArticleList,
    AtxtArticle,
    TableOfContent
  },
  data() {
    return {
      title: "",
      indexItems: [],
      sidebarState: 'none',
      sidebarAnimationVar: "",
      sidebarAnimationCtrl: 0,
      listWidth: 100,
      tocWidth: 100,
      queryFilename: "",
      queryTags: [],
      queryPassword: "",
      flowTrigger: 0,
      flowIndexList: [],
      toc: null
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
      if(val){
      document.title =
        "Floating Whirl Island" + (val.title ? " | " + val.title : "");
      }else{
        document.title =
        "Floating Whirl Island | Not Found";
      }
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
        this.$refs.list.ScrollDisplay(this.currentFile);
      });
    },
    SidebarLeftShift() {
      if (this.sidebarState == "left") {
        this.SidebarLeftClose();
      } else {
        this.SidebarLeftOpen();
      }
    },
    SidebarLeftOpen() {
      let start = 0;
      if (this.sidebarState == 'left') {
        start = this.listWidth;
      }
      this.sidebarState = 'left';
      this.$nextTick(function () {
        this.listWidth = this.$refs.list.GetWidth();
        this.sidebarAnimationVar =
          `--sidebar-move-start: ${start}px;
         --sidebar-move-end: ${this.listWidth}px;`;
        this.sidebarAnimationCtrl = (this.sidebarAnimationCtrl + 1) % 2;
      });
    },
    SidebarLeftClose() {
      if (this.sidebarState != "left") return;
      let start = this.listWidth;
      this.sidebarState = 'none';
      this.$nextTick(function () {
        this.sidebarAnimationVar =
          `--sidebar-move-start: ${start}px; --sidebar-move-end:0px;`;
        this.sidebarAnimationCtrl = (this.sidebarAnimationCtrl + 1) % 2;
      });
    },
    SidebarRightShift() {
      if (this.sidebarState == "right") {
        this.SidebarRightClose();
      } else {
        this.SidebarRightOpen();
      }
    },
    SidebarRightOpen() {
      let start = 0;
      if (this.sidebarState == 'right') {
        start = this.tocWidth;
      }
      this.sidebarState = 'right';
      this.$nextTick(function () {
        this.tocWidth = this.$refs.toc.GetWidth();
        this.sidebarAnimationVar =
          `--sidebar-move-start: ${start}px;
         --sidebar-move-end: -${this.tocWidth}px;`;
        this.sidebarAnimationCtrl = (this.sidebarAnimationCtrl + 1) % 2;
      });
    },
    SidebarRightClose() {
      if (this.sidebarState != "right") return;
      let start = this.tocWidth;
      this.sidebarState = 'none';
      this.$nextTick(function () {
        this.sidebarAnimationVar =
          `--sidebar-move-start: -${start}px; --sidebar-move-end:0px;`;
        this.sidebarAnimationCtrl = (this.sidebarAnimationCtrl + 1) % 2;
      });
    },
    SidebarClose() {
      if (this.sidebarState == "none") return;
      this.SidebarRightClose();
      this.SidebarLeftClose();
    },
    LoadAritcle(filename) {
      if (this.queryFilename == filename) { return }
      const filename_reg = /^[a-zA-Z0-9_-]+$/;
      if (!filename_reg.test(filename)) {
        console.log("invalid filename: " + filename);
        return;
      }

      this.flowTrigger = 0;
      this.flowIndexList = [];
      this.queryFilename = filename;
      this.$refs.aritcle.Read(this.currentFile);
      this.$refs.list.ScrollDisplay(filename);
      this.SidebarClose();
      this.PushState();
    },
    ScrollArticle(entry) {
      console.log(entry)
      const e = document.getElementById(entry.id);
      const eRect = e.getBoundingClientRect();
      const bodyRect = document.body.getBoundingClientRect();
      window.scroll({
        top: eRect.top - bodyRect.top,
        left: 0,
        behavior: "smooth",
      });
      this.SidebarClose();
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
          this.$refs.list.ScrollDisplay(this.currentFile);
        });
      }
      this.SidebarLeftOpen();
      this.PushState();
    },
    ArticleLoaded(e) {
      const { toc } = e;
      this.toc = toc;
    },
    ClearTags() {
      this.flowTrigger = 0;
      this.flowIndexList = [];
      this.queryTags = [];
      this.$nextTick(() => {
        this.$refs.list.ScrollDisplay(this.currentFile);
      });
      this.SidebarLeftOpen();
      this.PushState();
    },
    ActiveFlow() {
      if (this.flowTrigger == 0) {
        this.flowTrigger = 1;
        let next = this.$refs.list.GetNext(this.currentIndex);
        if (next) this.flowIndexList.push(next);
      }
    },
    OnScroll() {
      if (this.flowTrigger > 0) {
        if (
          window.innerHeight + document.documentElement.scrollTop >
          document.body.scrollHeight - 200
        ) {
          let next = this.$refs.list.GetNext(
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

/* 给这里的主要div和list.vue里的生效 */
@keyframes sidebarMove {
  from {
    transform: translate(var(--sidebar-move-start), 0);
  }

  to {
    transform: translate(var(--sidebar-move-end), 0);
  }
}

@keyframes sidebarMove2 {
  from {
    transform: translate(var(--sidebar-move-start), 0);
  }

  to {
    transform: translate(var(--sidebar-move-end), 0);
  }
}

[data-movement-play="0"]>* {
  animation: sidebarMove 0.3s;
  animation-fill-mode: forwards;
}

[data-movement-play="1"]>* {
  animation: sidebarMove2 0.3s;
  animation-fill-mode: forwards;
}

#shift_button_left[data-state="right"] {
  display: none;
}

#shift_button_right[data-state="left"] {
  display: none;
}

#shift_button_right[data-disable="true"] {
  display: none;
}
</style>
