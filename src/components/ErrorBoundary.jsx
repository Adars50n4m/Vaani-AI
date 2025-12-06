import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-neutral-900 text-white p-8 font-mono">
                    <h1 className="text-2xl text-red-500 mb-4">Something went wrong.</h1>
                    <div className="bg-black p-4 rounded border border-neutral-800 overflow-auto">
                        <p className="text-lg font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                        <pre className="text-xs text-neutral-400 whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
