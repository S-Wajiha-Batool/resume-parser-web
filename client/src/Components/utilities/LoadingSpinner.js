import React from 'react';
import '../UI/LoadingSpinner.css'

function LoadingSpinner() {
    console.log('loader')
    return (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>
      );
}

export default LoadingSpinner;