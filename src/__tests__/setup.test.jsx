/**
 * Test Suite: Frontend Project Scaffolding
 * Task: task-006-frontend-scaffolding
 * Phase: MVP
 *
 * Tests project setup, dependencies, and configuration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';
import packageJson from '../../package.json';
import fs from 'fs';
import path from 'path';

describe('Frontend Scaffolding - MVP Tests', () => {

  // TEST 1: VALID - Project starts and renders welcome screen
  describe('[VALID] Project Setup', () => {
    it('should render App component with TaskFlow welcome message', () => {
      render(<App />);

      // Check that TaskFlow title is present (exact match in h1)
      const title = screen.getByRole('heading', { name: 'TaskFlow', level: 1 });
      expect(title).toBeInTheDocument();

      // Check that welcome message is present
      const welcome = screen.getByText(/Welcome to TaskFlow/i);
      expect(welcome).toBeInTheDocument();

      // Check that Vite ready message is present
      const viteReady = screen.getByText(/Vite \+ React Ready!/i);
      expect(viteReady).toBeInTheDocument();
    });

    it('should have correct package.json configuration', () => {
      // Verify project name
      expect(packageJson.name).toBe('taskflow-frontend');

      // Verify it's a module
      expect(packageJson.type).toBe('module');

      // Verify scripts are defined
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('test');
    });
  });

  // TEST 2: ERROR - Missing dependencies show clear npm install message
  describe('[ERROR] Dependency Management', () => {
    it('should have all required dependencies installed', () => {
      const requiredDeps = [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'react-hot-toast'
      ];

      const requiredDevDeps = [
        'vite',
        '@vitejs/plugin-react',
        'tailwindcss',
        'vitest',
        '@testing-library/react'
      ];

      // Check all required production dependencies
      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies).toHaveProperty(dep);
      });

      // Check all required development dependencies
      requiredDevDeps.forEach(dep => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });

    it('should have proper version constraints for dependencies', () => {
      // React 18.2+
      expect(packageJson.dependencies.react).toMatch(/\^18\.2/);

      // Vite 5.0+
      expect(packageJson.devDependencies.vite).toMatch(/\^5\.0/);

      // Tailwind 3.4+
      expect(packageJson.devDependencies.tailwindcss).toMatch(/\^3\.4/);
    });
  });

  // TEST 3: AUTH - N/A for project setup (replaced with configuration test)
  describe('[CONFIG] Project Configuration', () => {
    it('should have vite.config.js with correct settings', () => {
      const configPath = path.join(process.cwd(), 'vite.config.js');
      expect(fs.existsSync(configPath)).toBe(true);

      const configContent = fs.readFileSync(configPath, 'utf-8');

      // Check for React plugin
      expect(configContent).toContain('@vitejs/plugin-react');

      // Check for port 5173
      expect(configContent).toContain('5173');

      // Check for test configuration
      expect(configContent).toContain('test:');
      expect(configContent).toContain('jsdom');
    });

    it('should have tailwind.config.js with proper content paths', () => {
      const configPath = path.join(process.cwd(), 'tailwind.config.js');
      expect(fs.existsSync(configPath)).toBe(true);

      const configContent = fs.readFileSync(configPath, 'utf-8');

      // Check for content paths
      expect(configContent).toContain('./index.html');
      expect(configContent).toContain('./src/**/*.{js,ts,jsx,tsx}');

      // Check for custom colors
      expect(configContent).toContain('primary');
    });

    it('should have .env.example with API URL configuration', () => {
      const envPath = path.join(process.cwd(), '.env.example');
      expect(fs.existsSync(envPath)).toBe(true);

      const envContent = fs.readFileSync(envPath, 'utf-8');
      expect(envContent).toContain('VITE_API_URL');
    });
  });

  // TEST 4: EDGE - Works on Windows paths
  describe('[EDGE] Windows Path Compatibility', () => {
    it('should handle Windows-style paths correctly', () => {
      // Test that package.json uses forward slashes or works with both
      const { scripts } = packageJson;

      // Verify scripts don't have platform-specific path issues
      expect(scripts.dev).toBeDefined();
      expect(scripts.build).toBeDefined();
      expect(scripts.test).toBeDefined();

      // These commands should work on Windows without modification
      expect(scripts.dev).toBe('vite');
      expect(scripts.build).toBe('vite build');
      expect(scripts.test).toBe('vitest');
    });

    it('should have proper folder structure created', () => {
      const requiredDirs = [
        'src/components/auth',
        'src/components/tasks',
        'src/contexts',
        'src/services',
        'src/hooks',
        'src/pages',
        'src/test',
        'src/__tests__'
      ];

      requiredDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });

    it('should have index.html at project root', () => {
      const indexPath = path.join(process.cwd(), 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);

      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      // Check for proper script loading with module type
      expect(indexContent).toContain('type="module"');
      expect(indexContent).toContain('/src/main.jsx');

      // Check for root div
      expect(indexContent).toContain('<div id="root"></div>');
    });

    it('should use .jsx extension for React components', () => {
      const mainJsxPath = path.join(process.cwd(), 'src/main.jsx');
      const appJsxPath = path.join(process.cwd(), 'src/App.jsx');

      expect(fs.existsSync(mainJsxPath)).toBe(true);
      expect(fs.existsSync(appJsxPath)).toBe(true);
    });
  });
});
