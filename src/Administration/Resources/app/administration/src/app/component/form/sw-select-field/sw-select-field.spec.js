/**
 * @sw-package framework
 */

import { mount } from '@vue/test-utils';

async function createWrapper() {
    return mount(await wrapTestComponent('sw-select-field', { sync: true }), {
        props: {
            options: [],
        },
        global: {
            stubs: {
                // @deprecated tag:v6.8.0.0 - Remove this mock with sw-select-field-deprecated.
                'sw-select-field-deprecated': true,
            },
        },
    });
}

describe('src/app/component/base/sw-select-field', () => {
    it('should render the mt-select-field', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.html()).toContain('mt-select');
    });
});
