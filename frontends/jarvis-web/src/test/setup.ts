import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import '../test/mocks/framer-motion';

Element.prototype.scrollIntoView = vi.fn();
