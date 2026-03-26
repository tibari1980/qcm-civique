import dynamic from 'next/dynamic';
import { Skeleton } from '../../components/ui/Skeleton';

const Dashboard = dynamic(() => import('../../components/features/dashboard/Dashboard'), {
    loading: () => <div className="container mx-auto px-4 py-8"><Skeleton height="350px" className="rounded-2xl" /></div>
});

export default function DashboardPage() {
    return <Dashboard />;
}
