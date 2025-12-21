/**
 * Modern Architecture Pattern Enforcer
 * Implements composition vs inheritance analysis, React pattern detection, and dependency minimization
 * Validates Requirements: 7.1, 7.3, 7.4
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import type {
  ArchitecturePatternAnalysis,
  CompositionAnalysis,
  ReactPatternAnalysis,
  DependencyAnalysis,
  PatternTransformation,
  ModernizationSuggestion,
  FileInfo
} from '../types/architectureSimplification';

export interface ModernArchitecturePatternEnforcer {
  analyzeCompositionVsInheritance(files: FileInfo[]): Promise<CompositionAnalysis>;
  analyzeReactPatterns(files: FileInfo[]): Promise<ReactPatternAnalysis>;
  analyzeDependencies(files: FileInfo[]): Promise<DependencyAnalysis>;
  generateModernizationPlan(files: FileInfo[]): Promise<ModernizationSuggestion[]>;
  transformToModernPatterns(transformations: PatternTransformation[]): Promise<void>;
}

/**
 * Implementation of modern architecture pattern enforcement
 */
export class ModernArchitecturePatternEnforcerImpl implements ModernArchitecturePatternEnforcer {
  private rootPath: string;

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath;
  }

  /**
   * Analyzes composition vs inheritance patterns using AST parsing
   * Validates Requirement 7.1: favor composition over inheritance
   */
  async analyzeCompositionVsInheritance(files: FileInfo[]): Promise<CompositionAnalysis> {
    const inheritancePatterns: Array<{
      file: string;
      className: string;
      baseClass: string;
      lineNumber: number;
      complexity: 'low' | 'medium' | 'high';
    }> = [];

    const compositionPatterns: Array<{
      file: string;
      componentName: string;
      composedTypes: string[];
      lineNumber: number;
    }> = [];

    for (const file of files) {
      if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx')) continue;

      try {
        const fullPath = path.join(this.rootPath, file.path);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const sourceFile = ts.createSourceFile(
          file.path,
          content,
          ts.ScriptTarget.Latest,
          true
        );

        // Analyze inheritance patterns
        const inheritance = this.findInheritancePatterns(sourceFile, file.path);
        inheritancePatterns.push(...inheritance);

        // Analyze composition patterns
        const composition = this.findCompositionPatterns(sourceFile, file.path);
        compositionPatterns.push(...composition);

      } catch (error) {
        console.warn(`Failed to analyze patterns in ${file.path}:`, error);
      }
    }

    const totalPatterns = inheritancePatterns.length + compositionPatterns.length;
    const compositionRatio = totalPatterns > 0 ? compositionPatterns.length / totalPatterns : 1;

    return {
      inheritancePatterns,
      compositionPatterns,
      compositionRatio,
      recommendations: this.generateCompositionRecommendations(inheritancePatterns, compositionRatio)
    };
  }

  /**
   * Analyzes React component patterns (hooks vs class components)
   * Validates Requirement 7.3: use modern React patterns including hooks
   */
  async analyzeReactPatterns(files: FileInfo[]): Promise<ReactPatternAnalysis> {
    const classComponents: Array<{
      file: string;
      componentName: string;
      lineNumber: number;
      hasState: boolean;
      hasLifecycleMethods: boolean;
    }> = [];

    const hookComponents: Array<{
      file: string;
      componentName: string;
      lineNumber: number;
      hooksUsed: string[];
    }> = [];

    const modernPatterns: Array<{
      file: string;
      patternType: 'composition' | 'custom-hook' | 'context' | 'reducer';
      description: string;
      lineNumber: number;
    }> = [];

    for (const file of files) {
      if (!file.path.endsWith('.tsx') && !file.path.endsWith('.jsx')) continue;

      try {
        const fullPath = path.join(this.rootPath, file.path);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const sourceFile = ts.createSourceFile(
          file.path,
          content,
          ts.ScriptTarget.Latest,
          true
        );

        // Find class components
        const classComps = this.findClassComponents(sourceFile, file.path);
        classComponents.push(...classComps);

        // Find hook-based components
        const hookComps = this.findHookComponents(sourceFile, file.path);
        hookComponents.push(...hookComps);

        // Find modern patterns
        const modern = this.findModernReactPatterns(sourceFile, file.path);
        modernPatterns.push(...modern);

      } catch (error) {
        console.warn(`Failed to analyze React patterns in ${file.path}:`, error);
      }
    }

    const totalComponents = classComponents.length + hookComponents.length;
    const modernizationScore = totalComponents > 0 ? 
      (hookComponents.length + modernPatterns.length) / (totalComponents + modernPatterns.length) : 1;

    return {
      classComponents,
      hookComponents,
      modernPatterns,
      modernizationScore,
      recommendations: this.generateReactModernizationRecommendations(classComponents, modernizationScore)
    };
  }

  /**
   * Analyzes dependencies for minimization opportunities
   * Validates Requirement 7.4: minimize dependencies between modules
   */
  async analyzeDependencies(files: FileInfo[]): Promise<DependencyAnalysis> {
    const dependencyGraph = new Map<string, Set<string>>();
    const circularDependencies: Array<{
      cycle: string[];
      severity: 'low' | 'medium' | 'high';
    }> = [];
    const excessiveDependencies: Array<{
      file: string;
      dependencyCount: number;
      dependencies: string[];
    }> = [];

    // Build dependency graph
    for (const file of files) {
      dependencyGraph.set(file.path, new Set(file.dependencies));
    }

    // Find circular dependencies
    const cycles = this.findCircularDependencies(dependencyGraph);
    circularDependencies.push(...cycles);

    // Find files with excessive dependencies
    const excessive = files
      .filter(file => file.dependencies.length > 10)
      .map(file => ({
        file: file.path,
        dependencyCount: file.dependencies.length,
        dependencies: file.dependencies
      }));
    excessiveDependencies.push(...excessive);

    // Calculate coupling metrics
    const totalDependencies = files.reduce((sum, file) => sum + file.dependencies.length, 0);
    const averageDependencies = files.length > 0 ? totalDependencies / files.length : 0;
    const couplingScore = this.calculateCouplingScore(dependencyGraph);

    return {
      dependencyGraph: Object.fromEntries(
        Array.from(dependencyGraph.entries()).map(([key, value]) => [key, Array.from(value)])
      ),
      circularDependencies,
      excessiveDependencies,
      averageDependencies,
      couplingScore,
      recommendations: this.generateDependencyRecommendations(circularDependencies, excessiveDependencies, couplingScore)
    };
  }

  /**
   * Generates comprehensive modernization plan
   */
  async generateModernizationPlan(files: FileInfo[]): Promise<ModernizationSuggestion[]> {
    const suggestions: ModernizationSuggestion[] = [];

    const [compositionAnalysis, reactAnalysis, dependencyAnalysis] = await Promise.all([
      this.analyzeCompositionVsInheritance(files),
      this.analyzeReactPatterns(files),
      this.analyzeDependencies(files)
    ]);

    // Generate composition suggestions
    for (const inheritance of compositionAnalysis.inheritancePatterns) {
      if (inheritance.complexity === 'high') {
        suggestions.push({
          type: 'composition-refactor',
          file: inheritance.file,
          description: `Convert class inheritance to composition pattern`,
          currentPattern: `class ${inheritance.className} extends ${inheritance.baseClass}`,
          suggestedPattern: `Use composition with ${inheritance.baseClass} as a property`,
          effort: 'high',
          priority: 'medium',
          benefits: ['Improved testability', 'Reduced coupling', 'Better flexibility']
        });
      }
    }

    // Generate React modernization suggestions
    for (const classComponent of reactAnalysis.classComponents) {
      suggestions.push({
        type: 'react-hooks-migration',
        file: classComponent.file,
        description: `Convert class component to hooks`,
        currentPattern: `class ${classComponent.componentName} extends React.Component`,
        suggestedPattern: `function ${classComponent.componentName}() with hooks`,
        effort: classComponent.hasLifecycleMethods ? 'high' : 'medium',
        priority: 'high',
        benefits: ['Modern React patterns', 'Better performance', 'Simpler testing']
      });
    }

    // Generate dependency reduction suggestions
    for (const excessive of dependencyAnalysis.excessiveDependencies) {
      suggestions.push({
        type: 'dependency-reduction',
        file: excessive.file,
        description: `Reduce excessive dependencies (${excessive.dependencyCount} imports)`,
        currentPattern: `${excessive.dependencyCount} dependencies`,
        suggestedPattern: 'Split into smaller, focused modules',
        effort: 'high',
        priority: 'medium',
        benefits: ['Reduced coupling', 'Better maintainability', 'Easier testing']
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Transforms code to use modern patterns (placeholder for actual transformation)
   */
  async transformToModernPatterns(transformations: PatternTransformation[]): Promise<void> {
    // This would implement actual code transformations
    // For now, we'll just log the transformations that would be applied
    console.log('Pattern transformations to apply:', transformations.length);
    
    for (const transformation of transformations) {
      console.log(`- ${transformation.type} in ${transformation.file}: ${transformation.description}`);
    }
    
    // In a real implementation, this would:
    // 1. Parse the source files
    // 2. Apply AST transformations
    // 3. Write the transformed code back to files
    // 4. Update import statements
    // 5. Run tests to verify functionality is preserved
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Finds inheritance patterns in a TypeScript source file
   */
  private findInheritancePatterns(sourceFile: ts.SourceFile, filePath: string): Array<{
    file: string;
    className: string;
    baseClass: string;
    lineNumber: number;
    complexity: 'low' | 'medium' | 'high';
  }> {
    const patterns: Array<{
      file: string;
      className: string;
      baseClass: string;
      lineNumber: number;
      complexity: 'low' | 'medium' | 'high';
    }> = [];

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.heritageClauses) {
        for (const heritage of node.heritageClauses) {
          if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {
            for (const type of heritage.types) {
              if (ts.isIdentifier(type.expression)) {
                const className = node.name?.text || 'Anonymous';
                const baseClass = type.expression.text;
                const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                
                // Determine complexity based on class size and method count
                const complexity = this.assessInheritanceComplexity(node);
                
                patterns.push({
                  file: filePath,
                  className,
                  baseClass,
                  lineNumber,
                  complexity
                });
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return patterns;
  }

  /**
   * Finds composition patterns in a TypeScript source file
   */
  private findCompositionPatterns(sourceFile: ts.SourceFile, filePath: string): Array<{
    file: string;
    componentName: string;
    composedTypes: string[];
    lineNumber: number;
  }> {
    const patterns: Array<{
      file: string;
      componentName: string;
      composedTypes: string[];
      lineNumber: number;
    }> = [];

    const visit = (node: ts.Node) => {
      // Look for classes or interfaces that use composition
      if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
        const name = node.name?.text || 'Anonymous';
        const composedTypes: string[] = [];
        
        // Find properties that represent composed objects
        for (const member of node.members) {
          if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
            if (member.type && ts.isTypeReferenceNode(member.type)) {
              if (ts.isIdentifier(member.type.typeName)) {
                composedTypes.push(member.type.typeName.text);
              }
            }
          }
        }
        
        if (composedTypes.length > 0) {
          const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          patterns.push({
            file: filePath,
            componentName: name,
            composedTypes,
            lineNumber
          });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return patterns;
  }

  /**
   * Finds React class components
   */
  private findClassComponents(sourceFile: ts.SourceFile, filePath: string): Array<{
    file: string;
    componentName: string;
    lineNumber: number;
    hasState: boolean;
    hasLifecycleMethods: boolean;
  }> {
    const components: Array<{
      file: string;
      componentName: string;
      lineNumber: number;
      hasState: boolean;
      hasLifecycleMethods: boolean;
    }> = [];

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.heritageClauses) {
        for (const heritage of node.heritageClauses) {
          if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {
            for (const type of heritage.types) {
              if (ts.isExpressionWithTypeArguments(type)) {
                const expression = type.expression;
                if (ts.isPropertyAccessExpression(expression) && 
                    ts.isIdentifier(expression.expression) &&
                    expression.expression.text === 'React' &&
                    expression.name.text === 'Component') {
                  
                  const componentName = node.name?.text || 'Anonymous';
                  const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                  const hasState = this.hasStateProperty(node);
                  const hasLifecycleMethods = this.hasLifecycleMethods(node);
                  
                  components.push({
                    file: filePath,
                    componentName,
                    lineNumber,
                    hasState,
                    hasLifecycleMethods
                  });
                }
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return components;
  }

  /**
   * Finds hook-based React components
   */
  private findHookComponents(sourceFile: ts.SourceFile, filePath: string): Array<{
    file: string;
    componentName: string;
    lineNumber: number;
    hooksUsed: string[];
  }> {
    const components: Array<{
      file: string;
      componentName: string;
      lineNumber: number;
      hooksUsed: string[];
    }> = [];

    const visit = (node: ts.Node) => {
      // Look for function components that use hooks
      if ((ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) && 
          this.isReactComponent(node)) {
        
        const componentName = this.getComponentName(node);
        const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const hooksUsed = this.findHooksInFunction(node);
        
        if (hooksUsed.length > 0) {
          components.push({
            file: filePath,
            componentName,
            lineNumber,
            hooksUsed
          });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return components;
  }

  /**
   * Finds modern React patterns
   */
  private findModernReactPatterns(sourceFile: ts.SourceFile, filePath: string): Array<{
    file: string;
    patternType: 'composition' | 'custom-hook' | 'context' | 'reducer';
    description: string;
    lineNumber: number;
  }> {
    const patterns: Array<{
      file: string;
      patternType: 'composition' | 'custom-hook' | 'context' | 'reducer';
      description: string;
      lineNumber: number;
    }> = [];

    const visit = (node: ts.Node) => {
      // Look for custom hooks
      if (ts.isFunctionDeclaration(node) && node.name?.text.startsWith('use')) {
        const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        patterns.push({
          file: filePath,
          patternType: 'custom-hook',
          description: `Custom hook: ${node.name.text}`,
          lineNumber
        });
      }
      
      // Look for React.createContext usage
      if (ts.isCallExpression(node) && 
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'React' &&
          node.expression.name.text === 'createContext') {
        
        const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        patterns.push({
          file: filePath,
          patternType: 'context',
          description: 'React Context usage',
          lineNumber
        });
      }
      
      // Look for useReducer usage
      if (ts.isCallExpression(node) && 
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'useReducer') {
        
        const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        patterns.push({
          file: filePath,
          patternType: 'reducer',
          description: 'useReducer pattern',
          lineNumber
        });
      }
      
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return patterns;
  }

  /**
   * Finds circular dependencies in the dependency graph
   */
  private findCircularDependencies(dependencyGraph: Map<string, Set<string>>): Array<{
    cycle: string[];
    severity: 'low' | 'medium' | 'high';
  }> {
    const cycles: Array<{
      cycle: string[];
      severity: 'low' | 'medium' | 'high';
    }> = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart).concat([node]);
        const severity = cycle.length > 5 ? 'high' : cycle.length > 3 ? 'medium' : 'low';
        cycles.push({ cycle, severity });
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);

      const dependencies = dependencyGraph.get(node) || new Set();
      for (const dep of dependencies) {
        dfs(dep, [...path, node]);
      }

      recursionStack.delete(node);
    };

    for (const node of dependencyGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }

  /**
   * Calculates coupling score for the dependency graph
   */
  private calculateCouplingScore(dependencyGraph: Map<string, Set<string>>): number {
    const totalFiles = dependencyGraph.size;
    if (totalFiles === 0) return 0;

    const totalDependencies = Array.from(dependencyGraph.values())
      .reduce((sum, deps) => sum + deps.size, 0);

    // Normalize to 0-1 scale where 0 is no coupling, 1 is maximum coupling
    const maxPossibleDependencies = totalFiles * (totalFiles - 1);
    return maxPossibleDependencies > 0 ? totalDependencies / maxPossibleDependencies : 0;
  }

  // Additional helper methods...
  private assessInheritanceComplexity(node: ts.ClassDeclaration): 'low' | 'medium' | 'high' {
    const memberCount = node.members.length;
    if (memberCount > 10) return 'high';
    if (memberCount > 5) return 'medium';
    return 'low';
  }

  private hasStateProperty(node: ts.ClassDeclaration): boolean {
    return node.members.some(member => 
      ts.isPropertyDeclaration(member) && 
      member.name && 
      ts.isIdentifier(member.name) && 
      member.name.text === 'state'
    );
  }

  private hasLifecycleMethods(node: ts.ClassDeclaration): boolean {
    const lifecycleMethods = [
      'componentDidMount', 'componentDidUpdate', 'componentWillUnmount',
      'shouldComponentUpdate', 'getSnapshotBeforeUpdate', 'componentDidCatch'
    ];
    
    return node.members.some(member => 
      ts.isMethodDeclaration(member) && 
      member.name && 
      ts.isIdentifier(member.name) && 
      lifecycleMethods.includes(member.name.text)
    );
  }

  private isReactComponent(node: ts.FunctionDeclaration | ts.ArrowFunction): boolean {
    // Simple heuristic: function returns JSX or has JSX in body
    const text = node.getFullText();
    return text.includes('return') && (text.includes('<') || text.includes('jsx') || text.includes('React.createElement'));
  }

  private getComponentName(node: ts.FunctionDeclaration | ts.ArrowFunction): string {
    if (ts.isFunctionDeclaration(node) && node.name) {
      return node.name.text;
    }
    return 'Anonymous';
  }

  private findHooksInFunction(node: ts.FunctionDeclaration | ts.ArrowFunction): string[] {
    const hooks: string[] = [];
    const hookPattern = /use[A-Z]\w*/g;
    const text = node.getFullText();
    const matches = text.match(hookPattern);
    
    if (matches) {
      hooks.push(...matches);
    }
    
    return [...new Set(hooks)]; // Remove duplicates
  }

  private generateCompositionRecommendations(
    inheritancePatterns: Array<{ complexity: string }>, 
    compositionRatio: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (compositionRatio < 0.7) {
      recommendations.push('Consider favoring composition over inheritance for better flexibility');
    }
    
    const highComplexityInheritance = inheritancePatterns.filter(p => p.complexity === 'high');
    if (highComplexityInheritance.length > 0) {
      recommendations.push('Refactor complex inheritance hierarchies to use composition patterns');
    }
    
    return recommendations;
  }

  private generateReactModernizationRecommendations(
    classComponents: Array<any>, 
    modernizationScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (classComponents.length > 0) {
      recommendations.push('Migrate class components to functional components with hooks');
    }
    
    if (modernizationScore < 0.8) {
      recommendations.push('Adopt more modern React patterns like custom hooks and context');
    }
    
    return recommendations;
  }

  private generateDependencyRecommendations(
    circularDependencies: Array<any>,
    excessiveDependencies: Array<any>,
    couplingScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (circularDependencies.length > 0) {
      recommendations.push('Resolve circular dependencies by restructuring module relationships');
    }
    
    if (excessiveDependencies.length > 0) {
      recommendations.push('Split files with excessive dependencies into smaller, focused modules');
    }
    
    if (couplingScore > 0.3) {
      recommendations.push('Reduce overall coupling by minimizing cross-module dependencies');
    }
    
    return recommendations;
  }
}

/**
 * Factory function to create a configured ModernArchitecturePatternEnforcer
 */
export function createModernArchitecturePatternEnforcer(rootPath?: string): ModernArchitecturePatternEnforcer {
  return new ModernArchitecturePatternEnforcerImpl(rootPath);
}

/**
 * Default export for convenience
 */
export default ModernArchitecturePatternEnforcerImpl;