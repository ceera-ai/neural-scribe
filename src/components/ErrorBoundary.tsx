import { Component, ReactNode, ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * React Error Boundary component to catch and handle rendering errors
 *
 * @remarks
 * This component prevents the entire app from crashing when a component
 * throws an error during rendering, lifecycle methods, or constructors.
 *
 * It displays a fallback UI and logs the error for debugging.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('[ErrorBoundary] Component error caught:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)

    this.setState({
      error,
      errorInfo,
    })

    // Send error to electron main process for logging
    if (window.electronAPI) {
      window.electronAPI.logError({
        message: error.message,
        stack: error.stack || '',
        componentStack: errorInfo.componentStack,
      })
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary-fallback">
          <div className="error-content">
            <h1>Something went wrong</h1>
            <p>The application encountered an unexpected error.</p>

            {this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>
                  <strong>Error:</strong> {this.state.error.message}
                  {'\n\n'}
                  <strong>Stack:</strong>
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn btn-primary">
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
              >
                Reload App
              </button>
            </div>
          </div>

          <style>{`
            .error-boundary-fallback {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .error-content {
              background: white;
              border-radius: 12px;
              padding: 3rem;
              max-width: 600px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }

            .error-content h1 {
              margin: 0 0 1rem;
              color: #e53e3e;
              font-size: 2rem;
            }

            .error-content p {
              margin: 0 0 1.5rem;
              color: #4a5568;
              font-size: 1.1rem;
            }

            .error-details {
              margin: 1.5rem 0;
              padding: 1rem;
              background: #f7fafc;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #2d3748;
              user-select: none;
            }

            .error-details pre {
              margin: 1rem 0 0;
              padding: 1rem;
              background: #1a202c;
              color: #f7fafc;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 0.875rem;
              line-height: 1.5;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              margin-top: 2rem;
            }

            .error-actions .btn {
              flex: 1;
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 6px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }

            .error-actions .btn-primary {
              background: #667eea;
              color: white;
            }

            .error-actions .btn-primary:hover {
              background: #5a67d8;
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .error-actions .btn-secondary {
              background: #edf2f7;
              color: #2d3748;
            }

            .error-actions .btn-secondary:hover {
              background: #e2e8f0;
            }
          `}</style>
        </div>
      )
    }

    return this.props.children
  }
}
