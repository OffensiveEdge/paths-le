# Changelog

All notable changes to Paths-LE will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2025-10-26

### Security & Enterprise Readiness

- **Path Traversal Prevention** - Added 64 comprehensive security tests covering:
  - `../` and `../../` attack vectors
  - Symlink exploitation prevention
  - Null byte injection protection
  - Windows reserved names (CON, PRN, AUX, NUL)
  - Cross-platform path validation
- **Error Handling Hardening** - Expanded from 33% to 94% coverage with 62 new tests:
  - Credential sanitization in error messages
  - Path sanitization for sensitive directories
  - Comprehensive error categorization and recovery
  - Safe error reporting without information leakage
- **Test Suite Expansion** - Increased from 152 to 289 unit tests (+90%)
  - 93.55% function coverage, 84.32% line coverage
  - Zero critical vulnerabilities
  - Enterprise-grade reliability

### Quality Improvements

- **Type Safety** - 100% TypeScript strict mode compliance
- **Immutability** - All exports frozen with `Object.freeze()`
- **Dependency Security** - Zero vulnerabilities in dependency chain

## [1.7.0] - 2025-01-27

### Initial Public Release

Paths-LE brings zero-hassle path extraction to VS Code. Simple, reliable, focused.

#### Supported File Types

- **JavaScript** - JS files with imports and requires
- **TypeScript** - TS files with imports and requires
- **JSON** - Configuration files and package.json
- **HTML** - HTML files with asset references
- **CSS** - Stylesheets with asset imports
- **TOML** - Configuration files
- **CSV** - Data files with path references
- **Environment files** - .env files with path variables

#### Features

- **Multi-language support** - Comprehensive localization for 13+ languages
- **Complete path detection** - Automatically finds file paths in multiple formats:
  - Absolute paths
  - Relative paths
  - Windows paths
  - Unix paths
- **Powerful post-processing**:
  - **Deduplicate paths** for cleaner analysis
  - **Sort** with multiple modes (alphabetically or by length)
- **Interactive sorting options**:
  - Sort alphabetically (A→Z/Z→A)
  - Sort by length (short→long/long→short)
- **Smart path detection** - Intelligently filters package imports (like 'react' or 'lodash') from actual file paths
- **Cross-platform compatibility** - Handles both Windows and Unix path formats with intelligent normalization
- **Canonical path resolution** - Full monorepo and symlink support for enterprise development workflows
- **Dependency analysis support** - Perfect for analyzing imports, exports, and file references
- **One-command extraction** - `Ctrl+Alt+P` (`Cmd+Alt+P` on macOS)
- **Developer-friendly** - 152 passing tests (93.33% function coverage, 84.32% line coverage), TypeScript strict mode, functional programming, MIT licensed

#### Use Cases

- **Dependency Analysis** - Analyze imports, exports, and file references to identify missing files and circular dependencies
- **Configuration Management** - Extract and validate file paths from configuration files
- **Path Validation** - Verify that all referenced files exist and are accessible
- **Monorepo Management** - Handle complex monorepo structures with cross-package references
