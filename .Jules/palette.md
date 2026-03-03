## 2024-05-15 - ARIA and Focus Polish for Review Modals
**Learning:** Found an accessibility issue pattern where custom visual interactive elements like comment icons embedded in diff views lack both ARIA descriptions and `:focus-visible` styling, making them invisible and unexplained to keyboard/screen reader users.
**Action:** When adding interactive icons to complex nested views (like a diff viewer), always pair ARIA labels with explicit `:focus-visible` styling that matches the `:hover` interaction to ensure full keyboard support.
