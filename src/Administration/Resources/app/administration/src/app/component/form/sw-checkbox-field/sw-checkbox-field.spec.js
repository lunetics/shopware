/**
 * @sw-package framework
 */

import { mount } from '@vue/test-utils';

async function createWrapper(additionalOptions = {}) {
    return mount(await wrapTestComponent('sw-checkbox-field', { sync: true }), {
        global: {
            stubs: {
                'mt-checkbox': true,
                // @deprecated tag:v6.8.0.0 - Remove this mock with sw-checkbox-field-deprecated.
                'sw-checkbox-field-deprecated': true,
            },
        },
        props: {},
        ...additionalOptions,
    });
}

describe('src/app/component/base/sw-checkbox-field', () => {
    it('should render the mt-checkbox', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.html()).toContain('mt-checkbox');
    });
});
