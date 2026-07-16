# Contributing to Pagemark

Thank you for your interest in contributing to Pagemark! We want to make contributing as clean, safe, and productive as possible.

---

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rafifmsn/pagemark.git
   cd pagemark
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run local development server**:
   ```bash
   # For Google Chrome
   npm run dev

   # For Mozilla Firefox
   npm run dev:firefox
   ```

---

## How to Load the Extension in Your Browser

### Google Chrome / Chromium-Based (Brave, Edge, Opera)
1. Open Chrome and navigate to `chrome://extensions`.
2. Toggle **Developer mode** in the top right.
3. Click **Load unpacked** in the top left.
4. Select the `build/chrome-mv3-dev` directory created by Plasmo.

### Mozilla Firefox
1. Open Firefox and navigate to `about:debugging`.
2. Click **This Firefox** on the left menu.
3. Click **Load Temporary Add-on...** under Temporary Extensions.
4. Select the `build/firefox-mv3-dev/manifest.json` file.

---

## Development Workflow

### Branch Naming Conventions
Please create feature/bugfix branches off the `main` or development branch. Use descriptive names following this convention:
- `feat/feature-name` (e.g. `feat/firefox-support`)
- `fix/bug-name` (e.g. `fix/shortcut-conflict`)
- `chore/task-name` (e.g. `chore/add-ci-pipeline`)

### Commits
We follow standard commit formats:
- `feat: ...` for new features or capabilities.
- `fix: ...` for bug fixes.
- `chore: ...` for build, dependencies, configuration updates.
- `docs: ...` for documentation modifications.

---

## Testing

Before submitting a PR, make sure your code builds successfully and all unit tests pass.

### Unit Tests
We use **Vitest** for fast, lightweight helper testing.
```bash
npm run test
```

### Build Verification
Always run build tasks for both targets to confirm there are no bundler or TypeScript type errors:
```bash
npm run build:chrome
npm run build:firefox
```
