/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

import '@testing-library/jest-dom'

// Mock global fetch
global.fetch = jest.fn()

// Mock window.URL.createObjectURL
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mocked-url'),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
})

// Mock document.createElement
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: jest.fn(),
    }
  }
  return document.createElement(tagName)
})

// Mock document.body methods
document.body.appendChild = jest.fn()
document.body.removeChild = jest.fn()
