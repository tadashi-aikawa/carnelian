# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun dev` - Start development with hot reload and automatic building
- `bun build` - Production build
- `bun test` - Run test suite
- `bun test:large` - Run tests including large test suite (set ALLOW_LARGE_TEST=1)
- `bun lint` - Code linting with Biome
- `bun pre:push` - Complete validation (type check, lint, test) - use this for comprehensive checks

## Prerequisites

- Bun v1.2.10+ is required
- Hot Reload plugin for Obsidian development
- `carnelianrc.json` configuration file with `vaultPath` property

## Architecture Overview

### Core Plugin Structure
- **`src/main.ts`** - Main plugin class extending Obsidian's Plugin
- **`src/commands.ts`** - Command registry that imports and registers all commands
- **`src/services.ts`** - Background services orchestration
- **`src/settings.ts`** - Plugin settings with Japanese UI

### Command System
Commands are organized in `/src/commands/` with 47 specialized functions across multiple categories:
- Note creation commands (Article, ADR, Hub, Prime, Report, etc.)
- AI-powered content generation (summarization, permalink generation)
- Content processing (link fixing, format transformation, MOC operations)
- External integrations (Bluesky, OGP metadata, AI summarization)
- File operations (clipboard handling, image conversion, path copying)

Each command follows the pattern: `export function commandName(settings: PluginSettings): Command`
Complete command documentation available in `docs/COMMANDS.md`

### Service Architecture
Background services in `/src/services/` handle automatic operations:
- **AddDatePropertiesService** - Automatic date property management
- **LintService** - Content and property validation
- **FormatService** - Automatic formatting
- **AddPropertiesToHeadService** - Metadata management

Services implement the `Service` interface with optional lifecycle methods.

### Utility Library
- **`src/lib/helpers/`** - Core functionality modules organized by domain
- **`src/lib/obsutils/`** - Obsidian-specific utilities with test coverage
- **`src/lib/utils/`** - Generic utilities with comprehensive test suite

## Key Patterns

### Development Workflow
- Uses ESBuild for bundling with hot reload during development
- TypeScript compilation targeting ES2018
- Builds are automatically copied to vault's plugin directory
- Git hooks enforce pre-push validation

### Code Conventions
- Strong TypeScript usage throughout
- Japanese comments and UI elements for settings
- Modular design with clear separation of concerns
- Comprehensive test coverage for utility functions

### Configuration
- `carnelianrc.json` - Development configuration with vault path
- `biome.json` - Linting and formatting rules
- `manifest.json` - Obsidian plugin manifest

## Testing
- Test files use Bun's testing framework
- Utilities have comprehensive test coverage
- Large tests require `ALLOW_LARGE_TEST=1` environment variable
- Tests include validation for Obsidian-specific functionality

## Linting Rules
The project uses detailed linting rules defined in `docs/LINT_RULES.md` for different note types and content validation.

### Property Linting
Property linting is implemented in `src/definitions/linters/PropertyLinter.ts` with automatic fixes:
- **Tags management**: Automatically adds specific tags based on file conditions
  - Files ending with "(JavaScript)" → adds "TypeScript" tag
  - Files ending with "(Vim)" → adds "Neovim" tag  
  - Series notes in `📗Obsidian逆引きレシピ/` directory → adds "Obsidian" tag
  - Other files with tags → removes all tags
- **Required properties**: Validates description, cover, url, and status properties based on note type
- All property violations are ERROR level with autofix functionality

## Memory

- Always ask for clarification when there are ambiguous instructions or potential risks to the project
- lintやformatのチェックをするときは `bun pre:push` を実行してください。まとめて確認できるので便利です。そして、bunのformatによって意図した改行が失われてしまう場合は、bunのformatを無視するコメントを入れてください。
