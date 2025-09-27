import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error.message || 'Something went wrong',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in component:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container flex flex-col items-center justify-center min-h-screen bg-red-100 p-6 text-center">
          <h2 className="text-red-600 text-2xl font-semibold">
            Oops! Something went wrong.
          </h2>
          <p className="text-gray-700 mt-2">{this.state.errorMessage}</p>

          <div className="mt-4 flex gap-4">
            <button
              onClick={this.handleReload}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Reload Page
            </button>

            <Link
              to="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              onClick={() => this.setState({ hasError: false })}
            >
              Go to Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
