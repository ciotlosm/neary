// Enhanced logging system for runtime error tracking
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;
  private currentLogLevel: LogLevel = LogLevel.INFO;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupWebSocketInterception();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupWebSocketInterception(): void {
    // Intercept WebSocket constructor to monitor all WebSocket connections
    const originalWebSocket = window.WebSocket;
    const logger = this;
    
    window.WebSocket = class extends originalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        
        const urlString = url.toString();
        logger.info(`WebSocket Connection Attempt: ${urlString}`, {
          url: urlString,
          protocols,
          timestamp: new Date().toISOString(),
          source: urlString.includes('vite') || urlString.includes('token=') ? 'Vite HMR' : 'Application'
        }, 'WEBSOCKET');

        // Monitor connection events
        this.addEventListener('open', () => {
          logger.info(`WebSocket Connected: ${urlString}`, {
            url: urlString,
            readyState: this.readyState,
            source: urlString.includes('vite') || urlString.includes('token=') ? 'Vite HMR' : 'Application'
          }, 'WEBSOCKET');
        });

        this.addEventListener('close', (event) => {
          const isViteHMR = urlString.includes('vite') || urlString.includes('token=');
          logger.warn(`WebSocket Disconnected: ${urlString}`, {
            url: urlString,
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            source: isViteHMR ? 'Vite HMR' : 'Application',
            explanation: isViteHMR ? 'This is a Vite development server WebSocket used for Hot Module Replacement (HMR)' : 'Application WebSocket connection closed',
            impact: isViteHMR ? 'No impact on app functionality - only affects live reloading during development' : 'May affect real-time features'
          }, 'WEBSOCKET');
        });

        this.addEventListener('error', (event) => {
          const isViteHMR = urlString.includes('vite') || urlString.includes('token=');
          logger.error(`WebSocket Error: ${urlString}`, {
            url: urlString,
            event,
            source: isViteHMR ? 'Vite HMR' : 'Application',
            errorType: 'WebSocket Connection Error',
            explanation: isViteHMR 
              ? 'Vite development server WebSocket connection failed - this is common and does not affect app functionality'
              : 'Application WebSocket connection error',
            troubleshooting: {
              commonCauses: isViteHMR 
                ? [
                    'Development server configuration',
                    'Browser WebSocket policy restrictions',
                    'Network proxy or firewall blocking WebSocket connections',
                    'HMR disabled in Vite configuration'
                  ]
                : [
                    'Server not running or unreachable',
                    'Network connectivity issues',
                    'Authentication or authorization problems',
                    'WebSocket protocol mismatch'
                  ],
              solutions: isViteHMR
                ? [
                    'This error can be safely ignored - it only affects live reloading',
                    'To disable: set hmr: false in vite.config.ts',
                    'Check browser console for additional Vite-specific messages',
                    'Refresh the page manually when making code changes'
                  ]
                : [
                    'Check if the WebSocket server is running',
                    'Verify the WebSocket URL is correct',
                    'Check network connectivity',
                    'Review authentication credentials'
                  ]
            }
          }, 'WEBSOCKET');
        });
      }
    };
  }

  private setupGlobalErrorHandlers(): void {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      let category = 'PROMISE';
      let enhancedData: any = { reason };

      // Check if it's a network-related error
      if (reason && typeof reason === 'object') {
        if (reason.message && reason.message.includes('WebSocket')) {
          category = 'WEBSOCKET';
          enhancedData = {
            ...enhancedData,
            errorType: 'WebSocket Connection Failed',
            url: this.extractUrlFromError(reason.message),
            possibleCause: 'HMR/Development server WebSocket connection issue'
          };
        } else if (reason.message && (reason.message.includes('fetch') || reason.message.includes('network'))) {
          category = 'NETWORK';
          enhancedData = {
            ...enhancedData,
            errorType: 'Network Request Failed',
            url: this.extractUrlFromError(reason.message)
          };
        }
      }

      this.error('Unhandled Promise Rejection', enhancedData, category);
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      let category = 'GLOBAL';
      let enhancedData: any = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      };

      // Check if it's a resource loading error
      if (event.target && event.target !== window) {
        const target = event.target as any;
        category = 'RESOURCE';
        enhancedData = {
          ...enhancedData,
          resourceType: target.tagName?.toLowerCase() || 'unknown',
          resourceUrl: target.src || target.href || 'unknown',
          errorType: 'Resource Load Failed'
        };
      }

      // Check for WebSocket errors in the message
      if (event.message && event.message.includes('WebSocket')) {
        category = 'WEBSOCKET';
        enhancedData = {
          ...enhancedData,
          errorType: 'WebSocket Error',
          url: this.extractUrlFromError(event.message),
          possibleCause: 'Development server WebSocket connection issue'
        };
      }

      this.error('Global Error', enhancedData, category);
    });

    // Intercept console errors to catch WebSocket-specific issues
    this.interceptConsoleErrors();

    // Monitor network requests
    this.monitorNetworkRequests();
  }

  private extractUrlFromError(message: string): string {
    // Extract URL from error messages
    const urlMatch = message.match(/https?:\/\/[^\s]+/);
    if (urlMatch) return urlMatch[0];
    
    const wsMatch = message.match(/ws:\/\/[^\s]+/);
    if (wsMatch) return wsMatch[0];
    
    return 'unknown';
  }

  private interceptConsoleErrors(): void {
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Check if this is a Vite WebSocket error
      if (message.includes('failed to connect to websocket') || 
          message.includes('WebSocket connection') ||
          message.includes('[vite]')) {
        
        // Extract more details from Vite's error message
        const urlMatch = message.match(/ws:\/\/[^\s)]+/);
        const tokenMatch = message.match(/token=([^&\s)]+)/);
        
        this.error('🔌 Vite WebSocket Connection Failed', {
          errorType: 'Development Server WebSocket Error',
          originalMessage: message,
          websocketUrl: urlMatch ? urlMatch[0] : 'unknown',
          token: tokenMatch ? tokenMatch[1] : 'unknown',
          serverSetup: {
            browser: 'localhost:5175/',
            server: 'localhost:5175/',
            protocol: 'WebSocket connection failing'
          },
          explanation: {
            what: 'Vite development server uses WebSocket for Hot Module Replacement (HMR)',
            why: 'The WebSocket connection is failing, likely due to server configuration',
            impact: 'Live reloading disabled - you need to refresh manually after code changes'
          },
          troubleshooting: {
            immediate: [
              '✅ App functionality is NOT affected',
              '✅ This only impacts development experience',
              '⚠️ Manual page refresh needed after code changes'
            ],
            solutions: [
              'Check vite.config.ts server configuration',
              'Try accessing via 127.0.0.1 instead of localhost',
              'Disable HMR: set hmr: false in vite.config.ts',
              'Check if port 5175 is properly configured'
            ]
          }
        }, 'WEBSOCKET');
        
        // Still call original error but with enhanced context
        originalError.apply(console, ['🔌 [ENHANCED LOG]', ...args]);
        return;
      }
      
      // Call original console.error for non-WebSocket errors
      originalError.apply(console, args);
    };

    // Also intercept console.warn for Vite warnings
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      if (message.includes('vite') || message.includes('HMR') || message.includes('websocket')) {
        this.warn('Vite Development Warning', {
          message,
          category: 'Development Server',
          impact: 'Development experience only'
        }, 'DEV_SERVER');
      }
      
      originalWarn.apply(console, args);
    };
  }

  private monitorNetworkRequests(): void {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const url = args[0].toString();
      const startTime = performance.now();
      
      try {
        this.debug(`Network Request Started: ${url}`, { method: 'GET' }, 'NETWORK');
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.info(`Network Request Completed: ${response.status} ${url}`, {
          status: response.status,
          statusText: response.statusText,
          duration: `${duration.toFixed(2)}ms`,
          headers: response.headers
        }, 'NETWORK');
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.error(`Network Request Failed: ${url}`, {
          error,
          duration: `${duration.toFixed(2)}ms`,
          errorType: 'Fetch Failed'
        }, 'NETWORK');
        throw error;
      }
    };

    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      (this as any)._loggerUrl = url.toString();
      (this as any)._loggerMethod = method;
      (this as any)._loggerStartTime = performance.now();
      
      logger.debug(`XHR Request Started: ${method} ${url}`, { method }, 'NETWORK');
      
      return originalXHROpen.call(this, method, url, ...args);
    };
    
    XMLHttpRequest.prototype.send = function(...args: any[]) {
      const xhr = this;
      const url = (xhr as any)._loggerUrl || 'unknown';
      const method = (xhr as any)._loggerMethod || 'unknown';
      
      xhr.addEventListener('load', () => {
        const duration = performance.now() - (xhr as any)._loggerStartTime;
        logger.info(`XHR Request Completed: ${xhr.status} ${method} ${url}`, {
          url: url,
          status: xhr.status,
          statusText: xhr.statusText,
          duration: `${duration.toFixed(2)}ms`,
          responseType: xhr.responseType
        }, 'NETWORK');
      });
      
      xhr.addEventListener('error', () => {
        const duration = performance.now() - (xhr as any)._loggerStartTime;
        logger.error(`XHR Request Failed: ${method} ${url}`, {
          url: url,
          status: xhr.status,
          statusText: xhr.statusText,
          duration: `${duration.toFixed(2)}ms`,
          errorType: 'XHR Failed'
        }, 'NETWORK');
      });
      
      return originalXHRSend.call(this, ...args);
    };
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with styling
    this.outputToConsole(entry);
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}] [${entry.category}]`;

    const styles = {
      [LogLevel.DEBUG]: 'color: #6b7280; font-weight: normal;',
      [LogLevel.INFO]: 'color: #3b82f6; font-weight: normal;',
      [LogLevel.WARN]: 'color: #f59e0b; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #ef4444; font-weight: bold;',
    };

    // Special styling for WebSocket and network issues
    let categoryStyle = styles[entry.level];
    if (entry.category === 'WEBSOCKET') {
      categoryStyle = entry.level === LogLevel.ERROR 
        ? 'color: #ef4444; font-weight: bold; background: #fef2f2; padding: 2px 4px; border-radius: 3px;'
        : 'color: #8b5cf6; font-weight: bold;';
    } else if (entry.category === 'NETWORK') {
      categoryStyle = entry.level === LogLevel.ERROR 
        ? 'color: #dc2626; font-weight: bold; background: #fef2f2; padding: 2px 4px; border-radius: 3px;'
        : 'color: #059669; font-weight: normal;';
    } else if (entry.category === 'RESOURCE') {
      categoryStyle = 'color: #d97706; font-weight: bold;';
    }

    console.log(`%c${prefix} ${entry.message}`, categoryStyle);
    
    if (entry.data) {
      // Enhanced data display for specific categories
      if (entry.category === 'WEBSOCKET' && entry.data.troubleshooting) {
        console.group('🔧 WebSocket Troubleshooting');
        console.log('📋 Common Causes:', entry.data.troubleshooting.commonCauses);
        console.log('💡 Solutions:', entry.data.troubleshooting.solutions);
        console.log('📊 Details:', { ...entry.data, troubleshooting: undefined });
        console.groupEnd();
      } else if (entry.category === 'NETWORK' && entry.data.duration) {
        console.log(`⏱️  Duration: ${entry.data.duration} | Status: ${entry.data.status || 'unknown'} | URL: ${entry.data.url || 'unknown'}`);
        if (entry.data.headers) {
          console.log('📋 Headers:', entry.data.headers);
        }
      } else if (entry.category === 'RESOURCE' && entry.data.troubleshooting) {
        console.group('🔧 Resource Loading Issue');
        console.log('📋 Possible Causes:', entry.data.troubleshooting.possibleCauses);
        console.log('📊 Details:', { ...entry.data, troubleshooting: undefined });
        console.groupEnd();
      } else {
        console.log('📊 Data:', entry.data);
      }
    }
    
    if (entry.error) {
      console.error('❌ Error:', entry.error);
    }

    // Add separator for important errors
    if (entry.level === LogLevel.ERROR && (entry.category === 'WEBSOCKET' || entry.category === 'NETWORK')) {
      console.log('%c' + '─'.repeat(80), 'color: #e5e7eb;');
    }
  }

  debug(message: string, data?: any, category = 'APP'): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.DEBUG,
      category,
      message,
      data,
      sessionId: this.sessionId,
    });
  }

  info(message: string, data?: any, category = 'APP'): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.INFO,
      category,
      message,
      data,
      sessionId: this.sessionId,
    });
  }

  warn(message: string, data?: any, category = 'APP'): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.WARN,
      category,
      message,
      data,
      sessionId: this.sessionId,
    });
  }

  error(message: string, error?: Error | any, category = 'APP'): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      category,
      message,
      error: error instanceof Error ? error : new Error(String(error)),
      data: error instanceof Error ? undefined : error,
      sessionId: this.sessionId,
    });
  }

  // API-specific logging methods
  apiRequest(url: string, method: string, data?: any): void {
    this.info(`API Request: ${method} ${url}`, data, 'API');
  }

  apiResponse(url: string, status: number, data?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `API Response: ${status} ${url}`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, data, 'API');
    } else {
      this.info(message, data, 'API');
    }
  }

  apiError(url: string, error: Error): void {
    this.error(`API Error: ${url}`, error, 'API');
  }

  // Store-specific logging
  storeAction(storeName: string, action: string, data?: any): void {
    this.debug(`Store Action: ${storeName}.${action}`, data, 'STORE');
  }

  storeError(storeName: string, action: string, error: Error): void {
    this.error(`Store Error: ${storeName}.${action}`, error, 'STORE');
  }

  // Component-specific logging
  componentMount(componentName: string): void {
    this.debug(`Component Mounted: ${componentName}`, undefined, 'COMPONENT');
  }

  componentUnmount(componentName: string): void {
    this.debug(`Component Unmounted: ${componentName}`, undefined, 'COMPONENT');
  }

  componentError(componentName: string, error: Error): void {
    this.error(`Component Error: ${componentName}`, error, 'COMPONENT');
  }

  // WebSocket-specific logging
  websocketConnection(url: string, status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    const level = status === 'error' ? LogLevel.ERROR : LogLevel.INFO;
    const message = `WebSocket ${status}: ${url}`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, {
        url,
        status,
        timestamp: new Date().toISOString(),
        troubleshooting: {
          commonCauses: [
            'Development server HMR configuration',
            'Network connectivity issues',
            'Server not running or misconfigured'
          ],
          solutions: [
            'Check if development server is running',
            'Verify WebSocket configuration in vite.config.ts',
            'Try disabling HMR if not needed'
          ]
        }
      }, 'WEBSOCKET');
    } else {
      this.info(message, { url, status }, 'WEBSOCKET');
    }
  }

  // Resource loading logging
  resourceLoad(url: string, type: string, status: 'loading' | 'loaded' | 'error', details?: any): void {
    const level = status === 'error' ? LogLevel.ERROR : LogLevel.INFO;
    const message = `Resource ${status}: ${type} ${url}`;
    
    const logData = {
      url,
      type,
      status,
      timestamp: new Date().toISOString(),
      ...details
    };

    if (level === LogLevel.ERROR) {
      this.error(message, {
        ...logData,
        troubleshooting: {
          possibleCauses: [
            'File not found (404)',
            'Network connectivity issues',
            'CORS policy restrictions',
            'Server configuration problems'
          ]
        }
      }, 'RESOURCE');
    } else {
      this.info(message, logData, 'RESOURCE');
    }
  }

  // Development server logging
  devServerIssue(issue: string, details?: any): void {
    this.warn(`Development Server Issue: ${issue}`, {
      ...details,
      environment: 'development',
      impact: 'Development experience only',
      note: 'This will not affect production builds'
    }, 'DEV_SERVER');
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared');
  }
}

// Singleton instance
export const logger = new Logger();

// Set log level based on environment
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  logger.setLogLevel(LogLevel.DEBUG);
} else {
  logger.setLogLevel(LogLevel.WARN);
}