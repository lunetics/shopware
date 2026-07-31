/**
 * @sw-package framework
 */

import { mount } from '@vue/test-utils';

async function createWrapper(additionalOptions = {}) {
    return mount(await wrapTestComponent('sw-url-field', { sync: true }), {
        global: {
            stubs: {
                'mt-url-field': true,
                // @deprecated tag:v6.8.0.0 - Remove this mock with sw-url-field-deprecated.
                'sw-url-field-deprecated': true,
            },
        },
        props: {},
        ...additionalOptions,
    });
}

describe('src/app/component/base/sw-url-field', () => {
    it('should render the mt-url-field', async () => {
        const wrapper = await createWrapper();
        expect(wrapper.html()).toContain('mt-url-field');
    });
});
