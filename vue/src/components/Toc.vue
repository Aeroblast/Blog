<template>
  <div
    ref="toc"
    id="toc"
    style="
      position: fixed;
      width: auto;
      max-width: 100%;
      right: 100%;
      top: 0;
      height: 100%;
      border-right: 1px solid brown;
      background: rgba(0, 0, 0, 0.5);
    "
    :data-toc-play="tocAnimationCtrl"
  >
    <div style="margin: 1em 0.5em" v-if="queryTags.length > 0">
      Tag Search
      <span style="cursor: pointer" @click="$emit('ClearQueryTags')">❌</span>
      :<br />
      <div
        class="tag"
        style="cursor: default"
        v-for="tag in queryTags"
        :key="tag"
      >
        {{ tag }}
      </div>
    </div>
    <a class="toc_item_dummy"></a>
    <a
      class="toc_item"
      v-for="item in items"
      :key="item.filename"
      :data-select="item.filename == currentFile"
      :data-display="isDisplay(item)"
      :href="'?n=' + item.filename"
      @click.prevent="$emit('ClickItem', item.filename)"
    >
      {{ item.title ? item.title : item.filename }}
    </a>
    <div style="height: 40%; width: 1px"><!--for scroll--></div>
  </div>
</template>

<script>
export default {
  name: "TableOfContents",
  emits: ["ClickItem", "ClearQueryTags"],
  props: {
    items: Array,
    currentFile: String,
    tocAnimationCtrl: Number,
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
      return this.$refs.toc.offsetWidth;
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
.toc_item:hover {
  background: #303030;
}

.toc_item {
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
}
.toc_item_dummy {
  border-bottom: #660000 solid 2px;
  margin-left: 3em;
  display: block;
}

.toc_item:link {
  color: inherit;
}

.toc_item:visited {
  color: inherit;
}

::-webkit-scrollbar {
  display: none;
}

#toc {
  overflow: scroll;
}

#toc::-webkit-scrollbar {
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
