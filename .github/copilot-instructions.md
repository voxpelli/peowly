# Peowly - CLI Parser Library

Peowly is a Node.js ESM package that provides a `meow` inspired CLI parser based on Node.js built-in `parseArgs()`. It includes comprehensive help text helpers for building command-line applications.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites
- Node.js >=18.6.0 (currently tested with v20.19.4)
- npm >=10.0.0 (currently tested with v10.8.2)

### Bootstrap and Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```
   - Takes approximately 45 seconds to complete
   - Installs 509+ packages including dev dependencies
   - Runs `husky` prepare script automatically
   - Set timeout to 90+ seconds: NEVER CANCEL during installation

2. **Build the project:**
   ```bash
   npm run build
   ```
   - Takes approximately 4-5 seconds to complete
   - Cleans existing declaration files
   - Generates TypeScript declarations with `tsc -p declaration.tsconfig.json`
   - Adds import ignores with `ts-ignore-import`
   - Set timeout to 30+ seconds: NEVER CANCEL

3. **Run all checks and tests:**
   ```bash
   npm test
   ```
   - Complete test suite takes 3-4 seconds total
   - Note: `npm test` includes checks that may fail on some Node.js versions
   - Use `npm run test-ci` for CI-compatible testing (runs only mocha tests)
   - Set timeout to 30+ seconds: NEVER CANCEL

## Core Commands and Timing

### Testing
- **Mocha tests only:** `npm run test:mocha` (< 1 second)
- **CI-compatible tests:** `npm run test-ci` (< 1 second) 
- **Full test suite:** `npm test` (3-4 seconds, may fail on installed-check)
- Tests provide 85%+ code coverage across all files

### Code Quality
- **Linting:** `npm run check:lint` (< 1 second) - uses eslint with @voxpelli/eslint-config
- **Type checking:** `npm run check:tsc` (< 1 second) - TypeScript compiler checks
- **Type coverage:** `npm run check:type-coverage` (< 1 second) - ensures 99%+ type coverage
- **Dependency analysis:** `npm run check:knip` (< 1 second) - analyzes unused dependencies

### Build and Package
- **Clean build:** `npm run build` (4-5 seconds)
- **Package preparation:** `npm run prepublishOnly` (4-5 seconds) - runs build
- **Dry-run package:** `npm pack --dry-run` (< 1 second) - validates package contents

## Validation and Testing Scenarios

### Example Application Testing
Always test the example CLI application after making changes:

1. **Test help output:**
   ```bash
   node example/basic.js --help
   ```
   Expected: Shows usage, options, and examples in formatted help text

2. **Test CLI functionality:**
   ```bash
   node example/basic.js testinput --output test.js --logs
   ```
   Expected: Outputs parsed flags and input arguments

3. **Test version flag:**
   ```bash
   node example/basic.js --version
   ```
   Expected: Shows "no version" (example doesn't set version)

### Manual Validation Steps
After any code changes, always run these validation steps:

1. **Build and test core functionality:**
   ```bash
   npm run build && npm run test-ci
   ```

2. **Verify linting and type checking:**
   ```bash
   npm run check:lint && npm run check:tsc && npm run check:type-coverage
   ```

3. **Test example application scenarios** (see above)

4. **Validate package contents:**
   ```bash
   npm pack --dry-run
   ```

## Known Issues and Workarounds

### Installed-Check Failure
- **Issue:** `npm run check:installed-check` fails with "Narrower engines.node is needed: >=18.18.0"
- **Workaround:** This is a dependency analysis issue and doesn't affect core functionality
- **For CI:** Use `npm run test-ci` instead of `npm test` to avoid this check
- **Status:** Non-blocking for development work

### Pre-commit Hooks
- Husky is configured with commit message validation and pre-push testing
- Commit messages must follow conventional commit format
- Pre-push hook runs `npm test` which may fail due to installed-check issue

## Repository Structure

### Key Files and Directories
```
/
├── index.js                    # Main entry point (exports from lib/main.js)
├── index.d.ts                  # TypeScript declarations
├── package.json                # Package configuration and scripts
├── lib/                        # Source code directory
│   ├── flags.js               # Default flags (--help, --version)
│   ├── format-help.js         # Help text formatting
│   ├── format-lists.js        # List formatting utilities
│   ├── main.js                # Main exports
│   ├── peowly.js              # Core CLI parser
│   └── utils.js               # Utility functions
├── test/                       # Test files
│   └── main.spec.js           # Mocha test suite
├── example/                    # Example usage
│   └── basic.js               # CLI application example
├── .github/workflows/          # CI/CD workflows
│   ├── nodejs.yml             # Node.js testing
│   ├── lint.yml               # Linting workflow
│   └── ts-internal.yml        # TypeScript validation
└── .husky/                     # Git hooks
    ├── commit-msg             # Commit message validation
    └── pre-push               # Pre-push testing
```

### Configuration Files
- `tsconfig.json` - TypeScript compiler configuration
- `declaration.tsconfig.json` - TypeScript declaration generation
- `eslint.config.js` - ESLint configuration (extends @voxpelli/eslint-config)
- `.knip.jsonc` - Dependency analysis configuration
- `renovate.json` - Dependency update automation

## API Usage Patterns

### Basic Usage
```javascript
import { peowly } from 'peowly';

const { flags, input } = peowly({
  options: {
    fix: {
      description: 'Fixes stuff',
      type: 'boolean',
    },
  },
});
```

### With Help Text
```javascript
import { formatHelpMessage, peowly } from 'peowly';

const cli = peowly({
  help: formatHelpMessage('mycli', {
    usage: '<input>',
    examples: ['mycli example.txt'],
    flags: myFlags,
  }),
  options: myFlags,
});
```

## CI/CD Integration

### GitHub Workflows
- **nodejs.yml:** Runs tests on Node.js 18, 20, 21 (uses external voxpelli/ghatemplates)
- **lint.yml:** Runs linting checks
- **ts-internal.yml:** TypeScript version compatibility testing

### For Development
Always run before committing:
```bash
npm run build && npm run check:lint && npm run test-ci
```

### For CI
Use CI-compatible commands:
```bash
npm run build && npm run test-ci && npm run check:lint && npm run check:tsc
```

## Common Development Tasks

### Adding New Features
1. Implement in appropriate `lib/` file
2. Add TypeScript types in corresponding `.d.ts` files
3. Update tests in `test/main.spec.js`
4. Test with example application
5. Run full validation: `npm run build && npm run test-ci && npm run check:lint`

### Debugging Issues
1. Check example application behavior: `node example/basic.js --help`
2. Run type checking: `npm run check:tsc`
3. Verify test coverage: `npm run test:mocha`
4. Check for unused dependencies: `npm run check:knip`

### Release Preparation
1. Ensure all tests pass: `npm run test-ci`
2. Build declarations: `npm run build`
3. Validate package: `npm pack --dry-run`
4. Check CI compatibility with all validation commands

**Important:** This is a library package - always test changes with the example application to ensure the CLI parser functionality works correctly for end users.