import React from 'react';

/**
 * Catches render errors anywhere below it so one broken widget doesn't blank
 * the whole site. Also handles failed lazy-chunk loads after a redeploy.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Hook an error-reporting service (Sentry, etc.) in here.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Unhandled UI error', error, info?.componentStack);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const chunkFailed = /Loading chunk|ChunkLoadError|dynamically imported module/i.test(
      String(this.state.error?.message || this.state.error?.name)
    );

    return (
      <div role="alert" style={{ padding: '4rem 1.5rem', textAlign: 'center', minHeight: '50vh' }}>
        <h2 style={{ color: '#a3171c', marginBottom: '1rem' }}>
          {chunkFailed ? 'A new version of the site is available' : 'Something went wrong'}
        </h2>
        <p style={{ color: '#555', marginBottom: '1.5rem' }}>
          {chunkFailed
            ? 'Please reload the page to continue.'
            : 'Please reload the page. If the problem continues, contact the temple office.'}
        </p>
        <button type="button" className="btn" onClick={this.handleReload}>
          Reload
        </button>
      </div>
    );
  }
}
