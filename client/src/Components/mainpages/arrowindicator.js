import React from 'react';

const ArrowIndicator = ({ value }) => {
  const arrowColor = value >= 0 ? 'green' : 'red';
  const arrowDirection = value >= 0 ? 'up' : 'down';

  return (
    <div className={`arrow-indicator arrow-${arrowDirection}-${arrowColor}`} />
  );
};

export default ArrowIndicator;