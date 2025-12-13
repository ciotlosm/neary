# Cluj Bus App - Documentation Guidelines

## 📁 **Documentation Organization Rules**

### **CRITICAL: Root Directory Policy**

**❌ NEVER create markdown files in the project root directory (except README.md)**

### **✅ Correct Documentation Placement:**

All documentation MUST go in the `docs/` directory structure:

```
docs/
├── README.md                    # Documentation index
├── OVERVIEW.md                  # Project overview
├── PROJECT_STRUCTURE.md         # Codebase structure
├── architecture/                # Architecture decisions
├── design/                      # UI/UX documentation
├── development/                 # Development guides
├── implementation/              # Feature implementation
├── testing/                     # Testing documentation
└── troubleshooting/             # Bug fixes and solutions
```

### **Documentation Categories:**

- **`docs/architecture/`** - Component structure, system design, architectural decisions
- **`docs/design/`** - Material Design specs, UI components, visual design
- **`docs/development/`** - Setup guides, coding standards, workflows
- **`docs/implementation/`** - Feature summaries, API integration, technical details
- **`docs/testing/`** - Testing strategies, setup, best practices
- **`docs/troubleshooting/`** - Bug fixes, debugging guides, issue resolution

### **File Naming Conventions:**

- **UPPERCASE.md** for major documents (e.g., `OVERVIEW.md`)
- **descriptive-names.md** for specific topics
- **Include dates** for time-sensitive docs (e.g., `feature-implementation-2024-12.md`)

### **When Creating Documentation:**

1. **Determine the category** (architecture, design, development, etc.)
2. **Place in appropriate subdirectory** under `docs/`
3. **Use descriptive filename** that indicates content
4. **Update `docs/README.md`** if adding new categories

### **Examples:**

✅ **Correct:**
- `docs/architecture/component-structure.md`
- `docs/implementation/tranzy-api-integration.md`
- `docs/troubleshooting/route-mapping-fix.md`

❌ **Incorrect:**
- `COMPONENT_STRUCTURE.md` (in root)
- `API_INTEGRATION.md` (in root)
- `BUG_FIX_SUMMARY.md` (in root)

## 🎯 **AI Assistant Guidelines**

When working on this project:

1. **Never suggest creating markdown files in root**
2. **Always place documentation in `docs/` subdirectories**
3. **Reference existing documentation structure**
4. **Update `docs/README.md` when adding new categories**
5. **Keep root directory clean and organized**

## 📝 **Content Guidelines**

### **Documentation Structure:**
- Clear title and purpose statement
- Consistent markdown formatting
- Code examples where relevant
- Links to related documentation
- Date stamps for time-sensitive content

### **Maintenance:**
- Keep docs synchronized with code changes
- Archive outdated docs rather than deleting
- Use descriptive commit messages for doc updates
- Review and update quarterly

---

**Remember: A clean root directory = better project organization!**