import React from 'react';
import {Spinner} from 'react-bootstrap'

function LoadingSpinner() {
    console.log('loader')
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: "100%", height: "70vh" }}>
      <Spinner animation="border" variant="secondary" />
  </div>
      );
}

export default LoadingSpinner;