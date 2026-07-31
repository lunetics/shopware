# Administration major-Jest bugs

These failures surfaced while running the complete Administration Jest suite with all major feature flags enabled. In accordance with the migration recipe, the affected tests are intentionally left failing until the underlying product or test-infrastructure bug is fixed.

## Final verification

The final major-mode run executed 14,669 tests: 14,305 passed, 140 were skipped, and 224 failed across 43 suites. Every remaining failure is accounted for below:

- 201 assertions across 35 specs emit the deprecated `sw-popover.resizeWidth` warning.
- 19 assertions across 5 specs emit the `MtTabs` fragment-root attribute warning.
- 1 assertion exposes the Axios cancellation mismatch.
- 2 assertions expose the CMS product-list category regression.
- 1 assertion is the order-dependent product-list query-ranking test that also fails without major mode.

## Deprecated `sw-popover.resizeWidth` is still used

- Symptom: `sw-popover` emits `The "resizeWidth" prop is deprecated and will be removed in v6.8.0` and the Jest environment turns the warning into a failure.
- Root cause: `sw-select-result-list.html.twig` still binds `:resize-width="popoverResizeWidth"`, and `sw-multi-tag-select.html.twig` still binds `:resize-width="true"` when `V6_8_0_0` is active.
- Initial-run impact: 203 failed assertions across 37 specs. The largest affected spec is `sw-system-config.spec.js`; select, rule-condition, import/export, order, product, flow, settings, and SSO specs are affected as well.
- Final-run impact after expectation migrations: 201 failed assertions across 35 specs.
- Secondary blocker: several affected specs stub `mt-floating-ui` as `true`, which drops the popover slot in the v6.8 rendering path. After the production warning is fixed, those stubs must forward the default slot before their DOM assertions can pass.
- Suggested fix: migrate the remaining callers to `match-reference-width`, then update only the affected test doubles to render `<slot />`.

## `MtTabs` forwards attributes to a fragment root

- Symptom: Vue warns that attributes such as `class` or `position-identifier` cannot be inherited because `MtTabs` renders fragment roots; Jest treats the warning as a failure.
- Initial-run impact: 19 assertions in `sw-settings-tag-detail-assignments.spec.js`, `sw-bulk-edit-custom-fields.spec.js`, the CMS category-name and product-name config specs, and `sw-customer-detail-base.spec.js`.
- Suggested fix: make the Meteor tabs component consume or forward the attributes explicitly. Do not silence the Vue warning in the affected tests.

## Search cancellation uses incompatible Axios error classes

- Symptom: `searchApiService is request aborted correctly` fails under the major runner.
- Root cause: `SearchApiService` checks `CanceledError` imported from the Axios entry point while the rejected request supplies the other Axios client version's cancellation class, so the `instanceof` check misses it.
- Suggested fix: detect cancellation through an Axios-version-independent contract or use the cancellation class belonging to the active client.

## CMS product-list layout assignment loses category selection

- Symptom: `should render category selection` and `should increment categoryIndex and update page.categories` fail when `V6_8_0_0` is active.
- Root cause: the `product_list` assignment path no longer renders or updates the category selector in the v6.8 tab implementation.
- Suggested fix: restore the category-selection contract in the Meteor-tab branch; keep the existing tests as the regression coverage.

## Product-list query-ranking test is order-dependent

- Symptom: `sw-product-list.spec.js › should add query score to the criteria` expects one call but intermittently receives two.
- Evidence: the same failure reproduces with the normal Jest baseline, so it is not a feature-flag expectation change.
- Root cause: a reactive/initial product reload can overlap the explicit `getList()` invocation under test.
- Suggested fix: isolate the reactive initialization from the explicit reload or assert the query-building result instead of an unstable aggregate call count.
