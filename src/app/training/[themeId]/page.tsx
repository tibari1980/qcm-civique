import React, { Suspense } from 'react';
import TrainingSession from '../../../components/features/training/TrainingSession';
import Loading from '../../loading';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default function TrainingSessionPage() {
    return (
        <Suspense fallback={<Loading />}>
            <TrainingSession />
        </Suspense>
    );
}
