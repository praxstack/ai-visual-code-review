## 2024-05-15 - ARIA and Focus Polish for Review Modals
**Learning:** Found an accessibility issue pattern where custom visual interactive elements like comment icons embedded in diff views lack both ARIA descriptions and `:focus-visible` styling, making them invisible and unexplained to keyboard/screen reader users.
**Action:** When adding interactive icons to complex nested views (like a diff viewer), always pair ARIA labels with explicit `:focus-visible` styling that matches the `:hover` interaction to ensure full keyboard support.

## 2024-05-16 - Full Accessibility for Div-Based Accordion Headers
**Learning:** Discovered that custom div-based interactive elements used for accordion behaviors (e.g., file headers to show diffs) often lack keyboard interactivity out-of-the-box. When building such headers, screen reader and keyboard-only users will miss the content entirely without deliberate enhancements.
**Action:** Always implement explicit ARIA attributes (`role="button"`, `tabindex="0"`, `aria-expanded`), add `:focus-visible` styling matching `:hover`, and ensure `onkeydown` supports both 'Enter' and 'Space' actions.
