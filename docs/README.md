# Cluj Bus App - Documentation

This directory contains all project documentation organized by category.

## 📁 Directory Structure

```
docs/
├── README.md                    # This file - documentation index
├── OVERVIEW.md                  # High-level project overview
├── PROJECT_STRUCTURE.md         # Detailed project structure
├── architecture/                # Architecture decisions and component design
├── design/                      # UI/UX design documentation
├── development/                 # Development guides and processes
├── implementation/              # Feature implementation summaries
├── testing/                     # Testing strategies and guides
└── troubleshooting/             # Bug fixes and issue resolution
```

## 📋 Documentation Categories

### **Root Level** (`docs/`)
- **OVERVIEW.md** - High-level project summary
- **PROJECT_STRUCTURE.md** - Detailed codebase organization

### **Architecture** (`docs/architecture/`)
- Component structure decisions
- System architecture documentation
- Code organization patterns
- Legacy component analysis

### **Design** (`docs/design/`)
- Material Design implementation
- UI component specifications
- Design system documentation
- Visual design decisions

### **Development** (`docs/development/`)
- Development setup guides
- Coding standards and conventions
- Build and deployment processes
- Development workflows

### **Implementation** (`docs/implementation/`)
- Feature implementation summaries
- API integration guides
- Technical implementation details
- Performance optimization notes

### **Testing** (`docs/testing/`)
- Testing strategies
- Test setup and configuration
- Testing best practices
- Test coverage reports

### **Troubleshooting** (`docs/troubleshooting/`)
- Bug fix documentation
- Common issues and solutions
- Debugging guides
- Performance issue resolution

## 🚫 **IMPORTANT: Root Directory Policy**

**DO NOT create markdown files in the project root directory.**

### ✅ **Correct Approach:**
- Place documentation in appropriate `docs/` subdirectories
- Use descriptive filenames that indicate content
- Follow the established category structure

### ❌ **Incorrect Approach:**
- Creating `.md` files in project root (except README.md)
- Mixing documentation with source code
- Creating ad-hoc documentation without organization

## 📝 **Documentation Guidelines**

### **File Naming Convention:**
- Use UPPERCASE for major documents (e.g., `OVERVIEW.md`)
- Use descriptive names that indicate content
- Include dates for time-sensitive documentation

### **Content Structure:**
- Start with a clear title and purpose
- Use consistent markdown formatting
- Include code examples where relevant
- Add links to related documentation

### **Maintenance:**
- Keep documentation up-to-date with code changes
- Archive outdated documentation rather than deleting
- Use clear commit messages when updating docs

## 🔗 **Quick Links**

- [Project Overview](./OVERVIEW.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Architecture Decisions](./architecture/)
- [Design System](./design/)
- [Development Guide](./development/)
- [Implementation Notes](./implementation/)
- [Troubleshooting](./troubleshooting/)

---

**Remember**: All project documentation belongs in the `docs/` directory. Keep the root clean!