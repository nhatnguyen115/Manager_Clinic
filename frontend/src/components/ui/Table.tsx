import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface Column<T> {
    header: ReactNode;
    accessor: keyof T | ((item: T) => ReactNode);
    className?: string;
}

export interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
}

const Table = <T,>({
    columns,
    data,
    keyExtractor,
    isLoading,
    emptyMessage = 'No data available',
    className,
}: TableProps<T>) => {
    return (
        <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-700 bg-slate-900', className)}>
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="border-b border-slate-700 bg-slate-950/50">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={cn('px-6 py-4 font-semibold text-slate-50', column.className)}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                                    <span>Loading data...</span>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className="border-b border-slate-700 last:border-0 hover:bg-slate-800/50 transition-colors"
                            >
                                {columns.map((column, index) => (
                                    <td key={index} className={cn('px-6 py-4 text-slate-100', column.className)}>
                                        {typeof column.accessor === 'function'
                                            ? column.accessor(item)
                                            : (item[column.accessor] as ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export { Table };
