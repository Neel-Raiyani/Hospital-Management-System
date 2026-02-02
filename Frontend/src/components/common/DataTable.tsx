import React from 'react';

/**
 * Column definition for DataTable
 */
export interface TableColumn<T> {
    /** Unique key for the column */
    key: string;
    /** Display header text */
    header: string;
    /** Function to render cell content */
    render?: (row: T, index: number) => React.ReactNode;
    /** Text alignment for the column */
    align?: 'left' | 'center' | 'right';
    /** Column width (CSS value) */
    width?: string;
    /** Whether column is sortable */
    sortable?: boolean;
}

interface DataTableProps<T> {
    /** Column definitions */
    columns: TableColumn<T>[];
    /** Data array to display */
    data: T[];
    /** Unique key accessor for rows */
    rowKey: keyof T | ((row: T, index: number) => string | number);
    /** Enable striped rows (default: true) */
    striped?: boolean;
    /** Enable compact mode (default: false) */
    compact?: boolean;
    /** Enable sticky header (default: false) */
    stickyHeader?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Empty state message */
    emptyMessage?: string;
    /** Additional CSS class for container */
    className?: string;
    /** Row click handler */
    onRowClick?: (row: T, index: number) => void;
}

/**
 * DataTable Component
 * 
 * Hospital-grade data table with compact, dense styling optimized for
 * medical staff workflows. Features high contrast, optional striping,
 * and sticky headers for long lists.
 * 
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'id', header: 'Patient ID' },
 *     { key: 'name', header: 'Name' },
 *     { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
 *   ]}
 *   data={patients}
 *   rowKey="id"
 *   compact
 *   stickyHeader
 * />
 * ```
 */
export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    rowKey,
    striped = true,
    compact = false,
    stickyHeader = false,
    loading = false,
    emptyMessage = 'No data available',
    className = '',
    onRowClick,
}: DataTableProps<T>) {
    const getRowKey = (row: T, index: number): string | number => {
        if (typeof rowKey === 'function') {
            return rowKey(row, index);
        }
        return row[rowKey] as string | number;
    };

    const getAlignClass = (align?: 'left' | 'center' | 'right'): string => {
        switch (align) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return '';
        }
    };

    const tableClasses = [
        'hms-table',
        striped && 'hms-table-striped',
        compact && 'hms-table-compact',
        stickyHeader && 'hms-table-sticky',
    ].filter(Boolean).join(' ');

    if (loading) {
        return (
            <div className={`hms-table-container ${className}`}>
                <div className="hms-empty-state">
                    <div className="hms-spinner" style={{ width: 24, height: 24 }} />
                    <p className="hms-empty-state-text" style={{ marginTop: 12 }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={`hms-table-container ${className}`}>
                <div className="hms-empty-state">
                    <p className="hms-empty-state-text">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`hms-table-container ${className}`}>
            <table className={tableClasses}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`${getAlignClass(col.align)} ${col.sortable ? 'sortable' : ''}`}
                                style={col.width ? { width: col.width } : undefined}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={getRowKey(row, rowIndex)}
                            onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                            style={onRowClick ? { cursor: 'pointer' } : undefined}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className={getAlignClass(col.align)}>
                                    {col.render
                                        ? col.render(row, rowIndex)
                                        : (row[col.key] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
