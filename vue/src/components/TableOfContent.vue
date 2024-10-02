<template>
  <nav ref="toc" id="TableOfContent" style="
        position: fixed;
        width: max-content;
        left: 100%;
        top: 0;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        padding-right: 3em;
      ">
    <div style="height: 5em;"></div>
    <ol style="margin-left: 1em;" v-if="toc != null">
      <TocNestedList :data="toc" @click-item="$emit('ClickItem', $event)"></TocNestedList>
    </ol>
    <div style="height: 40%; width: 1px"><!--for scroll--></div>
  </nav>
</template>

<script>
import TocNestedList from "./TocNestedList.vue";

export default {
  name: "TableOfContent",
  emits: ["ClickItem"],
  components: {
    TocNestedList
  },
  props: {
    toc: Object,
    currentFile: String,
    queryTags: Array,
  },
  methods: {
    GetWidth() {
      return this.$refs.toc.offsetWidth;
    },
    ScrollDisplay(filename) {
      let a = "tocItem_" + filename;
      let e = this.$refs[a];
      if (e) this.$refs.toc.scroll(0, e.offsetTop - window.innerHeight / 3);
    },
    needDrawOut(content) {
      if (!content) return false;
      const toc = ["「", "『", "（", "【"];
      for (const k of toc) {
        if (content[0] == k) return true;
      }
      return false;
    },
  },
  computed: {},
};

</script>

<style>
.toc_item:hover {
  background: #303030;
}

.toc_item:link {
  color: inherit;
}

.toc_item:visited {
  color: inherit;
}

.toc_drawout {
  text-indent: 0em;
}

#TableOfContent ::-webkit-scrollbar {
  display: none;
}

#TableOfContent {
  overflow: scroll;
}

#TableOfContent::-webkit-scrollbar {
  display: none;
}

#TableOfContent *[data-display="false"] {
  display: none;
}

#TableOfContent *[data-select="true"] {
  color: white !important;
  box-shadow: inset 0 0 3px 1px #c76e87;
}

#TableOfContent ol {
  text-align: left;
  padding-left: 0;
}

#TableOfContent>ol {
  max-width: 50vw;
}

#TableOfContent li {
  list-style: none;
}

#TableOfContent [data-level] {
  text-indent: -1em;
  margin-left: 1em;
}

#TableOfContent [data-level] .text {
  padding: 0.3em 0;
  cursor: pointer;
  display: inline-block;
  width: 100%;
  line-height: 1.4;
}

#TableOfContent [data-level] .text:hover {
  background: #303030;
}

#TableOfContent [data-level="1"] .text:before {
  content: "◉ ";
}

#TableOfContent [data-level="2"] .text:before {
  content: "● ";
}

#TableOfContent [data-level="3"] .text:before {
  content: "\25B6 \FE0E ";
}

#TableOfContent [data-level="4"] .text:before {
  content: "▷ ";
}

#TableOfContent [data-level="5"] .text:before {
  content: "◆ ";
}

#TableOfContent [data-level="6"] .text:before {
  content: "◇ ";
}
</style>