export const runtime = 'edge';
import AdminDashboardClient from '@/components/features/admin/AdminDashboardClient';

/**
 * Admin Dashboard Page (Server Component)
 * Exporting 'edge' runtime here is essential for Cloudflare Pages 
 * to handle the /admin route via a Worker instead of looking for a static file.
 */
export default function AdminDashboardPage() {
    return <AdminDashboardClient />;
}
