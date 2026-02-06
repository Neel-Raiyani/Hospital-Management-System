/**
 * Utility to format doctor names with a "Dr." prefix if not already present.
 * @param name The name of the doctor
 * @returns The formatted name with "Dr." prefix
 */
export const formatDoctorName = (name: string | undefined | null): string => {
    if (!name) return 'Unknown Doctor';
    if (name.toLowerCase().startsWith('dr.')) {
        return name;
    }
    return `Dr. ${name}`;
};
