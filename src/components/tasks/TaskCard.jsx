/**
 * TaskCard Component
 * Displays individual task with edit/delete actions
 */

import React from 'react';
import PriorityBadge from './PriorityBadge';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const statusColors = {
    pending: 'border-l-gray-400 bg-gray-50',
    in_progress: 'border-l-blue-500 bg-blue-50',
    completed: 'border-l-green-500 bg-green-50',
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  const colorClass = statusColors[task.status] || statusColors.pending;

  // Truncate long descriptions
  const truncateDescription = (desc, maxLength = 150) => {
    if (!desc || desc.length <= maxLength) return desc;
    return desc.substring(0, maxLength) + '...';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 ${colorClass} p-4 mb-4 hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Title and Priority */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-gray-600 mb-3 text-sm">
              {truncateDescription(task.description)}
            </p>
          )}

          {/* Status and Date */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="px-2 py-1 bg-white border border-gray-300 rounded-full">
              {statusLabels[task.status] || 'Pending'}
            </span>
            {task.created_at && (
              <span>
                Created {new Date(task.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm px-3 py-1 rounded hover:bg-primary-50 transition-colors"
            aria-label={`Edit ${task.title}`}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
            aria-label={`Delete ${task.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
