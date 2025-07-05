import { vi } from 'vitest';
import { createTestingPinia, TestingOptions } from '@pinia/testing';

export const createVitestPinia = (options?: TestingOptions) => createTestingPinia({ ...options, createSpy: vi.fn });
