/**
 * @sw-package framework
 */

import { mount } from '@vue/test-utils';

async function createWrapper(additionalOptions = {}) {
    return mount(await wrapTestComponent('sw-password-field', { sync: true }), {
        props: {},
        global: {
            stubs: {
                // @deprecated tag:v6.8.0.0 - Remove this mock with sw-password-field-deprecated.
                'sw-password-field-deprecated': true,
            },
        },
        ...additionalOptions,
    });
}

describe('src/app/component/base/sw-password-field', () => {
    it('should render the mt-password-field', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.html()).toContain('mt-password-field');
    });

    it('passes the value to the inner component', async () => {
        const wrapper = await createWrapper({
            props: {
                value: 'password',
            },
        });

        expect(wrapper.find('input').element.value).toBe('password');
    });
});
