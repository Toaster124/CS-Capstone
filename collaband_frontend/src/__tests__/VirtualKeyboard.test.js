/* eslint-env jest */
// src/__tests__/VirtualKeyboard.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VirtualKeyboard from '../components/VirtualKeyboard';

test('VirtualKeyboard renders and plays notes', () => {
  const onPlayNote = jest.fn(); // Define onPlayNote

  render(<VirtualKeyboard onPlayNote={onPlayNote} />);
  const noteButton = screen.getByText('C');
  fireEvent.click(noteButton);
  expect(onPlayNote).toHaveBeenCalledWith('C4', 0.8);
});
