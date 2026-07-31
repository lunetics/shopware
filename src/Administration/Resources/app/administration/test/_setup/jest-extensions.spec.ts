/**
 * @sw-package framework
 */

import { createActiveFeatureFlagsTest, createDeprecatedTest } from './jest-extensions';

const defaultActiveFeatureFlags =
    (Reflect.get(globalThis, Symbol.for('shopware.defaultActiveFeatureFlags')) as string[] | undefined) ?? [];

describe('Jest feature flag extensions', () => {
    it('registers a deprecated test when its major feature flag is inactive', () => {
        const testFunction = Object.assign(jest.fn(), { skip: jest.fn() }) as unknown as jest.It;

        // CHANGE REASON: A synthetic future version keeps this inactive-case assertion independent of the runner baseline. @harness
        createDeprecatedTest(testFunction)('v99.0.0.0')('deprecated test', jest.fn());

        expect(testFunction).toHaveBeenCalledWith('deprecated test', expect.any(Function));
        expect(testFunction.skip).not.toHaveBeenCalled();
    });

    // CHANGE REASON: The helper activates V6_8_0_0 without mutating the shared feature-flag global manually. @harness
    it.activeFeatureFlags(['v6.8.0.0'])('skips a deprecated test when its major feature flag is active', () => {
        const testFunction = Object.assign(jest.fn(), { skip: jest.fn() }) as unknown as jest.It;

        createDeprecatedTest(testFunction)('v6.8.0.0')('deprecated test', jest.fn());

        expect(testFunction).not.toHaveBeenCalled();
        expect(testFunction.skip).toHaveBeenCalledWith('deprecated test', expect.any(Function));
    });

    describe('active feature flag lifecycle', () => {
        let featureFlagsInSetup: string[] = [];

        beforeEach(() => {
            featureFlagsInSetup = [...globalThis.activeFeatureFlags];
        });

        afterEach(() => {
            // eslint-disable-next-line jest/no-standalone-expect -- Verifies the flags remain active after the test callback.
            expect(globalThis.activeFeatureFlags).toEqual([
                // CHANGE REASON: Active test flags are additive to feature flags supplied by the current Jest runner. @harness
                ...defaultActiveFeatureFlags,
                'EXISTING_FEATURE',
                'NEW_FEATURE',
            ]);
        });

        afterAll(() => {
            // eslint-disable-next-line jest/no-standalone-expect -- Verifies the environment restores the flags after teardown.
            // CHANGE REASON: Teardown restores the runner's default feature flags instead of assuming an empty baseline. @harness
            expect(globalThis.activeFeatureFlags).toEqual(defaultActiveFeatureFlags);
        });

        it.activeFeatureFlags([
            'EXISTING_FEATURE',
            'NEW_FEATURE',
        ])('activates feature flags during setup, the test, and teardown', () => {
            expect(globalThis.activeFeatureFlags).toEqual([
                // CHANGE REASON: Active test flags are additive to feature flags supplied by the current Jest runner. @harness
                ...defaultActiveFeatureFlags,
                'EXISTING_FEATURE',
                'NEW_FEATURE',
            ]);

            expect(featureFlagsInSetup).toEqual([
                // CHANGE REASON: Setup observes the runner baseline together with the test-scoped feature flags. @harness
                ...defaultActiveFeatureFlags,
                'EXISTING_FEATURE',
                'NEW_FEATURE',
            ]);
        });
    });

    it('registers feature flags for the created test', () => {
        let registeredFeatureFlags: string[] = [];
        const testFunction = jest.fn((name: string, callback: jest.ProvidesCallback) => {
            const featureFlags: unknown = Reflect.get(callback, Symbol.for('shopware.activeFeatureFlags'));
            registeredFeatureFlags = Array.isArray(featureFlags)
                ? featureFlags.filter((featureFlag): featureFlag is string => typeof featureFlag === 'string')
                : [];
        }) as unknown as jest.It;
        const callback = jest.fn();

        createActiveFeatureFlagsTest(testFunction)(['NEW_FEATURE'])('feature test', callback);

        expect(testFunction).toHaveBeenCalledWith('feature test', callback, undefined);
        expect(registeredFeatureFlags).toEqual(['NEW_FEATURE']);
        expect(Reflect.has(callback, Symbol.for('shopware.activeFeatureFlags'))).toBeFalsy();
    });

    it('normalizes feature flags registered for a test', () => {
        let registeredFeatureFlags: string[] = [];
        const testFunction = jest.fn((name: string, callback: jest.ProvidesCallback) => {
            const featureFlags: unknown = Reflect.get(callback, Symbol.for('shopware.activeFeatureFlags'));
            registeredFeatureFlags = Array.isArray(featureFlags)
                ? featureFlags.filter((featureFlag): featureFlag is string => typeof featureFlag === 'string')
                : [];
        }) as unknown as jest.It;

        createActiveFeatureFlagsTest(testFunction)(['v6.8.0.0'])('feature test', jest.fn());

        expect(registeredFeatureFlags).toEqual(['V6_8_0_0']);
    });
});
