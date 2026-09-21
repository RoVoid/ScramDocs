<script setup lang="ts">
import { useData } from 'vitepress';

const { frontmatter } = useData();
</script>

<template>
    <div v-if="frontmatter.authors?.length" class="authors">
        <div class="authors-title">Authors</div>

        <a
            v-for="a in frontmatter.authors"
            :key="a"
            :href="`https://github.com/${a}`"
            target="_blank"
            rel="noopener"
            class="author"
        >
            <img :src="`https://github.com/${a}.png?size=40`" :alt="a" />
            <span>{{ a }}</span>
        </a>
    </div>
</template>
