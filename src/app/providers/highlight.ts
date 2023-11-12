import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import hljsVuePlugin from '@highlightjs/vue-plugin';
import 'highlight.js/styles/tokyo-night-dark.css';

hljs.registerLanguage('json', json);

export const highlight = hljsVuePlugin;
