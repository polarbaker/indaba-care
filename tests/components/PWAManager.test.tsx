import React from 'react';
import { render, screen, act } from '@testing-library/react';
import PWAManager from '../../src/components/PWAManager';

// Mock global navigator
Object.defineProperty(window, 'navigator', {
  value: {
    ...window.navigator,
    serviceWorker: {
      register: jest.fn().mockResolvedValue({ installing: {}, active: {} }),
      ready: Promise.resolve({
        active: { state: 'activated' },
        update: jest.fn(),
      }),
      controller: { state: 'activated' },
    },
    onLine: true,
  },
  writable: true,
});

describe('PWAManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registers service worker on mount', async () => {
    await act(async () => {
      render(<PWAManager />);
    });

    expect(window.navigator.serviceWorker.register).toHaveBeenCalledWith(
      '/service-worker.js',
      { scope: '/' }
    );
  });

  test('handles offline status correctly', async () => {
    // Mock navigator.onLine property to simulate offline status
    const originalOnLine = window.navigator.onLine;
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true,
    });

    await act(async () => {
      render(<PWAManager />);
    });

    const offlineIndicator = screen.getByTestId('offline-indicator');
    expect(offlineIndicator).toBeInTheDocument();
    expect(offlineIndicator).toHaveTextContent('You are currently offline');

    // Restore the original value
    Object.defineProperty(window.navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
    });
  });

  test('handles online events', async () => {
    await act(async () => {
      render(<PWAManager />);
    });

    expect(screen.queryByTestId('offline-indicator')).not.toBeInTheDocument();

    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();

    // Simulate going back online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.queryByTestId('offline-indicator')).not.toBeInTheDocument();
  });

  test('handles service worker updates', async () => {
    // Mock a new service worker waiting to be activated
    Object.defineProperty(window.navigator.serviceWorker, 'ready', {
      value: Promise.resolve({
        active: { state: 'activated' },
        waiting: { postMessage: jest.fn() },
        update: jest.fn(),
      }),
      writable: true,
    });

    await act(async () => {
      render(<PWAManager />);
    });

    const updateButton = screen.getByTestId('update-button');
    expect(updateButton).toBeInTheDocument();

    // Simulate clicking the update button
    act(() => {
      updateButton.click();
    });

    // Verify postMessage was called to trigger the skipWaiting
    await act(async () => {
      const registration = await window.navigator.serviceWorker.ready;
      if (registration.waiting) {
        expect(registration.waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
      } else {
        // This should not happen in our test setup, but added for TypeScript safety
        throw new Error('Service worker waiting is null');
      }
    });
  });
});
