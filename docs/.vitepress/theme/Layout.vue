<script setup>
import DefaultTheme from 'vitepress/theme';
import Authors from './Authors.vue';
</script>

<template>
    <DefaultTheme.Layout>
        <template #aside-outline-after>
            <Authors />
        </template>
    </DefaultTheme.Layout>
</template>
