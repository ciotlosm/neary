# Cluj Bus App - Documentation Guidelines

## 📁 **Documentation Organization Rules**

### **CRITICAL: Root Directory Policy**

**❌ NEVER create markdown files in the project root directory (except README.md)**
**❌ NEVER create .md files anywhere in the root directory**
**❌ NEVER create documentation files outside of docs/ folder**

### **✅ UPDATED CONSOLIDATED STRUCTURE (December 2024):**

All documentation MUST go in the `docs/` directory using our **human-friendly consolidated structure**:

```
docs/
├── README.md              # Documentation index and navigation
├── getting-started.md     # Setup, installation, first run
├── user-guide.md         # How to use the app (for end users)
├── developer-guide.md    # Technical details (for developers)
├── troubleshooting/       # ORGANIZED TROUBLESHOOTING (split for manageability)
│   ├── README.md         # Troubleshooting index and navigation
│   ├── common-issues.md  # Most frequent problems
│   ├── api-authentication.md  # API and auth issues
│   ├── station-route-issues.md  # Station/route problems
│   ├── mobile-pwa-issues.md     # Mobile and PWA issues
│   ├── performance-caching.md   # Performance and cache issues
│   ├── testing-development.md   # Test and dev issues
│   └── emergency-recovery.md    # Last resort procedures
├── changelog.md          # Recent updates and changes
└── archive/              # Historical detailed documentation
    ├── README.md         # Archive index
    └── [old files]       # Previous docs (kept for reference)
```

### **Documentation Categories (UPDATED):**

- **`docs/getting-started.md`** - Setup guides, installation, API key configuration
- **`docs/user-guide.md`** - App usage, features, mobile tips, daily workflows
- **`docs/developer-guide.md`** - Architecture, API integration, testing, debugging
- **`docs/troubleshooting/`** - **ORGANIZED FOLDER** with categorized troubleshooting files
- **`docs/changelog.md`** - Recent changes, breaking changes, migration guides
- **`docs/archive/`** - Historical documentation (50+ old files preserved for reference)

### **Where to Add New Information:**

**For Setup/Installation Issues:**
- ✅ Add to `docs/getting-started.md`
- Include prerequisites, commands, verification steps

**For User-Facing Features:**
- ✅ Add to `docs/user-guide.md` 
- Include how-to guides, tips, feature explanations

**For Technical Details:**
- ✅ Add to `docs/developer-guide.md`
- Include architecture, APIs, code patterns, debugging

**For Bug Fixes/Issues:**
- ✅ Add to appropriate `docs/troubleshooting/` file based on category:
  - **Common issues**: `common-issues.md` - Most frequent problems, React errors, configuration
  - **API/Auth problems**: `api-authentication.md` - Authentication, network, rate limiting
  - **Station/Route issues**: `station-route-issues.md` - Station display, route problems, nearby view
  - **Mobile/PWA problems**: `mobile-pwa-issues.md` - Mobile browsers, PWA, GPS, themes
  - **Performance issues**: `performance-caching.md` - Storage, cache, service worker, performance
  - **Test/Dev problems**: `testing-development.md` - Test failures, dev server, build issues
  - **Emergency procedures**: `emergency-recovery.md` - Complete reset, last resort fixes
- Include problem description, root cause, solution
- **CRITICAL**: Never add to single `troubleshooting.md` file - use the organized folder structure

**For Recent Changes:**
- ✅ Add to `docs/changelog.md`
- Include what changed, why, and migration notes

### **Examples:**

✅ **Correct Approach:**
- Setup issue → Update `docs/getting-started.md`
- New feature → Update `docs/user-guide.md` + `docs/changelog.md`
- API change → Update `docs/developer-guide.md` + `docs/changelog.md`
- Bug fix → Update appropriate `docs/troubleshooting/` file + `docs/changelog.md`
- Performance issue → Update `docs/troubleshooting/performance-caching.md`
- Mobile problem → Update `docs/troubleshooting/mobile-pwa-issues.md`

❌ **Old Approach (Don't Do):**
- Creating `SETUP_ISSUE_FIX.md` in root
- Creating new files in `docs/implementation/`
- Adding to single large `troubleshooting.md` file
- Scattering information across multiple small files

## 🎯 **AI Assistant Guidelines (UPDATED)**

When working on this project:

1. **Never create new markdown files** - Update existing consolidated docs instead
2. **Use the main documents** - All information goes into appropriate existing files
3. **Update the right document** - Follow the "Where to Add New Information" guide above
4. **Keep it consolidated** - Don't fragment information across multiple files
5. **Archive old approach** - Historical detailed docs are in `docs/archive/` for reference
6. **Update changelog** - Always document significant changes in `docs/changelog.md`
7. **TROUBLESHOOTING EXCEPTION** - Use the organized `docs/troubleshooting/` folder structure for bug fixes and issues

## 📝 **Content Guidelines (UPDATED)**

### **Writing Style:**
- **Human-friendly** - Write for actual users, not just developers
- **Practical focus** - Include actionable steps and real examples
- **Clear navigation** - Use consistent headings and cross-references
- **Comprehensive but concise** - Cover everything needed without redundancy

### **Update Process:**
1. **Identify the right document** - Use the guide above
2. **Update existing sections** - Don't create new files
3. **Cross-reference** - Link between related sections
4. **Update changelog** - Document what changed and why
5. **Test instructions** - Verify setup/troubleshooting steps work

### **Maintenance:**
- **Keep consolidated docs current** - Update the main files regularly
- **Archive detailed history** - Move old detailed docs to `docs/archive/`
- **Version updates** - Run `node scripts/update-version.js` for major doc changes
- **Review quarterly** - Ensure information stays accurate and useful
- **Monitor file sizes** - Check line counts regularly with `wc -l docs/*.md`

### **Large File Management:**

**Current File Status (December 2024) - AFTER MAJOR CLEANUP:**
- ✅ `getting-started.md` (138 lines) - Optimal size
- ✅ `user-guide.md` (387 lines) - Good size  
- ✅ `developer-guide.md` (157 lines) - Optimal size ✅ FIXED
- ✅ `changelog.md` (21 lines) - Optimal size ✅ FIXED
- ✅ `troubleshooting/` - All files under 113 lines ✅ FIXED

**MAJOR SUCCESS**: Reduced from 103 files (8,869 lines) to 14 files (1,382 lines) - 84% reduction!

**When to Archive Content:**
- **Changelog entries older than 3 months** - Move to `docs/archive/changelog-YYYY-QX.md`
- **Developer guide sections over 100 lines** - Split by logical topics
- **Historical implementation details** - Move to archive with reference links
- **Deprecated features/fixes** - Archive but keep reference for context

**AI-Optimized File Size Targets:**
- **Optimal**: Under 300 lines (fast AI processing, no truncation risk)
- **Good**: 300-400 lines (safe for AI processing)
- **Warning**: 400-500 lines (review for splitting opportunities)
- **Critical**: Over 500 lines (high risk of truncation, split immediately)

### **File Size Management (AI-Optimized Limits):**
- **Target size**: Keep individual files under 400 lines for optimal AI processing
- **Warning threshold**: Files over 300 lines should be reviewed for splitting opportunities
- **Critical threshold**: Files over 500 lines must be split or archived immediately
- **Troubleshooting exception**: Use the organized folder structure for troubleshooting content
- **Archive large content**: Move historical/detailed content to `docs/archive/`

### **AI Processing Warning Signs:**
- **File over 300 lines**: Review for logical split points
- **File over 400 lines**: High priority for splitting
- **File over 500 lines**: CRITICAL - causes truncation warnings, split immediately
- **Memory issues**: If file causes "CRITICAL - FILE TRUNCATION NOTICE", split now
- **Navigation difficulty**: If users can't find information quickly, reorganize

### **Quality Checks:**
- ✅ Information is in the right consolidated document
- ✅ Instructions are tested and work
- ✅ Cross-references are accurate
- ✅ Changelog reflects the changes
- ✅ No new scattered files created
- ✅ Files are AI-friendly size (under 400 lines optimal, 500 lines maximum)
- ✅ Troubleshooting uses organized folder structure

### **Preventing Large File Issues:**

**Regular Monitoring:**
```bash
# Check file sizes regularly
wc -l docs/*.md docs/troubleshooting/*.md

# Files over 400 lines need attention
find docs -name "*.md" -exec wc -l {} + | sort -nr | head -10
```

**Proactive Management:**
- **Monthly review**: Check file sizes and archive old content
- **Quarterly cleanup**: Move historical changelog entries to archive
- **Annual reorganization**: Review structure and split large sections
- **Memory-aware editing**: If file causes truncation warnings, split immediately

**Split Strategies:**
- **By topic**: Separate major features into sections
- **By time**: Archive old changelog entries by year/quarter  
- **By category**: Use folder structure like troubleshooting
- **By audience**: Separate user vs developer content

---

## 🚫 **ANTI-BLOATING ENFORCEMENT (December 2024)**

### **CRITICAL: Prevent Documentation Hell**

**We successfully reduced documentation from 103 files (8,869 lines) to 14 files (1,382 lines). NEVER let it bloat again!**

### **FORBIDDEN PRACTICES:**

❌ **NEVER create new .md files** - Update existing files instead
❌ **NEVER create detailed implementation docs** - Keep technical details minimal
❌ **NEVER create micro-documentation** - One issue per section maximum
❌ **NEVER create step-by-step guides over 20 lines** - Summarize instead
❌ **NEVER create hook/component documentation** - Code should be self-documenting
❌ **NEVER create architecture deep-dives** - High-level overview only
❌ **NEVER create troubleshooting novels** - Problem + Solution format only
❌ **NEVER create changelog novels** - Recent changes only (3 months max)

### **MANDATORY PRACTICES:**

✅ **ALWAYS update existing files** - Never create new ones
✅ **ALWAYS keep entries under 5 lines** - Problem + Solution format
✅ **ALWAYS archive old content** - Move detailed history to archive
✅ **ALWAYS check file sizes** - Monitor with `wc -l docs/*.md`
✅ **ALWAYS use minimal language** - No verbose explanations
✅ **ALWAYS prioritize user needs** - Skip implementation details
✅ **ALWAYS maintain the 14-file limit** - No exceptions

### **FILE SIZE ENFORCEMENT:**

**HARD LIMITS (Enforced):**
- **Maximum files**: 14 total (current structure)
- **Maximum lines per file**: 400 lines (AI processing limit)
- **Target lines per file**: Under 200 lines (optimal)
- **Troubleshooting files**: Under 150 lines each

**MONITORING COMMANDS:**
```bash
# Check total file count (must be ≤ 14)
find docs -name "*.md" | wc -l

# Check file sizes (none over 400 lines)
wc -l docs/*.md docs/troubleshooting/*.md | sort -nr

# Alert if any file over 300 lines
find docs -name "*.md" -exec wc -l {} + | awk '$1 > 300 {print "WARNING: " $2 " has " $1 " lines"}'
```

### **CONTENT QUALITY RULES:**

**For Bug Fixes/Issues:**
- **Format**: `**Problem**: Brief description **Solution**: One-line fix`
- **Length**: Maximum 3 lines per issue
- **Details**: None - just the essential fix

**For Features:**
- **Format**: `**Feature**: What it does **Usage**: How to use it`
- **Length**: Maximum 2 lines per feature
- **Examples**: Only if absolutely necessary

**For Changes:**
- **Format**: `**Date**: Brief change description`
- **Length**: Maximum 1 line per change
- **Archive**: Move entries older than 3 months

### **EMERGENCY BLOAT DETECTION:**

**Warning Signs:**
- Any file over 300 lines
- More than 14 total .md files
- Detailed implementation explanations
- Step-by-step guides over 10 steps
- Multiple files for same topic

**Immediate Action Required:**
1. **Stop adding content** to the bloated file
2. **Archive excessive content** to docs/archive/
3. **Summarize remaining content** to essential points only
4. **Split if necessary** but maintain 14-file limit
5. **Update this steering file** if patterns change

---

**Remember: We achieved 84% documentation reduction. Maintain this streamlined approach - consolidated, human-friendly documentation that stays manageable for both humans and AI systems!**