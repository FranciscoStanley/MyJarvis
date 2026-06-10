import { vi } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
      const { animate: _a, transition: _t, initial: _i, ...rest } = props as Record<string, unknown>;
      return <div {...rest}>{children}</div>;
    },
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
      const { animate: _a, transition: _t, initial: _i, ...rest } = props as Record<string, unknown>;
      return <p {...rest}>{children}</p>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
