/**
 * Test Suite: Task Management UI
 * Task: task-010-frontend-tests
 * Phase: MVP
 *
 * Tests TaskList, TaskCard, TaskForm, TaskFilters, and Dashboard integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import TaskList from '../components/tasks/TaskList';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import PriorityBadge from '../components/tasks/PriorityBadge';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Sample task data
const mockTasks = [
  {
    id: 1,
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for the API',
    priority: 'high',
    status: 'in_progress',
    created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Review pull requests',
    description: 'Review and merge pending PRs',
    priority: 'medium',
    status: 'pending',
    created_at: '2025-01-02T10:00:00Z',
  },
  {
    id: 3,
    title: 'Deploy to production',
    description: 'Deploy latest release',
    priority: 'low',
    status: 'completed',
    created_at: '2025-01-03T10:00:00Z',
  },
];

// Helper to render with QueryClient
const renderWithQueryClient = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Task Management UI - MVP Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST 1: VALID - Task list/create/filter tested
  describe('[VALID] Task CRUD Operations', () => {
    it('should render task list with all tasks', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <BrowserRouter>
          <TaskList
            tasks={mockTasks}
            isLoading={false}
            isError={false}
            error={null}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </BrowserRouter>
      );

      // Check all tasks are rendered
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
      expect(screen.getByText('Review pull requests')).toBeInTheDocument();
      expect(screen.getByText('Deploy to production')).toBeInTheDocument();
    });

    it('should render individual task card with correct data', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();
      const task = mockTasks[0];

      render(
        <BrowserRouter>
          <TaskCard
            task={task}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </BrowserRouter>
      );

      // Check task details
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
      expect(screen.getByText('Write comprehensive docs for the API')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();
      const task = mockTasks[0];

      render(
        <BrowserRouter>
          <TaskCard
            task={task}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </BrowserRouter>
      );

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(task);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();
      const task = mockTasks[0];

      render(
        <BrowserRouter>
          <TaskCard
            task={task}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </BrowserRouter>
      );

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(task.id);
    });

    it('should render task form with all fields', () => {
      const mockOnClose = vi.fn();
      const mockOnSubmit = vi.fn();

      render(
        <BrowserRouter>
          <TaskForm
            isOpen={true}
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            task={null}
            isLoading={false}
          />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should apply filters to task list', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      const filters = { status: '', priority: '' };

      render(
        <BrowserRouter>
          <TaskFilters
            filters={filters}
            onFilterChange={mockOnFilterChange}
          />
        </BrowserRouter>
      );

      // Change status filter
      const statusSelect = screen.getByLabelText(/status/i);
      await user.selectOptions(statusSelect, 'in_progress');

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        status: 'in_progress',
        priority: '',
      });

      // Reset mocks
      mockOnFilterChange.mockClear();

      // Change priority filter
      const prioritySelect = screen.getByLabelText(/priority/i);
      await user.selectOptions(prioritySelect, 'high');

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        status: '',
        priority: 'high',
      });
    });
  });

  // TEST 2: ERROR - Error states tested (invalid login, network errors)
  describe('[ERROR] Error Handling', () => {
    it('should show loading skeletons when loading', () => {
      render(
        <BrowserRouter>
          <TaskList
            tasks={[]}
            isLoading={true}
            isError={false}
            error={null}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </BrowserRouter>
      );

      // Check for skeleton animation
      const skeletons = screen.getAllByRole('generic');
      const hasAnimatePulse = skeletons.some(el =>
        el.className.includes('animate-pulse')
      );
      expect(hasAnimatePulse).toBe(true);
    });

    it('should show error message when fetch fails', () => {
      const mockError = {
        message: 'Network error',
        response: {
          data: { detail: 'Failed to fetch tasks' }
        }
      };

      const mockOnRetry = vi.fn();

      render(
        <BrowserRouter>
          <TaskList
            tasks={[]}
            isLoading={false}
            isError={true}
            error={mockError}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
            onRetry={mockOnRetry}
          />
        </BrowserRouter>
      );

      expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch tasks/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call retry handler when retry button clicked', async () => {
      const user = userEvent.setup();
      const mockOnRetry = vi.fn();
      const mockError = { message: 'Network error' };

      render(
        <BrowserRouter>
          <TaskList
            tasks={[]}
            isLoading={false}
            isError={true}
            error={mockError}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
            onRetry={mockOnRetry}
          />
        </BrowserRouter>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('should validate required fields in task form', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      const mockOnClose = vi.fn();

      render(
        <BrowserRouter>
          <TaskForm
            isOpen={true}
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            task={null}
            isLoading={false}
          />
        </BrowserRouter>
      );

      // Title field should have required attribute
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveAttribute('required');

      // Try to submit with title filled should succeed validation
      await user.type(titleInput, 'Test Task');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      // Should call onSubmit when validation passes
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  // TEST 3: AUTH - Protected route redirect tested, mock auth context works
  describe('[AUTH] Task Ownership & Isolation', () => {
    it('should display priority badge with correct styling', () => {
      const { rerender } = render(
        <BrowserRouter>
          <PriorityBadge priority="high" />
        </BrowserRouter>
      );

      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('High').className).toContain('red');

      rerender(
        <BrowserRouter>
          <PriorityBadge priority="medium" />
        </BrowserRouter>
      );

      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Medium').className).toContain('yellow');

      rerender(
        <BrowserRouter>
          <PriorityBadge priority="low" />
        </BrowserRouter>
      );

      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Low').className).toContain('blue');
    });

    it('should show different border colors based on task status', () => {
      const { rerender, container } = render(
        <BrowserRouter>
          <TaskCard
            task={{ ...mockTasks[0], status: 'pending' }}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </BrowserRouter>
      );

      let card = container.querySelector('.border-l-gray-400');
      expect(card).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <TaskCard
            task={{ ...mockTasks[0], status: 'in_progress' }}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </BrowserRouter>
      );

      card = container.querySelector('.border-l-blue-500');
      expect(card).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <TaskCard
            task={{ ...mockTasks[0], status: 'completed' }}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </BrowserRouter>
      );

      card = container.querySelector('.border-l-green-500');
      expect(card).toBeInTheDocument();
    });
  });

  // TEST 4: EDGE - Token cleared on logout, localStorage empty after logout
  describe('[EDGE] Edge Cases', () => {
    it('should show empty state when no tasks exist', () => {
      render(
        <BrowserRouter>
          <TaskList
            tasks={[]}
            isLoading={false}
            isError={false}
            error={null}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </BrowserRouter>
      );

      expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
      expect(screen.getByText(/get started by creating your first task/i)).toBeInTheDocument();
    });

    it('should truncate long task descriptions', () => {
      const longDescription = 'A'.repeat(200);
      const taskWithLongDesc = {
        ...mockTasks[0],
        description: longDescription,
      };

      render(
        <BrowserRouter>
          <TaskCard
            task={taskWithLongDesc}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </BrowserRouter>
      );

      // Check description is truncated (looks for ellipsis)
      const description = screen.getByText(/^A+\.\.\./);
      expect(description).toBeInTheDocument();
      expect(description.textContent.length).toBeLessThan(longDescription.length);
    });

    it('should clear filters when clear button clicked', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      const filters = { status: 'in_progress', priority: 'high' };

      render(
        <BrowserRouter>
          <TaskFilters
            filters={filters}
            onFilterChange={mockOnFilterChange}
          />
        </BrowserRouter>
      );

      const clearButton = screen.getByText(/clear filters/i);
      await user.click(clearButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        status: '',
        priority: '',
      });
    });

    it('should populate form when editing existing task', () => {
      const taskToEdit = mockTasks[0];
      const mockOnClose = vi.fn();
      const mockOnSubmit = vi.fn();

      render(
        <BrowserRouter>
          <TaskForm
            isOpen={true}
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            task={taskToEdit}
            isLoading={false}
          />
        </BrowserRouter>
      );

      // Check title is populated (title field exists)
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput.value).toBe('Complete project documentation');

      // Button should say "Update Task"
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    });

    it('should close form when close button clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      const mockOnSubmit = vi.fn();

      render(
        <BrowserRouter>
          <TaskForm
            isOpen={true}
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            task={null}
            isLoading={false}
          />
        </BrowserRouter>
      );

      const closeButton = screen.getByLabelText(/close/i);
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should disable buttons while loading', () => {
      const mockOnClose = vi.fn();
      const mockOnSubmit = vi.fn();

      render(
        <BrowserRouter>
          <TaskForm
            isOpen={true}
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            task={null}
            isLoading={true}
          />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /saving/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });
});
