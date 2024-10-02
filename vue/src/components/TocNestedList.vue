<template>
    <div :data-level="data.level">
        <div class="text" @click.once="$emit('ClickItem', data)">{{ data.text }}</div>
        <ol v-if="data.children.length > 0">
            <li v-for="item in data.children">
                <TocNestedList :data="item" @ClickItem="$emit('ClickItem', $event)"></TocNestedList>
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
