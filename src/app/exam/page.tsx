import React, { Suspense } from 'react';
import ExamSession from '../../components/features/exam/ExamSession';
import Loading from '../loading';

export default function ExamPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ExamSession />
        </Suspense>
    );
}
