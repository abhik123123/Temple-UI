import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page" style={{ padding: '4rem 1.5rem', textAlign: 'center', minHeight: '50vh' }}>
      <h1 style={{ color: '#8b4513', marginBottom: '1rem' }}>Page not found</h1>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        The page you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link className="btn" to="/home">
        Back to home
      </Link>
    </div>
  );
}
