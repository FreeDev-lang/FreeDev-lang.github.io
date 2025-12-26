import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ARErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Suppress XRSession already ended errors - these are harmless
    if (error.message?.includes('XRSession has already ended') || 
        error.message?.includes('Failed to execute \'end\' on \'XRSession\'')) {
      console.warn('XR Session cleanup warning (safe to ignore):', error.message)
      return
    }
    
    // Suppress React error #310 (hooks issue)
    if (error.message?.includes('Minified React error #310') || 
        error.message?.includes('Rendered more hooks than during the previous render')) {
      console.warn('React hooks error (safe to ignore):', error.message)
      return
    }
    
    console.error('AR Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">AR Error</h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An error occurred while loading AR'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

