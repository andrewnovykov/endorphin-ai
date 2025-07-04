# Contributing Guide - Endorphin AI

_Last Updated: July 4, 2025 - v0.9.0_

Welcome to the **Endorphin AI** project! We're excited that you want to contribute to building the future of AI-powered browser testing. This guide will walk you through the entire contribution process, from finding your first issue to getting your pull request merged.

## 🎯 Ways to Contribute

### Code Contributions
- **Bug fixes** - Fix issues reported by users or found during testing
- **New features** - Implement new functionality for the framework
- **Performance improvements** - Optimize existing code for better performance
- **Test improvements** - Add or enhance test coverage
- **Documentation** - Improve guides, API docs, or examples

### Non-Code Contributions
- **Bug reports** - Help us identify and reproduce issues
- **Feature requests** - Suggest new functionality
- **Documentation improvements** - Fix typos, clarify instructions
- **Community support** - Help other users in discussions
- **Testing** - Test beta releases and provide feedback

## 🚀 Getting Started

### Step 1: Find an Issue

#### Browse Available Issues

1. **Visit the Issues page**: https://github.com/andrewnovykov/endorphin-ai/issues

2. **Look for beginner-friendly labels**:
   - `good first issue` - Perfect for first-time contributors
   - `help wanted` - Issues where we need community help
   - `bug` - Bug fixes (usually well-defined scope)
   - `documentation` - Documentation improvements
   - `enhancement` - New features or improvements

3. **Filter by your interests**:
   - `frontend` - UI/UX improvements
   - `testing` - Test-related work
   - `performance` - Performance optimizations
   - `cli` - Command-line interface improvements

#### Example Good First Issues
- Fix documentation typos or unclear instructions
- Add missing test cases
- Improve error messages
- Add examples for new users
- Fix small bugs with clear reproduction steps

### Step 2: Claim an Issue

1. **Comment on the issue**: "I'd like to work on this issue"
2. **Wait for maintainer response**: We'll assign it to you or provide guidance
3. **Ask questions**: If anything is unclear, ask in the issue comments

### Step 3: Fork the Repository

#### Create Your Fork

```bash
# 1. Go to https://github.com/andrewnovykov/endorphin-ai
# 2. Click the "Fork" button in the top-right corner
# 3. This creates your personal copy at: https://github.com/YOUR_USERNAME/endorphin-ai
```

#### Clone Your Fork

```bash
# Clone your fork locally
git clone https://github.com/YOUR_USERNAME/endorphin-ai.git
cd endorphin-ai

# Add the original repository as upstream
git remote add upstream https://github.com/andrewnovykov/endorphin-ai.git

# Verify remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/endorphin-ai.git (fetch)
# origin    https://github.com/YOUR_USERNAME/endorphin-ai.git (push)
# upstream  https://github.com/andrewnovykov/endorphin-ai.git (fetch)
# upstream  https://github.com/andrewnovykov/endorphin-ai.git (push)
```

### Step 4: Set Up Development Environment

Follow our comprehensive setup guide:

```bash
# 1. Set up development environment
# See: Development-Environment-Setup-Guide.md for complete instructions

# Quick setup:
npm install              # Install dependencies
npm run build           # Build the project
npm test               # Run tests to ensure everything works
```

Create your `.env` file:
```bash
# Create environment configuration
cat > .env << 'EOF'
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
ENDORPHIN_DEBUG=verbose
HEADLESS=false
EOF
```

## 💻 Development Workflow

### Step 1: Create a Feature Branch

```bash
# Make sure you're on the latest develop branch
git checkout develop
git pull upstream develop

# Create a new branch for your work
git checkout -b feature/issue-123-fix-cli-bug
# or
git checkout -b fix/issue-456-memory-leak
# or
git checkout -b docs/issue-789-update-readme

# Branch naming convention:
# - feature/issue-XXX-short-description (new features)
# - fix/issue-XXX-short-description (bug fixes)
# - docs/issue-XXX-short-description (documentation)
# - test/issue-XXX-short-description (test improvements)
```

### Step 2: Make Your Changes

#### Code Changes

```bash
# Make your changes to the codebase
# Edit files in framework/, bin/, etc.

# Build and test frequently
npm run build:watch    # Watch for TypeScript changes
npm run test:watch     # Watch for test changes
```

#### Follow Code Style

```bash
# Check code quality
npm run type-check     # TypeScript validation
npm run lint           # ESLint checks
npm run format:check   # Prettier formatting

# Auto-fix issues
npm run lint:fix       # Fix lint issues
npm run format         # Format code
```

#### Write Tests

- **Add tests** for new features
- **Update tests** for changed functionality
- **Ensure tests pass**: `npm test`

Example test structure:
```typescript
// dev-tests/development/unit/my-feature.test.ts
import { describe, it, expect } from '@jest/globals';
import { MyFeature } from '../../../framework/core/my-feature.js';

describe('MyFeature', () => {
  it('should handle basic functionality', () => {
    const feature = new MyFeature();
    expect(feature.process('input')).toBe('expected-output');
  });
});
```

### Step 3: Test Your Changes

```bash
# Run development tests
npm test

# Run package integration tests
cd dev-tests/package-tests && ./run-all-tests.sh && cd ../..

# Test CLI manually
./dist/bin/endorphin.js --version
./dist/bin/endorphin.js init
./dist/bin/endorphin.js list
```

### Step 4: Commit Your Changes

#### Write Good Commit Messages

Follow the conventional commit format:

```bash
# Format: type(scope): description
git commit -m "feat(cli): add --verbose flag for detailed output"
git commit -m "fix(test-discovery): handle empty test directories"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(token-tracker): add coverage for edge cases"
```

**Commit Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `test` - Test improvements
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `ci` - CI/CD changes

#### Multiple Commits

```bash
# Make incremental commits
git add framework/core/my-feature.ts
git commit -m "feat(core): implement basic MyFeature functionality"

git add dev-tests/development/unit/my-feature.test.ts
git commit -m "test(core): add tests for MyFeature"

git add doc/user-guide/My-Feature-Guide.md
git commit -m "docs(guides): add MyFeature user guide"
```

### Step 5: Keep Your Branch Updated

```bash
# Regularly sync with upstream
git fetch upstream
git rebase upstream/develop

# Resolve any conflicts if they occur
# Then continue with: git rebase --continue
```

## 📤 Creating a Pull Request

### Step 1: Push Your Branch

```bash
# Push your feature branch to your fork
git push origin feature/issue-123-fix-cli-bug
```

### Step 2: Create the Pull Request

1. **Go to your fork**: https://github.com/YOUR_USERNAME/endorphin-ai
2. **Click "Compare & pull request"** (GitHub will show this after you push)
3. **Choose the base branch**: `develop` (not `main`)
4. **Fill out the PR template**:

#### PR Title Format
```
[Issue #123] Fix CLI bug with undefined config
```

#### PR Description Template
```markdown
## Summary
Brief description of what this PR does.

## Changes Made
- [ ] Fixed CLI bug when config file is missing
- [ ] Added proper error handling and user-friendly message
- [ ] Added tests for edge case scenarios
- [ ] Updated documentation

## Related Issue
Fixes #123

## Testing
- [ ] All existing tests pass
- [ ] Added new tests for bug fix
- [ ] Manually tested CLI with missing config
- [ ] Package integration tests pass

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated if needed
- [ ] No breaking changes (or marked as such)
```

### Step 3: Respond to Review Feedback

#### Address Review Comments

```bash
# Make requested changes
# Edit files based on reviewer feedback

# Commit changes
git add .
git commit -m "fix: address review feedback - improve error handling"

# Push updates
git push origin feature/issue-123-fix-cli-bug
```

#### Keep PR Updated

```bash
# If main branch has moved ahead
git fetch upstream
git rebase upstream/develop
git push origin feature/issue-123-fix-cli-bug --force-with-lease
```

## 🏷️ Issue Lifecycle

### 1. Issue Creation
- User or maintainer creates issue
- Issue gets labeled and triaged
- Issue assigned to milestone (if applicable)

### 2. Issue Assignment
- Contributor expresses interest
- Maintainer assigns issue
- Contributor starts work

### 3. Development
- Contributor creates fork/branch
- Implements solution
- Tests changes locally

### 4. Pull Request
- Contributor creates PR
- Automated checks run
- Manual review by maintainers

### 5. Review Process
- Code review feedback
- Contributor addresses feedback
- Approval and merge

### 6. Completion
- PR merged to develop
- Issue closed automatically
- Contributor recognized in changelog

## 🧪 Testing Guidelines

### Before Submitting PR

```bash
# Complete testing checklist
npm run type-check         # ✅ TypeScript compiles
npm run lint              # ✅ Code style passes
npm test                  # ✅ All tests pass
npm run build             # ✅ Build succeeds
cd dev-tests/package-tests && ./run-all-tests.sh  # ✅ Integration tests pass

# Manual testing
./dist/bin/endorphin.js --version    # ✅ CLI works
./dist/bin/endorphin.js init         # ✅ Init works
./dist/bin/endorphin.js list         # ✅ Test discovery works
```

### Test Coverage

- **Unit tests** for new functions/classes
- **Integration tests** for workflow changes
- **CLI tests** for command-line changes
- **Documentation** for user-facing changes

## 📋 Code Review Process

### What Reviewers Look For

1. **Code Quality**
   - Follows TypeScript best practices
   - Clear, readable code
   - Proper error handling
   - Performance considerations

2. **Testing**
   - Adequate test coverage
   - Tests actually test the functionality
   - Edge cases covered

3. **Documentation**
   - User-facing changes documented
   - Code comments for complex logic
   - API documentation updated

4. **Compatibility**
   - No breaking changes (unless intentional)
   - Follows existing patterns
   - Works across supported Node.js versions

### Typical Review Timeline

- **Initial review**: 1-3 business days
- **Follow-up reviews**: 1-2 business days
- **Final approval**: Same day after final changes

## 🏆 Recognition

### Contributors Get

- **GitHub recognition** in contributor list
- **Changelog mention** for significant contributions
- **Discord contributor role** (if you join our server)
- **First-time contributor** special mention

### Hall of Fame

Outstanding contributors may receive:
- Co-maintainer status for specialized areas
- Direct collaboration on roadmap planning
- Speaking opportunities at community events

## 🚫 What Not to Contribute

### Avoid These

- **AI-generated code** without significant human review and testing
- **Large refactors** without prior discussion
- **Breaking changes** without RFC (Request for Comments)
- **Dependencies** without strong justification
- **Security-sensitive code** without security review

### Get Approval First

For these types of contributions, **open an issue first** to discuss:

- Major architectural changes
- New dependencies
- Breaking API changes
- Performance-critical modifications
- Security-related features

## 🔧 Development Resources

### Essential Reading

- [Development-Environment-Setup-Guide.md](./Development-Environment-Setup-Guide.md) - Complete setup
- [Development-Guide.md](./Development-Guide.md) - Development workflow  
- [Testing-Guide.md](./Testing-Guide.md) - Testing approach
- [Framework-Architecture.md](./Framework-Architecture.md) - Architecture overview

### Tools & Commands

```bash
# Development workflow
npm run build:watch      # Watch TypeScript compilation
npm run test:watch       # Watch tests
npm run lint:fix         # Fix style issues
npm run quality          # Run all quality checks

# Testing
npm test                 # Development tests
npm run test:package     # Package integration tests
npm run test:coverage    # Coverage reports

# Debugging
ENDORPHIN_DEBUG=verbose npx tsx bin/endorphin.ts run test HEALTH-001
```

### Getting Help

- **GitHub Discussions** - For questions and community support
- **GitHub Issues** - For bugs and feature requests
- **Code Comments** - Ask questions in PR/issue comments
- **Documentation** - Check existing guides first

## 🎉 After Your First Contribution

### What Happens Next

1. **Your PR gets merged** 🎉
2. **Issue gets closed** automatically
3. **You're added to contributors** list
4. **Changes included** in next release

### Keep Contributing

- **Look for more issues** to work on
- **Help review** other contributors' PRs
- **Improve documentation** based on your experience
- **Share feedback** on the development process

### Level Up

- **Become a regular contributor** 
- **Specialize in an area** (CLI, testing, docs, etc.)
- **Help mentor** new contributors
- **Join maintainer discussions**

## 🤝 Community Guidelines

### Be Respectful
- Respectful communication in all interactions
- Constructive feedback in code reviews
- Patient with newcomers and questions

### Be Collaborative
- Ask questions when unsure
- Share knowledge and help others
- Credit others for their ideas and work

### Be Professional
- Follow code of conduct
- Maintain professional tone in all communications
- Focus on the technical merits of contributions

## 📞 Getting Support

### Stuck? Here's How to Get Help

1. **Check documentation** - Most questions are answered in guides
2. **Search existing issues** - Your question might already be answered
3. **Ask in GitHub Discussions** - Community can help
4. **Comment on your PR/issue** - Maintainers will respond
5. **Be specific** - Provide details, error messages, and context

### Response Times

- **Documentation questions**: Usually within 24 hours
- **Bug reports**: 1-3 business days
- **Feature discussions**: 3-5 business days
- **PR reviews**: 1-3 business days

---

## 🚀 Ready to Contribute?

1. **🔍 Find an issue** that interests you
2. **💬 Comment** to claim it
3. **🍴 Fork** the repository
4. **🏗️ Set up** your development environment
5. **💻 Make** your changes
6. **✅ Test** thoroughly
7. **📤 Create** a pull request
8. **🎉 Celebrate** your contribution!

**Thank you for helping make Endorphin AI better!** Every contribution, no matter how small, helps improve the framework for everyone. We look forward to working with you! 🌟

---

_This guide is maintained by the Endorphin AI development team. Have suggestions for improving the contribution process? Open an issue or submit a PR!_