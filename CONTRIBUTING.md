# 🤝 Contributing to Rayr QuantForge

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 📜 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/rayr-quantforge.git
   ```
3. **Navigate** to the project:
   ```bash
   cd rayr-quantforge
   ```
4. **Install** dependencies:
   ```bash
   npm install
   cd server && npm install && cd ..
   ```
5. **Create** a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 🛠️ How to Contribute

### 🐛 Bug Fixes

1. Check [existing issues](https://github.com/Rayr-06/rayr-quantforge/issues)
2. If not reported, create a new issue
3. Fix the bug in your fork
4. Submit a pull request

### ✨ New Features

1. Open an issue first to discuss the feature
2. Get approval from maintainers
3. Implement the feature
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

### 📝 Documentation

1. Check for typos or unclear sections
2. Suggest improvements
3. Submit a pull request

---

## 💻 Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- TradingView account (for testing)
- Zerodha account (for live trading)

### Local Development

```bash
# Terminal 1: Dashboard
npm run dev

# Terminal 2: Server
cd server
node webhook-server.js

# Terminal 3: ngrok (for TradingView)
ngrok http 3001
```

### Project Structure

```
rayr-quantforge/
├── src/                 # Frontend code
├── server/              # Backend code
├── tradingview/         # Pine scripts
└── docs/                # Documentation
```

---

## 📬 Pull Request Process

### 1. Update Your Fork

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Create Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes

- Write clean, readable code
- Follow style guidelines
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes

```bash
# Run build
npm run build

# Test locally
npm run dev

# Test server
cd server && node webhook-server.js
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

**Commit Message Format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance

### 6. Push to Fork

```bash
git push origin feature/amazing-feature
```

### 7. Create Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit!

---

## 🎨 Style Guidelines

### TypeScript/JavaScript

- Use TypeScript when possible
- Follow ESLint rules
- Use meaningful variable names
- Add type annotations
- Use async/await over callbacks

### React

- Use functional components
- Use hooks for state
- Keep components small
- Use proper prop types

### CSS/Tailwind

- Use Tailwind classes
- Follow naming conventions
- Keep styles consistent

---

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Make sure you're on latest version
3. Try to reproduce the bug

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
```

---

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution**
What you want to happen.

**Describe alternatives**
Any alternative solutions considered.

**Additional context**
Any other information, screenshots, etc.
```

---

## 📞 Questions?

- Open a [Discussion](https://github.com/Rayr-06/rayr-quantforge/discussions)
- Check the [Documentation](docs/)

---

## 🙏 Thank You!

Your contributions help make this project better for everyone!
