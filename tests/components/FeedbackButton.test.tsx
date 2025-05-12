import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import FeedbackButton from '../../src/components/FeedbackButton';

// Mock PouchDB implementation
jest.mock('pouchdb', () => {
  return jest.fn().mockImplementation(() => {
    return {
      put: jest.fn().mockResolvedValue({ ok: true, id: 'feedback-123' }),
      sync: jest.fn().mockResolvedValue({ ok: true }),
    };
  });
});

describe('FeedbackButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });
  });

  test('renders correctly', () => {
    render(
      <ChakraProvider>
        <FeedbackButton />
      </ChakraProvider>
    );
    
    expect(screen.getByRole('button', { name: /feedback/i })).toBeInTheDocument();
  });

  test('opens modal when clicked', () => {
    render(
      <ChakraProvider>
        <FeedbackButton />
      </ChakraProvider>
    );
    
    // Click the feedback button
    fireEvent.click(screen.getByRole('button', { name: /feedback/i }));
    
    // Verify modal is open
    expect(screen.getByText(/we value your feedback/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/feedback type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('submits feedback correctly', async () => {
    render(
      <ChakraProvider>
        <FeedbackButton />
      </ChakraProvider>
    );
    
    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /feedback/i }));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/feedback type/i), {
      target: { value: 'suggestion' },
    });
    
    fireEvent.change(screen.getByLabelText(/your message/i), {
      target: { value: 'This is a test feedback message' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify PouchDB was called with the correct data
    await waitFor(() => {
      const pouchDBInstance = require('pouchdb')();
      expect(pouchDBInstance.put).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: expect.any(String),
          type: 'feedback',
          feedbackType: 'suggestion',
          message: 'This is a test feedback message',
          timestamp: expect.any(Number),
          userId: expect.any(String),
        })
      );
    });
    
    // Verify success message is shown
    expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
  });

  test('validates form before submission', async () => {
    render(
      <ChakraProvider>
        <FeedbackButton />
      </ChakraProvider>
    );
    
    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /feedback/i }));
    
    // Submit without filling in required fields
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify validation errors
    expect(screen.getByText(/please select a feedback type/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter your message/i)).toBeInTheDocument();
    
    // PouchDB put should not have been called
    await waitFor(() => {
      const pouchDBInstance = require('pouchdb')();
      expect(pouchDBInstance.put).not.toHaveBeenCalled();
    });
  });

  test('handles offline mode correctly', async () => {
    // Mock window.navigator.onLine to simulate offline mode
    const originalOnLine = window.navigator.onLine;
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true,
    });
    
    render(
      <ChakraProvider>
        <FeedbackButton />
      </ChakraProvider>
    );
    
    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /feedback/i }));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/feedback type/i), {
      target: { value: 'bug' },
    });
    
    fireEvent.change(screen.getByLabelText(/your message/i), {
      target: { value: 'Testing offline feedback' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify PouchDB was called but sync was not attempted
    await waitFor(() => {
      const pouchDBInstance = require('pouchdb')();
      expect(pouchDBInstance.put).toHaveBeenCalled();
      expect(pouchDBInstance.sync).not.toHaveBeenCalled();
    });
    
    // Verify success message mentions offline mode
    expect(screen.getByText(/feedback saved locally/i)).toBeInTheDocument();
    
    // Restore original onLine value
    Object.defineProperty(window.navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
    });
  });
});
