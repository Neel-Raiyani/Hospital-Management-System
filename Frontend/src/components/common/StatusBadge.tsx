import React from 'react';

/**
 * Status types supported by the HMS Design System
 */
export type BadgeStatus =
    | 'WAITING'
    | 'COMPLETED'
    | 'LAB_TEST'
    | 'CANCELLED'
    | 'IN_PROGRESS'
    | 'PENDING';

/**
 * Badge size variants
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
    /** The status to display */
    status: BadgeStatus;
    /** Optional size variant (default: 'md') */
    size?: BadgeSize;
    /** Optional custom label (overrides default status text) */
    label?: string;
    /** Optional additional CSS classes */
    className?: string;
}

/**
 * Map status to CSS class name
 */
const statusClassMap: Record<BadgeStatus, string> = {
    WAITING: 'hms-badge-waiting',
    COMPLETED: 'hms-badge-completed',
    LAB_TEST: 'hms-badge-lab',
    CANCELLED: 'hms-badge-cancelled',
    IN_PROGRESS: 'hms-badge-progress',
    PENDING: 'hms-badge-pending',
};

/**
 * Map status to display text
 */
const statusLabelMap: Record<BadgeStatus, string> = {
    WAITING: 'Waiting',
    COMPLETED: 'Completed',
    LAB_TEST: 'Lab Test',
    CANCELLED: 'Cancelled',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
};

/**
 * Map size to CSS class
 */
const sizeClassMap: Record<BadgeSize, string> = {
    sm: 'hms-badge-sm',
    md: '',
    lg: 'hms-badge-lg',
};

/**
 * StatusBadge Component
 * 
 * High-contrast status badge for hospital management workflows.
 * Designed for quick visual scanning in clinical environments.
 * 
 * @example
 * ```tsx
 * <StatusBadge status="WAITING" />
 * <StatusBadge status="COMPLETED" size="lg" />
 * <StatusBadge status="LAB_TEST" label="Pending Lab" />
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    size = 'md',
    label,
    className = '',
}) => {
    const statusClass = statusClassMap[status] || 'hms-badge-pending';
    const sizeClass = sizeClassMap[size] || '';
    const displayLabel = label || statusLabelMap[status] || status;

    return (
        <span
            className={`hms-badge ${statusClass} ${sizeClass} ${className}`.trim()}
            role="status"
            aria-label={displayLabel}
        >
            {displayLabel}
        </span>
    );
};

export default StatusBadge;
