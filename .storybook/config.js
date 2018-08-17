import {configure} from '@storybook/react';
import '@storybook/addon-console';

import { setOptions } from '@storybook/addon-options';

setOptions({ addonPanelInRight: true });

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);

function loadStories() {
    req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
