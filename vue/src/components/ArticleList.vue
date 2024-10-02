<template>
  <nav ref="list" id="ArticleList" style="
      position: fixed;
      width: auto;
      max-width: 100%;
      right: 100%;
      top: 0;
      height: 100%;
      border-right: 1px solid brown;
      background: rgba(0, 0, 0, 0.5);
    " data-nosnippet>
    <div style="margin: 1em 0.5em" v-if="queryTags.length > 0">
      Tag Search
      <span style="cursor: pointer" @click="$emit('ClearQueryTags')">❌</span>
      :<br />
      <div class="tag" style="cursor: default" v-for="tag in queryTags" :key="tag">
        {{ tag }}
      </div>
    </div>
    <a class="list_item_dummy"></a>
    <a :class="'list_item ' + (needDrawOut(item.title) ? 'list_drawout' : '')" v-for="item in items"
      :ref="'listItem_' + item.filename" :key="item.filename" :data-select="item.filename == currentFile"
      :data-display="isDisplay(item)" :href="'?n=' + item.filename" @click.prevent="$emit('ClickItem', item.filename)">
      {{ item.title ? item.title : item.filename }}
    </a>
    <div style="height: 40%; width: 1px"><!--for scroll--></div>
  </nav>
</template>

<script>
export default {
  name: "ArticleList",
  emits: ["ClickItem", "ClearQueryTags"],
  props: {
    items: Array,
    currentFile: String,
    queryTags: Array,
  },
  methods: {
    isDisplay(item) {
      if (item.special) {
        if (item.special == "tag" && this.queryTags.length > 0) {
          return Contains(this.queryTags, item.tags[0]);
        }
        return false;
      }
      if (this.queryTags.length == 0) return true;
      for (const e of this.queryTags) {
        if (Contains(item.tags, e)) {
          return true;
        }
      }
      return false;
    },
    GetWidth() {
      return this.$refs.list.offsetWidth;
    },
    GetNext(indexItem) {
      let flag = false;
      for (const obj of this.items) {
        if (obj.filename == indexItem.filename) {
          flag = true;
          continue;
        }
        if (flag) {
          if (this.isDisplay(obj)) {
            return obj;
          }
        }
      }
      return null;
    },
    ScrollDisplay(filename) {
      let a = "listItem_" + filename;
      let e = this.$refs[a];
      if (!e) { return; }
      e = e[0];
      if (!e) { return; }
      this.$refs.list.scroll({
        left: 0,
        top: e.offsetTop - window.innerHeight / 3,
        behavior: "smooth",
      });

    },
    needDrawOut(content) {
      if (!content) return false;
      const list = ["「", "『", "（", "【"];
      for (const k of list) {
        if (content[0] == k) return true;
      }
      return false;
    },
  },
  computed: {},
};

function Contains(array, target) {
  for (const e of array) {
    if (e == target) return true;
  }
  return false;
}
</script>

<style scoped>
.list_item:hover {
  background: #303030;
}

.list_item {
  display: block;
  text-decoration: none;
  color: inherit;
  border-bottom: #660000 solid 2px;
  white-space: nowrap;
  overflow-x: scroll;
  padding-top: 0.2em;
  padding-bottom: 0.2em;
  padding-right: 0.5em;
  padding-left: 0.5em;
  margin-left: 3em;
  background: #101010;
  cursor: pointer;
  text-align: left;
  text-indent: 0.5em;
}

.list_item_dummy {
  border-bottom: #660000 solid 2px;
  margin-left: 3em;
  display: block;
}

.list_item:link {
  color: inherit;
}

.list_item:visited {
  color: inherit;
}

.list_drawout {
  text-indent: 0em;
}

::-webkit-scrollbar {
  display: none;
}

#ArticleList {
  overflow: scroll;
}

#ArticleList::-webkit-scrollbar {
  display: none;
}

*[data-display="false"] {
  display: none;
}

*[data-select="true"] {
  color: white !important;
  box-shadow: inset 0 0 3px 1px #c76e87;
}
</style>
