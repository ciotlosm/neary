#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

// File categorization patterns
const categories = {
  'Logic': {
    'Components': [
      'src/components/**/*.tsx',
      'src/components/**/*.ts'
    ],
    'Hooks': [
      'src/hooks/**/*.ts',
      'src/hooks/**/*.tsx'
    ],
    'Services': [
      'src/services/*.ts'
    ],
    'Stores': [
      'src/stores/*.ts',
      'src/stores/**/*.ts'
    ],
    'Utils': [
      'src/utils/*.ts'
    ],
    'Controllers': [
      'src/controllers/*.ts'
    ],
    'Types': [
      'src/types/*.ts'
    ],
    'Main App': [
      'src/App.tsx',
      'src/main.tsx'
    ],
    'Theme': [
      'src/theme/*.ts'
    ]
  },
  'Tests': {
    'Unit Tests': [
      'src/**/*.test.ts',
      'src/**/*.test.tsx'
    ],
    'Integration Tests': [
      'src/test/integration/**/*.ts',
      'src/test/integration/**/*.tsx'
    ],
    'Performance Tests': [
      'src/test/performance/**/*.ts'
    ],
    'Architecture Tests': [
      'src/test/architecture-boundary-validation.test.ts'
    ],
    'Test Utils': [
      'src/test/utils/*.ts',
      'src/test/utils/*.tsx',
      'src/test/setup.ts'
    ]
  },
  'Documentation': {
    'Main Docs': [
      'docs/**/*.md',
      'docs/**/*.json'
    ],
    'Specs': [
      '.kiro/specs/**/*.md'
    ],
    'Steering': [
      '.kiro/steering/*.md'
    ],
    'Root Docs': [
      'README.md'
    ]
  },
  'Configuration': {
    'Package Management': [
      'package.json',
      'package-lock.json'
    ],
    'Build Config': [
      'vite.config.ts',
      'vitest.config.ts',
      'tsconfig*.json',
      'eslint.config.js',
      'tailwind.config.js',
      'postcss.config.js'
    ],
    'Deployment': [
      'netlify.toml',
      '.netlify/**/*'
    ],
    'IDE Config': [
      '.vscode/*'
    ],
    'API Config': [
      '.postman.json'
    ]
  },
  'Assets & Static': {
    'Styles': [
      'src/*.css'
    ],
    'HTML': [
      'index.html',
      'public/*.html'
    ],
    'PWA': [
      'public/manifest.json',
      'public/sw.js'
    ],
    'Scripts': [
      'scripts/*.js'
    ]
  },
  'Build Output': {
    'Distribution': [
      'dist/**/*'
    ]
  }
};

// Utility functions
function globMatch(pattern, filepath) {
  // Convert glob pattern to regex
  // First escape dots, then handle ** and *
  let regexPattern = pattern
    .replace(/\./g, '\\.')  // Escape dots first
    .replace(/\*\*/g, 'DOUBLESTAR')  // Temporarily replace **
    .replace(/\*/g, '[^/]*')  // Replace single * with non-slash chars
    .replace(/DOUBLESTAR/g, '.*');  // Replace ** with any chars
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filepath);
}

function matchesAnyPattern(filepath, patterns) {
  return patterns.some(pattern => globMatch(pattern, filepath));
}

function countLines(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    
    // Count comments vs code for source files
    let comments = 0;
    let code = 0;
    let blank = 0;
    
    const isSourceFile = /\.(ts|tsx|js|jsx)$/.test(filepath);
    
    if (isSourceFile) {
      let inBlockComment = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed === '') {
          blank++;
        } else if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
          comments++;
        } else if (trimmed.includes('/*')) {
          inBlockComment = true;
          comments++;
        } else if (trimmed.includes('*/')) {
          inBlockComment = false;
          comments++;
        } else if (inBlockComment) {
          comments++;
        } else {
          code++;
        }
      }
    }
    
    return {
      total: lines.length,
      comments: isSourceFile ? comments : 0,
      code: isSourceFile ? code : 0,
      blank: isSourceFile ? blank : 0
    };
  } catch (error) {
    return { total: 0, comments: 0, code: 0, blank: 0 };
  }
}

function analyzeCodebase() {
  const results = {
    categories: {},
    totals: {
      files: 0,
      lines: 0,
      comments: 0,
      code: 0,
      blank: 0
    },
    uncategorized: []
  };

  // Initialize category structure
  for (const [categoryName, subcategories] of Object.entries(categories)) {
    results.categories[categoryName] = {
      subcategories: {},
      totals: { files: 0, lines: 0, comments: 0, code: 0, blank: 0 }
    };
    
    for (const subcategoryName of Object.keys(subcategories)) {
      results.categories[categoryName].subcategories[subcategoryName] = {
        files: [],
        totals: { files: 0, lines: 0, comments: 0, code: 0, blank: 0 }
      };
    }
  }

  // Get all files
  const allFiles = execSync('find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.html" -o -name "*.css" -o -name "*.toml" -o -name "*.config.*" | grep -v node_modules | grep -v .git | sort', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(f => f.length > 0)
    .map(f => f.replace('./', ''));

  // Categorize files
  for (const filepath of allFiles) {
    let categorized = false;
    const stats = countLines(filepath);
    
    for (const [, subcategories] of Object.entries(categories)) {
      for (const [subcategoryName, patterns] of Object.entries(subcategories)) {
        if (matchesAnyPattern(filepath, patterns)) {
          const category = Object.keys(categories).find(cat => categories[cat][subcategoryName]);
          const subcategory = results.categories[category].subcategories[subcategoryName];
          subcategory.files.push({ path: filepath, ...stats });
          
          // Update subcategory totals
          subcategory.totals.files++;
          subcategory.totals.lines += stats.total;
          subcategory.totals.comments += stats.comments;
          subcategory.totals.code += stats.code;
          subcategory.totals.blank += stats.blank;
          
          categorized = true;
          break;
        }
      }
      if (categorized) break;
    }
    
    if (!categorized) {
      results.uncategorized.push({ path: filepath, ...stats });
    }
    
    // Update global totals
    results.totals.files++;
    results.totals.lines += stats.total;
    results.totals.comments += stats.comments;
    results.totals.code += stats.code;
    results.totals.blank += stats.blank;
  }

  // Calculate category totals
  for (const categoryData of Object.values(results.categories)) {
    for (const subcategoryData of Object.values(categoryData.subcategories)) {
      categoryData.totals.files += subcategoryData.totals.files;
      categoryData.totals.lines += subcategoryData.totals.lines;
      categoryData.totals.comments += subcategoryData.totals.comments;
      categoryData.totals.code += subcategoryData.totals.code;
      categoryData.totals.blank += subcategoryData.totals.blank;
    }
  }

  return results;
}

function formatNumber(num) {
  return num.toLocaleString();
}

function formatPercentage(part, total) {
  if (total === 0) return '0.0%';
  return ((part / total) * 100).toFixed(1) + '%';
}

function printResults(results) {
  console.log('# Neary - Codebase Statistics\n');
  
  // Overall summary
  console.log('## Overall Summary');
  console.log(`- **Total Files**: ${formatNumber(results.totals.files)}`);
  console.log(`- **Total Lines**: ${formatNumber(results.totals.lines)}`);
  console.log(`- **Code Lines**: ${formatNumber(results.totals.code)} (${formatPercentage(results.totals.code, results.totals.lines)})`);
  console.log(`- **Comment Lines**: ${formatNumber(results.totals.comments)} (${formatPercentage(results.totals.comments, results.totals.lines)})`);
  console.log(`- **Blank Lines**: ${formatNumber(results.totals.blank)} (${formatPercentage(results.totals.blank, results.totals.lines)})`);
  console.log();

  // Category breakdown
  console.log('## Category Breakdown\n');
  
  for (const [categoryName, categoryData] of Object.entries(results.categories)) {
    if (categoryData.totals.files === 0) continue;
    
    console.log(`### ${categoryName}`);
    console.log(`**Total**: ${formatNumber(categoryData.totals.files)} files, ${formatNumber(categoryData.totals.lines)} lines (${formatPercentage(categoryData.totals.lines, results.totals.lines)})`);
    
    if (categoryData.totals.code > 0) {
      console.log(`**Code/Comments**: ${formatNumber(categoryData.totals.code)} code, ${formatNumber(categoryData.totals.comments)} comments`);
    }
    console.log();
    
    // Subcategory breakdown
    for (const [subcategoryName, subcategoryData] of Object.entries(categoryData.subcategories)) {
      if (subcategoryData.totals.files === 0) continue;
      
      console.log(`#### ${subcategoryName}`);
      console.log(`- Files: ${formatNumber(subcategoryData.totals.files)}`);
      console.log(`- Lines: ${formatNumber(subcategoryData.totals.lines)} (${formatPercentage(subcategoryData.totals.lines, results.totals.lines)})`);
      
      if (subcategoryData.totals.code > 0) {
        console.log(`- Code: ${formatNumber(subcategoryData.totals.code)} (${formatPercentage(subcategoryData.totals.code, subcategoryData.totals.lines)})`);
        console.log(`- Comments: ${formatNumber(subcategoryData.totals.comments)} (${formatPercentage(subcategoryData.totals.comments, subcategoryData.totals.lines)})`);
      }
      console.log();
    }
  }

  // Code quality metrics
  console.log('## Code Quality Metrics\n');
  
  const logicCategory = results.categories['Logic'];
  if (logicCategory && logicCategory.totals.code > 0) {
    const commentRatio = (logicCategory.totals.comments / logicCategory.totals.code) * 100;
    console.log(`### Logic Code Analysis`);
    console.log(`- **Comment Ratio**: ${commentRatio.toFixed(1)}% (${formatNumber(logicCategory.totals.comments)} comments / ${formatNumber(logicCategory.totals.code)} code lines)`);
    console.log(`- **Documentation Coverage**: ${commentRatio < 10 ? 'Low' : commentRatio < 20 ? 'Medium' : 'High'}`);
    console.log();
  }

  const testsCategory = results.categories['Tests'];
  if (testsCategory && logicCategory) {
    const testCoverage = (testsCategory.totals.lines / logicCategory.totals.lines) * 100;
    console.log(`### Test Coverage Analysis`);
    console.log(`- **Test to Logic Ratio**: ${testCoverage.toFixed(1)}% (${formatNumber(testsCategory.totals.lines)} test lines / ${formatNumber(logicCategory.totals.lines)} logic lines)`);
    console.log(`- **Test Coverage Level**: ${testCoverage < 30 ? 'Low' : testCoverage < 60 ? 'Medium' : 'High'}`);
    console.log();
  }

  // Largest files
  console.log('## Largest Files by Category\n');
  
  for (const [categoryName, categoryData] of Object.entries(results.categories)) {
    const allFiles = [];
    for (const subcategoryData of Object.values(categoryData.subcategories)) {
      allFiles.push(...subcategoryData.files);
    }
    
    if (allFiles.length === 0) continue;
    
    const largestFiles = allFiles
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    console.log(`### ${categoryName} - Top 5 Largest Files`);
    for (const file of largestFiles) {
      console.log(`- \`${file.path}\`: ${formatNumber(file.total)} lines`);
    }
    console.log();
  }

  // Uncategorized files
  if (results.uncategorized.length > 0) {
    console.log('## Uncategorized Files\n');
    for (const file of results.uncategorized) {
      console.log(`- \`${file.path}\`: ${formatNumber(file.total)} lines`);
    }
    console.log();
  }
}

// Run analysis
const results = analyzeCodebase();
printResults(results);