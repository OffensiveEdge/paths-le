# Paths-LE Testing Guidelines

This document outlines testing practices and policies for Paths-LE development.

## Core Principle

**No broken or failed tests are allowed in commits.**

All tests must pass before code can be committed or merged. This ensures code quality and prevents regressions.

## Running Tests

### Run All Tests

```bash
bun run test
```

### Run Tests with Coverage

```bash
bun run test:coverage
```

### Run Performance Tests

```bash
bun run test:performance
```

### Run Tests in Watch Mode

```bash
bun run test:watch
```

### Run Tests for Specific File

```bash
bun x vitest run src/utils/pathResolver.test.ts
```

## Test Structure

### Unit Tests

Located in `src/**/*.test.ts`:

- **Pure function tests** - Test extraction logic in isolation
- **Utility tests** - Test helper functions, path resolution
- **Configuration tests** - Test config validation

### Integration Tests

Located in `test-fixtures/`:

- **Monorepo tests** - Test complex directory structures
- **Symlink tests** - Test symbolic link handling
- **Cross-platform tests** - Ensure Windows/Unix path compatibility

## Test Coverage Requirements

- **Minimum Coverage**: 80% across branches, functions, lines, statements
- **Critical Paths**: All extraction logic must be tested
- **Error Handling**: All error paths must be covered
- **Edge Cases**: Boundary conditions must be tested
- **Security Tests**: Path traversal, injection, symlink exploits

## Before Committing

### Checklist

- [ ] All tests pass (`bun run test`)
- [ ] No broken tests
- [ ] No skipped tests (unless intentionally)
- [ ] Type checking passes (`bun x tsc -p ./`)
- [ ] Linting passes (`bun run lint`)
- [ ] Coverage meets minimum (80%)

### CI/CD Validation

The CI pipeline automatically:

1. Runs all tests on Ubuntu, macOS, and Windows
2. Generates coverage reports
3. Verifies all tests pass
4. Fails the build if any tests fail

## Fixing Failed Tests

### When a Test Fails

1. **Don't commit the failure** - Fix the test or the code
2. **Run locally first** - Verify fix works before pushing
3. **Check all platforms** - Ensure fix works on Linux/Windows (case sensitivity, paths, etc.)
4. **Update test if needed** - If behavior changed intentionally, update test

### Common Issues

- **Case sensitivity** - Use exact case for file references (`README.md` not `readme.md`)
- **Path separators** - Use platform-agnostic path handling
- **Mock issues** - Ensure mocks are properly reset in `beforeEach`
- **Timing issues** - Avoid `async/await` in tests when possible, use static imports

## Test Best Practices

### 1. Use Descriptive Test Names

```typescript
// ✅ Good
it('should extract relative paths from JavaScript imports', () => {
  // ...
});

// ❌ Bad
it('works', () => {
  // ...
});
```

### 2. Test One Thing Per Test

```typescript
// ✅ Good - separate tests
it('should extract relative paths', () => { /* ... */ });
it('should exclude npm packages', () => { /* ... */ });

// ❌ Bad - multiple concerns
it('should extract paths and exclude npm', () => { /* ... */ });
```

### 3. Use Arrange-Act-Assert Pattern

```typescript
it('should resolve canonical paths', () => {
  // Arrange
  const basePath = '/project';
  const relativePath = '../parent/file.js';
  
  // Act
  const resolved = resolvePath(basePath, relativePath);
  
  // Assert
  expect(resolved).toBe('/parent/file.js');
});
```

### 4. Clean Up Mocks

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // Reset mocks to default state
});
```

## Cross-Platform Testing

### Case Sensitivity

Always use exact case for file references:

```typescript
// ✅ Good - works on all platforms
const content = readSampleFile('README.md');

// ❌ Bad - fails on Linux
const content = readSampleFile('readme.md');
```

### Path Separators

Use platform-agnostic path handling:

```typescript
import { join, sep } from 'path';
const filePath = join(SAMPLE_DIR, filename);
// Use sep for platform-specific separator tests
```

### Windows vs Unix Paths

Test both path formats:

```typescript
// Test Windows paths
it('should handle Windows paths', () => {
  const path = 'C:\\Users\\file.js';
  expect(extractPaths(path)).toContain('C:\\Users\\file.js');
});

// Test Unix paths
it('should handle Unix paths', () => {
  const path = '/home/user/file.js';
  expect(extractPaths(path)).toContain('/home/user/file.js');
});
```

## Security Testing

Paths-LE includes 64 security tests covering:

- **Path Traversal** - `../` and `..\\` attacks
- **Symlink Exploits** - Symbolic link resolution
- **Injection Attacks** - Malicious path components
- **Canonical Resolution** - Security implications

Always test security-sensitive code paths.

## Performance Testing

Performance benchmarks are run separately:

```bash
bun run test:performance
```

Performance tests validate:
- Large file handling (1MB+)
- Throughput metrics
- Memory usage
- Execution time

See [Performance Documentation](PERFORMANCE.md) for details.

## Coverage Reports

Coverage reports are generated automatically:

- **Location**: `coverage/index.html`
- **Format**: HTML, LCOV, JSON
- **CI/CD**: Coverage uploaded as artifact
- **Target**: 80% minimum across all coverage types

## Continuous Integration

### GitHub Actions

Tests run automatically on:

- **Ubuntu** (latest)
- **macOS** (latest)
- **Windows** (latest)

All platforms must pass for the build to succeed.

### Pre-commit Hooks

Consider setting up pre-commit hooks to run tests before commits:

```bash
# Install husky (if needed)
bun add -d husky

# Add pre-commit hook
echo "bun run test" > .husky/pre-commit
```

## Reporting Test Issues

If you encounter test failures:

1. **Run locally** - Verify it fails consistently
2. **Check CI logs** - See platform-specific errors
3. **Reproduce** - Document steps to reproduce
4. **Fix or report** - Either fix or create an issue

## Related Documentation

- [Performance Monitoring](PERFORMANCE.md) - Performance testing and benchmarks
- [Architecture](ARCHITECTURE.md#testing-approach) - Testing approach and strategy
- [Commands](COMMANDS.md) - Command testing guidelines

