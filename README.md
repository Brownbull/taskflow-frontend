# taskflow-frontend

**Type**: Frontend
**Framework**: react-typescript
**Status**: planned
**Phase**: mvp

## Description

React TypeScript frontend with Tailwind CSS

## Related Repositories

- **Backend**: [taskflow-backend](../taskflow-backend)

## Project Structure

```
taskflow-frontend/
├── .khujta/              # Khujta Sphere configuration
│   ├── phase.json        # Current development phase
│   └── repos.yaml        # Related repositories
├── ai-state/             # AI development state
│   ├── active/           # Active tasks (tasks.yaml)
│   ├── standards/        # Coding standards
│   ├── contexts/         # Task contexts
│   ├── regressions/      # Test suites
│   ├── reports/          # Sprint reports
│   └── operations.log    # Operation history
└── .claude/              # Claude Code integration
    ├── commands/         # Slash commands
    ├── skills/           # Skills
    └── scripts/          # Automation scripts
```

## Getting Started

```bash
# Set development phase
/test-phase mvp

# Plan features
/core:brainstorm "Your feature description"
/core:write-plan

# Execute tasks
/core:execute-tasks
```

## Development

Initialized: 2025-11-09
Phase: mvp
Framework: react-typescript

## Learn More

- [Khujta Sphere Framework](../taskflow-backend/.claude/README.md)
- [Development Standards](ai-state/standards/)
