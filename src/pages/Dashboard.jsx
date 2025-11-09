/**
 * Dashboard Page
 * Main page with task management UI
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const DashboardContent = () => {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showToast, setShowToast] = useState(null);

  // React Query hooks
  const { data, isLoading, isError, error, refetch } = useTasks(filters);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  // Toast notification helper
  const showToastMessage = (message, type = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // Handle create task
  const handleCreateTask = async (taskData) => {
    try {
      await createMutation.mutateAsync(taskData);
      setIsFormOpen(false);
      showToastMessage('Task created successfully!');
    } catch (err) {
      showToastMessage(
        err.response?.data?.detail || 'Failed to create task',
        'error'
      );
    }
  };

  // Handle edit task
  const handleEditTask = async (taskData) => {
    try {
      await updateMutation.mutateAsync({
        id: editingTask.id,
        data: taskData,
      });
      setIsFormOpen(false);
      setEditingTask(null);
      showToastMessage('Task updated successfully!');
    } catch (err) {
      showToastMessage(
        err.response?.data?.detail || 'Failed to update task',
        'error'
      );
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(taskId);
      showToastMessage('Task deleted successfully!');
    } catch (err) {
      showToastMessage(
        err.response?.data?.detail || 'Failed to delete task',
        'error'
      );
    }
  };

  // Open form for editing
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Open form for creating
  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  // Submit form (create or edit)
  const handleSubmitForm = (taskData) => {
    if (editingTask) {
      handleEditTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  const tasks = data?.items || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">TaskFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Tasks</h2>
              <p className="text-gray-600 mt-1">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              + Create Task
            </button>
          </div>

          {/* Filters */}
          <TaskFilters filters={filters} onFilterChange={setFilters} />

          {/* Task List */}
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteTask}
            onRetry={refetch}
          />
        </div>
      </main>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        task={editingTask}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg ${
              showToast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-green-600 text-white'
            }`}
          >
            {showToast.message}
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with QueryClientProvider
const Dashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default Dashboard;
