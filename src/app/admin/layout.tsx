import React from 'react';
import AdminClientLayout from '../../components/layout/AdminClientLayout';

/**
 * AdminLayout (Server Component)
 * Le Worker Cloudflare gère déjà le routage via _worker.js
 * Pas besoin de runtime='edge' — les pages admin sont des Client Components
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminClientLayout>{children}</AdminClientLayout>;
}
