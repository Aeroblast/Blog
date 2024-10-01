<template>
    <div :data-level="data.level">
    {{ data.text }}
    <ol v-if="data.children.length > 0">
        <li v-for="item in data.children">
            <TocNestedList :data="item"></TocNestedList>
        </li>
    </ol>
    </div>

</template>
<script>
export default {
    name: "TocNestedList",
    emits: ["ClickItem"],
    props: {
        data: null
    },
};
</script>
