/**
 * PriorityBadge Component
 * Displays task priority with color-coded badge
 */

import React from 'react';

const PriorityBadge = ({ priority }) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  };

  const displayPriority = priority || 'medium';
  const colorClass = colors[displayPriority] || colors.medium;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
    >
      {displayPriority.charAt(0).toUpperCase() + displayPriority.slice(1)}
    </span>
  );
};

export default PriorityBadge;
