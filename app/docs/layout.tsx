import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/lib/layout.shared';
import { getNavigationTree } from '@/lib/navigation';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={getNavigationTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
