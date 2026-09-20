import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import path from 'node:path';
import { versions, languages } from './locales.js';

const ROOT = path.resolve(__dirname, '..');

function prefix(version, language) {
    return `/${version}/${language}`;
}

const LABELS = {
    npc: 'NPC',
    hud: 'HUD',
    ui: 'UI',
    api: 'API',
};

function label(name) {
    const override = LABELS[name.toLowerCase()];
    if (override) return override;

    return name
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
const byName = (a, b) => collator.compare(a.name, b.name);

function getSidebar(version, language) {
    const url = prefix(version, language);
    const items = getEntries(path.join(ROOT, version, language), url);

    return [{ text: 'Home', link: `${url}/` }, ...items];
}

function getEntries(dir, url) {
    if (!fs.existsSync(dir)) return [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const pages = entries
        .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md')
        .sort(byName)
        .map((e) => {
            const name = e.name.slice(0, -3);
            return { text: label(name), link: `${url}/${name}` };
        });

    const groups = entries
        .filter((e) => e.isDirectory())
        .sort(byName)
        .map((e) => {
            const childDir = path.join(dir, e.name);
            const childUrl = `${url}/${e.name}`;
            const hasIndex = fs.existsSync(path.join(childDir, 'index.md'));
            const items = getEntries(childDir, childUrl);

            if (!hasIndex && !items.length) return null;

            if (!items.length) return { text: label(e.name), link: `${childUrl}/` };

            return {
                text: label(e.name),
                ...(hasIndex && { link: `${childUrl}/` }),
                collapsed: false,
                items,
            };
        })
        .filter(Boolean);

    return [...pages, ...groups];
}

const sidebar = {};

for (const version of versions) {
    for (const [language] of languages) {
        sidebar[prefix(version, language)] = getSidebar(version, language);
    }
}

const locales = {};

for (const version of versions) {
    for (const [language] of languages) {
        locales[`${version}/${language}`] = {
            label: '',
            lang: language,
            link: `${prefix(version, language)}/`,
        };
    }
}

export default defineConfig({
    title: 'Documentation',
    cleanUrls: true,
    locales,

    themeConfig: {
        nav: [{ component: 'VersionLanguageDropdown' }],
        sidebar,
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/TheUranofficial/Scram',
            },
        ],
    },
});
