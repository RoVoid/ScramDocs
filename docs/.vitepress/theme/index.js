import DefaultTheme from 'vitepress/theme';
import VersionLanguageDropdown from './VersionLanguageDropdown.vue';

import './custom.css';

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('VersionLanguageDropdown', VersionLanguageDropdown);
    },
};
