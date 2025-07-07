/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import { vi } from 'vitest';
(global as any).jest = vi;

// @ts-ignore
const { default: getCanvasWindow } = await import('jest-canvas-mock/lib/window');
const canvasWindow = getCanvasWindow(window);
global.CanvasRenderingContext2D = canvasWindow.CanvasRenderingContext2D;
