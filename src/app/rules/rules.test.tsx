import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import RulesPage from './page';
import { MantineProvider } from '@mantine/core';

// Mock matchMedia since jsdom doesn't support it by default
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('Rules Page Component', () => {
  const renderComponent = () => {
    return render(
      <MantineProvider>
        <RulesPage />
      </MantineProvider>
    );
  };

  it('renders the header title and description manual correctly', () => {
    renderComponent();

    // Verify Title and Subtitle exist
    expect(screen.getByText('SCORING MANUAL')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How to Score Points' })).toBeInTheDocument();
    expect(screen.getByText(/Earn up to 1,200 points across the group/i)).toBeInTheDocument();
  });

  it('renders the scoring tabs and defaults to the Group Stage panel', () => {
    renderComponent();

    // Check tabs list
    expect(screen.getByRole('tab', { name: 'Group Stage' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Knockout Stage' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Awards & Honors' })).toBeInTheDocument();

    // Group stage specific text should be visible initially
    expect(screen.getByText(/For all 12 groups in the tournament/i)).toBeInTheDocument();
  });

  it('allows clicking tabs to navigate rules sections', () => {
    renderComponent();

    const knockoutTab = screen.getByRole('tab', { name: 'Knockout Stage' });
    fireEvent.click(knockoutTab);

    // Knockout stage specific text or headers should be rendered
    expect(screen.getByText(/Predict the teams advancing/i)).toBeInTheDocument();
  });
});
