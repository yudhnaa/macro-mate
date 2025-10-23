# Contributing to Macro Mate

Thank you for your interest in contributing to Macro Mate! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Git** - Version control
- **Python 3.12+** - Backend development
- **Node.js 20.x+** - Frontend development
- **PostgreSQL 15+** - Database
- **Redis 6.x+** - Caching (optional)
- **Docker & Docker Compose** - Containerization (recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/macro-mate.git
   cd macro-mate
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/yudhnaa/macro-mate.git
   ```

---

## Development Setup

For complete setup instructions, see the [Getting Started](README.md#getting-started) section in the main README.

**Quick Reference:**

- [Prerequisites](README.md#prerequisites) - Required software
- [Docker Setup](README.md#quick-start-with-docker-recommended) - Fastest way to get started
- [Backend Local Setup](README.md#backend-setup) - Python development environment
- [Frontend Local Setup](README.md#frontend-setup) - Node.js development environment
- [Environment Configuration](README.md#environment-configuration) - API keys and settings

**Development-Specific Setup:**

```bash
# Install pre-commit hooks (for code quality)
cd back-end
pre-commit install

# This will automatically run Black, Flake8, and isort before each commit
```

---

## Coding Standards

### Backend (Python)

We follow PEP 8 style guide with some modifications:

**Code Formatting:**

- Use **Black** for code formatting (line length: 88)
- Use **isort** for import sorting
- Use **Flake8** for linting

**Pre-commit Hooks:**
All code is automatically formatted before commit. Run manually:

```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8
```

**Best Practices:**

- Use type hints for function parameters and return values
- Write descriptive docstrings for classes and functions
- Follow single responsibility principle
- Keep functions small and focused
- Use meaningful variable and function names
- Avoid magic numbers and strings

**Example:**

```python
from typing import Optional

def calculate_daily_calories(
    weight: float,
    height: float,
    age: int,
    activity_level: str
) -> Optional[float]:
    """
    Calculate daily calorie needs based on user metrics.

    Args:
        weight: User weight in kg
        height: User height in cm
        age: User age in years
        activity_level: Activity level (sedentary, moderate, active)

    Returns:
        Estimated daily calorie needs or None if invalid input
    """
    # Implementation here
    pass
```

### Frontend (Next.js/TypeScript)

**Code Formatting:**

- Use **ESLint** for linting
- Follow Next.js and React best practices
- Use functional components with hooks

**Best Practices:**

- Use TypeScript for type safety
- Create reusable components
- Use meaningful component and variable names
- Keep components small and focused
- Use proper prop typing
- Follow React hooks rules

**Example:**

```typescript
interface UserProfileProps {
  userId: string;
  onUpdate?: (data: UserData) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  // Component implementation

  return (
    // JSX here
  );
};
```

### File Naming Conventions

**Backend:**

- Python files: `snake_case.py`
- Classes: `PascalCase`
- Functions/variables: `snake_case`
- Constants: `UPPER_CASE`

**Frontend:**

- Component files: `PascalCase.tsx`
- Utility files: `camelCase.ts`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_CASE`

### Git Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**

```bash
feat(auth): add JWT token refresh mechanism
fix(api): resolve duplicate food entries issue
docs(readme): update installation instructions
refactor(database): optimize query performance
```

---

## Making Changes

### Branch Naming

Create a feature branch from `develop`:

```bash
git checkout develop
git pull upstream develop
git checkout -b feat/your-feature-name
```

**Branch naming convention:**

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation
- `refactor/code-improvement` - Refactoring
- `test/test-description` - Tests

### Development Workflow

1. **Create a branch** for your changes
2. **Make your changes** following coding standards
3. **Test your changes** thoroughly
4. **Commit your changes** with clear messages
5. **Push to your fork**
6. **Create a pull request**

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your branch
git checkout develop
git merge upstream/develop

# Push to your fork
git push origin develop
```

---

## Pull Request Process

### Before Submitting

Ensure your PR meets these requirements:

- [ ] Code follows the project's coding standards
- [ ] All tests pass
- [ ] Pre-commit hooks pass
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow conventional commits
- [ ] Branch is up-to-date with `develop`
- [ ] No merge conflicts

### Submitting a Pull Request

1. **Push your branch** to your fork:

   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create a PR** on GitHub from your fork to `yudhnaa/macro-mate:develop`

3. **Fill out the PR template** with:

   - Clear description of changes
   - Related issue numbers (if applicable)
   - Screenshots (for UI changes)
   - Testing steps

4. **Wait for review** - A maintainer will review your PR

### PR Template

```markdown
## Description

Brief description of what this PR does

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #issue_number

## Testing

How to test these changes

## Screenshots (if applicable)

Add screenshots here

## Checklist

- [ ] Code follows coding standards
- [ ] Tests pass
- [ ] Documentation updated
```

### Review Process

- PRs require at least one approval from a maintainer
- Address review comments promptly
- Keep discussions professional and constructive
- Be open to feedback and suggestions

### After Approval

Once approved and merged:

- Delete your feature branch
- Pull latest changes from upstream
- Celebrate your contribution!

---

## Testing

### Backend Testing

```bash
cd back-end

# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_auth.py
```

### Frontend Testing

```bash
cd frontend

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Manual Testing

Before submitting a PR:

- Test all affected features manually
- Test on different screen sizes (for frontend)
- Check API responses (for backend)
- Verify database migrations work

---

## Documentation

### Code Documentation

- Add docstrings to all public functions and classes
- Comment complex logic
- Update README.md if adding new features
- Update API documentation for new endpoints

### API Documentation

Backend uses FastAPI's automatic documentation:

- Access at `http://localhost:8000/docs`
- Ensure all endpoints have proper descriptions
- Add request/response examples

### Changelog

Update `CHANGELOG.md` for notable changes:

- Add entry under `[Unreleased]` section
- Follow Keep a Changelog format
- Include PR/issue numbers

---

## Community

### Getting Help

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions or discuss ideas
- **Pull Requests**: Suggest code changes

### Reporting Bugs

When reporting bugs, include:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, versions, etc.)
- Screenshots or error logs

### Suggesting Features

When suggesting features:

- Describe the problem it solves
- Explain your proposed solution
- Consider alternative solutions
- Explain why this benefits the project

---

## Recognition

Contributors will be recognized in:

- Repository contributors page
- Release notes (for significant contributions)
- Project documentation

---

## Questions?

If you have questions not covered here:

- Open a GitHub Discussion
- Check existing issues
- Review documentation

Thank you for contributing to Macro Mate! Your efforts help make this project better for everyone.

---

**License:** By contributing, you agree that your contributions will be licensed under the MIT License.
