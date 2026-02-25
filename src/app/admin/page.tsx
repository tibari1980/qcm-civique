import AdminDashboardClient from '@/components/features/admin/AdminDashboardClient';

/**
 * Admin Dashboard Page
 * Rendu statique — le JavaScript côté client gère l'authentification et les données.
 * Le Worker Cloudflare sert la page, pas besoin de runtime='edge'.
 */
export default function AdminDashboardPage() {
    return <AdminDashboardClient />;
}
