<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useData, useRoute, withBase } from 'vitepress';
import { versions, languages, latestVersion, defaultLanguage } from '../locales.js';

const { site, theme } = useData();
const route = useRoute();

const localPath = computed(() => {
    const base = site.value.base;
    let path = route.path;

    if (base !== '/' && path.startsWith(base)) {
        path = '/' + path.slice(base.length);
    }

    return path.replace(/\.html$/, '').replace(/\/index$/, '/');
});

const parsed = computed(() => {
    let segments = localPath.value.split('/').filter(Boolean);

    let version = latestVersion;
    if (versions.includes(segments[0])) {
        version = segments[0];
        segments = segments.slice(1);
    }

    let language = defaultLanguage;
    if (languages.some(([code]) => code === segments[0])) {
        language = segments[0];
        segments = segments.slice(1);
    }

    let page = '/' + segments.join('/');
    if (segments.length && localPath.value.endsWith('/')) page += '/';

    return { version, language, page };
});

const currentVersion = computed(() => parsed.value.version);
const currentLanguage = computed(() => parsed.value.language);
const currentLanguageLabel = computed(() => languages.find(([code]) => code === currentLanguage.value)?.[1] ?? '');

const trimSlash = (s) => s.replace(/\/$/, '');

function collectLinks(items, out = new Set()) {
    for (const item of items ?? []) {
        if (item.link) out.add(trimSlash(item.link));
        if (item.items) collectLinks(item.items, out);
    }
    return out;
}

function hasPage(version, language, page) {
    if (page === '/') return true;

    const sidebar = theme.value.sidebar;
    const items = sidebar && !Array.isArray(sidebar) ? sidebar[`/${version}/${language}`] : sidebar;
    const links = collectLinks(items);

    if (!links.size) return true;

    return links.has(trimSlash(`/${version}/${language}${page}`));
}

function getHref(version, language) {
    const { page } = parsed.value;
    const target = hasPage(version, language, page) ? page : '/';

    return withBase(`/${version}/${language}${target}`);
}

const flyouts = computed(() => [
    {
        id: 'version',
        label: 'Version',
        button: currentVersion.value,
        icon: null,
        title: null,
        items: versions.map((version) => ({
            key: version,
            text: version,
            active: version === currentVersion.value,
            href: getHref(version, currentLanguage.value),
        })),
    },
    {
        id: 'language',
        label: theme.value.langMenuLabel || 'Change language',
        button: '',
        icon: 'vpi-languages',
        title: currentLanguageLabel.value,
        items: languages
            .filter(([code]) => code !== currentLanguage.value)
            .map(([code, name]) => ({
                key: code,
                text: name,
                active: false,
                href: getHref(currentVersion.value, code),
            })),
    },
]);

const openId = ref(null);
const root = ref(null);

function toggle(id) {
    openId.value = openId.value === id ? null : id;
}

function onPointerEnter(event, id) {
    if (event.pointerType === 'mouse') openId.value = id;
}

function onPointerLeave(event, id) {
    if (event.pointerType === 'mouse' && openId.value === id) openId.value = null;
}

function onFocusOut(event, id) {
    if (!event.currentTarget.contains(event.relatedTarget) && openId.value === id) {
        openId.value = null;
    }
}

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) openId.value = null;
}

function onKeydown(event) {
    if (event.key === 'Escape' && openId.value) {
        const button = root.value?.querySelector(`[data-flyout="${openId.value}"] .button`);
        openId.value = null;
        button?.focus();
    }
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
    <div ref="root" class="version-language-dropdown">
        <div
            v-for="flyout in flyouts"
            :key="flyout.id"
            class="flyout"
            :class="{ open: openId === flyout.id }"
            :data-flyout="flyout.id"
            @pointerenter="onPointerEnter($event, flyout.id)"
            @pointerleave="onPointerLeave($event, flyout.id)"
            @focusout="onFocusOut($event, flyout.id)"
        >
            <button
                type="button"
                class="button"
                aria-haspopup="true"
                :aria-expanded="openId === flyout.id"
                :aria-label="flyout.label"
                @click="toggle(flyout.id)"
            >
                <span class="text">
                    <span v-if="flyout.icon" :class="[flyout.icon, 'option-icon']" />
                    <span v-if="flyout.button">{{ flyout.button }}</span>
                    <span class="vpi-chevron-down text-icon" />
                </span>
            </button>

            <div class="menu">
                <div class="menu-body">
                    <p v-if="flyout.title" class="title">{{ flyout.title }}</p>

                    <a
                        v-for="item in flyout.items"
                        :key="item.key"
                        class="link"
                        :class="{ active: item.active }"
                        :href="item.href"
                        :aria-current="item.active ? 'true' : undefined"
                        @click="openId = null"
                    >
                        {{ item.text }}
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.version-language-dropdown {
    display: flex;
    align-items: center;
}

.flyout {
    position: relative;
}

.button {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: var(--vp-nav-height);
    color: var(--vp-c-text-1);
    transition: color 0.5s;
    cursor: pointer;
}

.text {
    display: flex;
    align-items: center;
    line-height: var(--vp-nav-height);
    font-size: 14px;
    font-weight: 500;
    color: var(--vp-c-text-1);
    transition: color 0.25s;
}

.flyout:hover .button,
.flyout.open .button {
    color: var(--vp-c-brand-1);
}

.flyout:hover .text,
.flyout.open .text {
    color: var(--vp-c-text-2);
}

.option-icon {
    margin-right: 0;
    font-size: 16px;
}

.text-icon {
    margin-left: 4px;
    font-size: 14px;
}

.menu {
    position: absolute;
    top: calc(var(--vp-nav-height) / 2 + 20px);
    right: 0;
    z-index: 1;
    opacity: 0;
    visibility: hidden;
    transition:
        opacity 0.25s,
        visibility 0.25s;
}

.flyout:hover .menu,
.flyout.open .menu {
    opacity: 1;
    visibility: visible;
}

.menu-body {
    border-radius: 12px;
    padding: 12px;
    min-width: 128px;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-elv);
    box-shadow: var(--vp-shadow-3);
    max-height: calc(100vh - var(--vp-nav-height));
    overflow-y: auto;
    transition: background-color 0.5s;
}

.title {
    padding: 0 24px 0 12px;
    line-height: 32px;
    font-size: 14px;
    font-weight: 700;
    color: var(--vp-c-text-1);
}

.link {
    display: block;
    border-radius: 6px;
    padding: 0 12px;
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
    color: var(--vp-c-text-1);
    white-space: nowrap;
    text-decoration: none;
    transition:
        background-color 0.25s,
        color 0.25s;
}

.link:hover {
    color: var(--vp-c-brand-1);
    background-color: var(--vp-c-default-soft);
}

.link.active {
    color: var(--vp-c-brand-1);
}

@media (prefers-reduced-motion: reduce) {
    .menu,
    .button,
    .text,
    .link {
        transition: none;
    }
}
</style>
