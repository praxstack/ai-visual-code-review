# Contributing to AI Visual Code Review

Thank you for your interest in contributing to AI Visual Code Review! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Convention](#commit-message-convention)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create a branch** for your feature/fix
4. **Make changes** and test them
5. **Submit a Pull Request**

## Development Setup

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-visual-code-review.git
cd ai-visual-code-review

# Install dependencies
npm install

# Install VSCode extension dependencies
cd vscode-extension && npm install && cd ..

# Run tests
npm test

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run build` | Build project |
| `npm run vscode:compile` | Compile VSCode extension |

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Use the bug report template
3. Include:
   - Node.js version
   - OS and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages/logs

### Suggesting Features

1. Check existing feature requests
2. Use the feature request template
3. Explain the use case
4. Describe expected behavior

### Code Contributions

1. Look for issues labeled `good first issue` or `help wanted`
2. Comment on the issue to claim it
3. Fork and create a feature branch
4. Make your changes
5. Submit a PR

## Pull Request Process

1. **Update documentation** for any new features
2. **Add tests** for new functionality
3. **Run the test suite** and ensure all tests pass
4. **Follow coding standards** and commit conventions
5. **Link related issues** in the PR description
6. **Wait for review** and address feedback

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages follow convention

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Use `const` by default, `let` when reassignment needed
- Never use `var`
- Use template literals for string interpolation
- Use async/await over callbacks
- Add JSDoc comments for public functions

### Code Style

We use ESLint to enforce consistent code style:

```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint:fix
```

### File Organization

```
src/
├── config/      # Configuration modules
├── middleware/  # Express middleware
├── routes/      # API route handlers
└── utils/       # Utility functions

services/        # Business logic services
public/          # Static frontend files
test/            # Test files
```

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/server.test.js

# Run with coverage
npm run test:coverage
```

### Writing Tests

- Place tests in `test/` directory
- Name test files `*.test.js`
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Test edge cases and error conditions

### Example Test

```javascript
describe('API Endpoint', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('healthy');
  });
});
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Code style (formatting) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvement |
| `security` | Security fix |

### Examples

```bash
feat(api): add file exclusion support
fix(cli): resolve path traversal vulnerability
docs(readme): update installation instructions
test(server): add rate limiting tests
```

## Questions?

- Open an issue with your question
- Tag it with `question` label
- We'll respond as soon as possible

---

Thank you for contributing! 🎉
