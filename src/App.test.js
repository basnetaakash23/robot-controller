import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('connects over WebSocket and sends a robot command', () => {
  const socket = {
    close: jest.fn(),
    readyState: 0,
    send: jest.fn(),
  };
  global.WebSocket = jest.fn(() => socket);
  global.WebSocket.OPEN = 1;

  render(<App />);

  expect(global.WebSocket).toHaveBeenCalledWith('ws://192.168.1.27:81');

  socket.readyState = global.WebSocket.OPEN;
  act(() => socket.onopen());
  expect(screen.getByText(/connected\. waiting for command/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /forward/i }));
  expect(socket.send).toHaveBeenCalledWith('forward');
});
