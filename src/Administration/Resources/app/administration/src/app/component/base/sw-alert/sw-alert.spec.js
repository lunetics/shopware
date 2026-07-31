/**
 * @sw-package framework
 */

import { mount } from '@vue/test-utils';

async function createWrapper(additionalOptions = {}) {
    return mount(await wrapTestComponent('sw-alert', { sync: true }), {
        props: {},
        global: {
            stubs: {
                // @deprecated tag:v6.8.0.0 - Remove this mock with sw-alert-deprecated.
                'sw-alert-deprecated': true,
            },
        },
        ...additionalOptions,
    });
}

describe('src/app/component/base/sw-alert', () => {
    it('should render the mt-banner', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.html()).toContain('mt-banner');
    });
});
