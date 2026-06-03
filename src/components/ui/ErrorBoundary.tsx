import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Runtime error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-app px-4 text-white">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-card p-6 text-center shadow-2xl">
            <h1 className="text-2xl font-bold">Bir hata oluştu</h1>
            <p className="mt-3 text-muted">Sayfa yüklenirken beklenmeyen bir sorun yaşandı.</p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Sayfayı yenile
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
