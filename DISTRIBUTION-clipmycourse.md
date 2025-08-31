# prod-starter-template Distribution

This is a distribution package of the prod-starter-template project.

## Quick Setup

### Option 1: Automatic Setup (Recommended)

```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Setup database and reset to initial state
npm run reset

# Start development
npm run dev
```

## First Time Usage

1. Visit http://localhost:3000
2. You'll be redirected to create your first admin account
3. Enter your email and password
4. Start using the application!

## What's Included

- Complete Next.js application with authentication
- Admin dashboard with user and role management
- Database schema and migrations
- Email system with provider pattern
- Dark mode support
- Comprehensive documentation

## Documentation

- See CLAUDE.md for technical documentation
- See docs/ folder for implementation guides
- See .cursor/rules/ for AI development guidelines

## Support

For issues and questions, please refer to the original repository.

---

Generated on: 2025-07-08T02:40:12.839Z
