export const runtime = 'edge';

import React from 'react';
import AdminClientLayout from '@/components/layout/AdminClientLayout';

/**
 * AdminLayout (Server Component)
 * Forcer l'export runtime='edge' ici garantit que toute l'arborescence /admin
 * est traitée comme une route dynamique Edge par Cloudflare Pages.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminClientLayout>{children}</AdminClientLayout>;
}
