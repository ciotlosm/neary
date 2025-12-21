/**
 * Services Index
 * Exports all service modules for easy importing
 */

// Architecture Simplification Services
export { CodeIntegrityPreservationSystem } from './CodeIntegrityPreservationSystem';
export { FunctionalityPreservationValidator } from './FunctionalityPreservationValidator';
export { ComprehensiveValidationPipeline, DEFAULT_VALIDATION_CONFIG } from './ComprehensiveValidationPipeline';
export { PerformanceDegradationMonitor } from './PerformanceDegradationMonitor';

// Existing Services
export { default as agencyService } from './agencyService';
export { default as appVersionService } from './appVersionService';
export { default as geocodingService } from './geocodingService';
export { default as routeMappingService } from './routeMappingService';
export { default as routePlanningService } from './routePlanningService';
export { default as serviceWorkerService } from './serviceWorkerService';
export { default as tranzyApiService } from './tranzyApiService';

// Data Processing Services
export { gpsFirstDataLoader } from './gpsFirstDataLoader';
export { stationSelector } from './stationSelector';
export { routeAssociationFilter } from './routeAssociationFilter';

// Utility Services
export { DataValidator } from './DataValidator';
export { ErrorReporter } from './ErrorReporter';
export { GracefulDegradationService } from './GracefulDegradationService';
export { DebugMonitoringService } from './DebugMonitoringService';
export { TransformationRetryManager } from './TransformationRetryManager';

// Error Handling and Rollback System
export { default as ErrorHandlingRollbackSystem } from './ErrorHandlingRollbackSystem';
export type {
  ErrorType,
  ErrorSeverity,
  RecoveryStrategy,
  RefactoringError,
  StateSnapshot,
  RecoveryResult,
  DirectoryNode,
  ValidationSnapshot
} from './ErrorHandlingRollbackSystem';

// Analysis and Optimization Services
export { CodebaseAnalysisEngine } from './CodebaseAnalysisEngine';
export { DuplicationConsolidationEngine } from './DuplicationConsolidationEngine';
export { FileFolderSizeOptimizer } from './FileFolderSizeOptimizer';
export { ModernArchitecturePatternEnforcerImpl, createModernArchitecturePatternEnforcer } from './ModernArchitecturePatternEnforcer';
export { ModuleMergingService } from './ModuleMergingService';
export { SharedImplementationReplacementService } from './SharedImplementationReplacementService';
export { UtilityExtractionService } from './UtilityExtractionService';

// Configuration and Management Services
export { RealTimeConfigurationManager } from './RealTimeConfigurationManager';
export { RouteActivityAnalyzer } from './RouteActivityAnalyzer';
export { RouteFilteringConfigurationManager } from './RouteFilteringConfigurationManager';
export { IntelligentVehicleFilter } from './IntelligentVehicleFilter';
export { VehicleTransformationService } from './VehicleTransformationService';

// Type exports for functionality preservation validation
export type {
  ApplicationStateSnapshot,
  StateComparisonResult,
  BehavioralTestCase,
  StateDifference,
  ComponentTreeNode,
  BundleInfo
} from './FunctionalityPreservationValidator';

export type {
  ValidationPipelineConfig,
  ValidationPipelineResult
} from './ComprehensiveValidationPipeline';

export type {
  PerformanceBaseline,
  PerformanceDegradationAnalysis,
  DegradedMetric,
  PerformanceThresholds,
  BundleMetrics,
  RuntimeMetrics,
  MemoryMetrics,
  BuildMetrics,
  TestMetrics
} from './PerformanceDegradationMonitor';

// Type exports for modern architecture pattern enforcement
export type {
  CompositionAnalysis,
  ReactPatternAnalysis,
  DependencyAnalysis,
  ArchitecturePatternAnalysis,
  ModernizationSuggestion,
  PatternTransformation
} from '../types/architectureSimplification';