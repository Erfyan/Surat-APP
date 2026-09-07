import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

globalThis.React = React;

afterEach(() => {
  cleanup();
  localStorage.clear();
});
