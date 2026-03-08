## 2024-05-15 - ARIA and Focus Polish for Review Modals
**Learning:** Found an accessibility issue pattern where custom visual interactive elements like comment icons embedded in diff views lack both semantic ARIA labels and clear focus rings, making them invisible to screen readers and difficult to navigate via keyboard.
**Action:** When adding interactive icons to complex nested views (like a diff viewer), always pair ARIA labels with explicit `:focus-visible` styling (`outline: 2px solid var(--accent); outline-offset: -2px;`) to ensure full keyboard and screen reader accessibility without adding custom CSS classes.

## 2024-05-20 - Custom Interactive Div Accessibility
**Learning:** In vanilla JavaScript UI with custom interactive components like accordions (e.g., file diff expanders built with `<div>`), developers frequently forget keyboard accessibility. Since they aren't native `<button>` or `<details>` elements, keyboard users cannot tab to them or activate them with Enter/Space.
**Action:** When creating or modifying custom interactive `.file-header` components (or similar interactive `<div>` elements), always implement explicit ARIA attributes (`role="button"`, `tabindex="0"`, `aria-expanded`), add `:focus-visible` styling for a clear focus ring, and attach a keyboard event handler (`onkeydown`) to trigger the same action as the click event on Enter or Space keys.
