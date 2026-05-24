import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  arc: jest.fn(),
  beginPath: jest.fn(),
  clearRect: jest.fn(),
  closePath: jest.fn(),
  fill: jest.fn(),
  fillText: jest.fn(),
  lineTo: jest.fn(),
  moveTo: jest.fn(),
  restore: jest.fn(),
  rotate: jest.fn(),
  save: jest.fn(),
  setTransform: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
}));

HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
  bottom: 420,
  height: 420,
  left: 0,
  right: 420,
  top: 0,
  width: 420,
  x: 0,
  y: 0,
  toJSON: jest.fn(),
}));
