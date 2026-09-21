import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import path from 'node:path';
import { versions, languages } from './locales.js';

const ROOT = path.resolve(import.meta.dirname, '..');

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
    return items;
    // return [{ text: 'Home', link: `${url}/` }, ...items];
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

const searchTranslations = {
    en: {
        button: { buttonText: 'Search', buttonAriaLabel: 'Search' },
        modal: {
            displayDetails: 'Display detailed list',
            resetButtonTitle: 'Reset search',
            backButtonTitle: 'Close search',
            noResultsText: 'No results for',
            footer: {
                selectText: 'to select',
                selectKeyAriaLabel: 'enter',
                navigateText: 'to navigate',
                navigateUpKeyAriaLabel: 'up arrow',
                navigateDownKeyAriaLabel: 'down arrow',
                closeText: 'to close',
                closeKeyAriaLabel: 'escape',
            },
        },
    },
    ru: {
        button: { buttonText: 'Поиск', buttonAriaLabel: 'Поиск' },
        modal: {
            displayDetails: 'Показать подробный список',
            resetButtonTitle: 'Сбросить поиск',
            backButtonTitle: 'Закрыть поиск',
            noResultsText: 'Ничего не найдено по запросу',
            footer: {
                selectText: 'выбрать',
                selectKeyAriaLabel: 'enter',
                navigateText: 'перейти',
                navigateUpKeyAriaLabel: 'стрелка вверх',
                navigateDownKeyAriaLabel: 'стрелка вниз',
                closeText: 'закрыть',
                closeKeyAriaLabel: 'esc',
            },
        },
    },
};

const searchLocales = {};

for (const version of versions) {
    for (const [language] of languages) {
        searchLocales[`${version}/${language}`] = { translations: searchTranslations[language] };
    }
}

export default defineConfig({
    title: 'Scram :3',
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
        search: {
            provider: 'local',
            options: {
                locales: searchLocales,
                _render(src, env, md) {
                    const html = md.render(src, env);

                    if (env.frontmatter?.search === false) return '';
                    if (/<h[1-6][\s>]/.test(html)) return html;

                    // 0.2/ru/scripting/server/ServerPlayer.md -> ServerPlayer, .../npc/index.md -> NPC
                    const acronyms = { npc: 'NPC', hud: 'HUD', ui: 'UI', api: 'API' }; // как LABELS выше
                    const parts = env.relativePath.replace(/\.md$/, '').split('/');
                    if (parts.at(-1) === 'index') parts.pop();
                    const name = parts.at(-1) ?? '';
                    const fromPath =
                        acronyms[name.toLowerCase()] ??
                        name
                            .split(/[\s_-]+/)
                            .filter(Boolean)
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');

                    const title = env.frontmatter?.title ?? fromPath;
                    return md.render(`# ${title}`, {}) + html;
                },
            },
        },
    },
});
