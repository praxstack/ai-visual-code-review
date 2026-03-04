## 2024-05-15 - ARIA and Focus Polish for Review Modals
**Learning:** Found an accessibility issue pattern where custom visual interactive elements like comment icons embedded in diff views lack both ARIA descriptions and `:focus-visible` styling, making them invisible and unexplained to keyboard/screen reader users.
**Action:** When adding interactive icons to complex nested views (like a diff viewer), always pair ARIA labels with explicit `:focus-visible` styling that matches the `:hover` interaction to ensure full keyboard support.

## 2024-05-15 - ARIA Expanded and Keyboard Support for Accordions
**Learning:** Adding keyboard support to composite components (like an accordion header with internal buttons/checkboxes) requires careful event handling to prevent inner element interactions from triggering the parent action.
**Action:** When adding `onkeydown` to make a component accessible, always check `event.target === this` if there are nested interactive elements. Also, remember to dynamically update `aria-expanded` state during the toggling lifecycle to communicate visibility to screen readers.
