import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chatbot from './Chatbot';
import { AuthProvider } from '../../context/AuthContext';

// Mock the AuthContext so we can provide a dummy user
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', role: 'donor' },
  }),
}));

describe('Chatbot Component', () => {
  beforeEach(() => {
    // Mock the fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: 'This is a mocked response from Gemini.' }]
              }
            }
          ]
        }),
      })
    );
    
    // Set a dummy API key for testing
    process.env.REACT_APP_GEMINI_API_KEY = 'test-api-key';
    
    // Mock scrollIntoView to avoid errors in JSDOM
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the chatbot button initially', () => {
    render(<Chatbot />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('opens the chat window when the button is clicked', () => {
    render(<Chatbot />);
    
    // The chat window title should not be visible or shouldn't be interacted with initially (due to CSS), 
    // but in JSDOM it might be in the document. We check if we can find the AI Assistant text.
    const title = screen.getByText('AI Assistant');
    expect(title).toBeInTheDocument();
    
    // Click to open
    const buttons = screen.getAllByRole('button');
    // First button is the floating one
    fireEvent.click(buttons[0]);
    
    // The input should be visible and usable
    const input = screen.getByPlaceholderText('Type your question...');
    expect(input).toBeInTheDocument();
  });

  test('sends a message and displays the response', async () => {
    render(<Chatbot />);
    
    // Open chat
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    
    // Type a message
    const input = screen.getByPlaceholderText('Type your question...');
    fireEvent.change(input, { target: { value: 'Hello there' } });
    
    // Submit the form
    // The second button is the close button, the third is the submit button
    const submitButton = screen.getAllByRole('button')[2];
    fireEvent.click(submitButton);
    
    // Verify user message appears
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    
    // Wait for the mock response to appear
    await waitFor(() => {
      expect(screen.getByText('This is a mocked response from Gemini.')).toBeInTheDocument();
    });
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-api-key'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });
});
