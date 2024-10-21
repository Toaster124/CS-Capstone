// src/__tests__/VirtualKeyboard.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import VirtualKeyboard from '../components/VirtualKeyboard';

test('VirtualKeyboard renders and plays notes', () => {
    render(<VirtualKeyboard onPlayNote={onPlayNote} />);
    const noteButton = screen.getByText('C');
  fireEvent.click(noteButton);
  expect(onPlayNote).toHaveBeenCalledWith('C4', 0.8);
});
