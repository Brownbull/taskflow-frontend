/**
 * TaskFilters Component
 * Filter controls for task list (status and priority)
 */

import React from 'react';

const TaskFilters = ({ filters, onFilterChange }) => {
  const handleChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <h3 className="font-semibold text-gray-700">Filters:</h3>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="priority-filter" className="text-sm font-medium text-gray-700">
            Priority:
          </label>
          <select
            id="priority-filter"
            value={filters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.status || filters.priority) && (
          <button
            onClick={() => onFilterChange({ status: '', priority: '' })}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
