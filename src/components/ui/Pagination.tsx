import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        // Simple logic for showing a few pages around current
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            pages.push(i);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            pages.push('...');
        }
    }

    // De-duplicate dots
    const uniquePages = pages.filter((v, i, a) => v !== '...' || a[i - 1] !== '...');

    return (
        <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-gray-100">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg"
            >
                <ChevronLeft size={16} />
                <span className="sr-only">Précédent</span>
            </Button>

            <div className="flex items-center gap-1">
                {uniquePages.map((page, idx) => (
                    <React.Fragment key={idx}>
                        {page === '...' ? (
                            <span className="px-2 text-gray-400 text-xs">...</span>
                        ) : (
                            <Button
                                variant={currentPage === page ? "default" : "ghost"}
                                size="sm"
                                onClick={() => onPageChange(page as number)}
                                className={`h-8 w-8 p-0 rounded-lg text-xs font-bold ${currentPage === page
                                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {page}
                            </Button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg"
            >
                <ChevronRight size={16} />
                <span className="sr-only">Suivant</span>
            </Button>
        </div>
    );
}
