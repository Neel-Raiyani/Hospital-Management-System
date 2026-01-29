import axiosInstance from './axios';
import type { LabTest, LabReport } from '../types/lab';

export const labService = {
    /**
     * Get all pending lab tests
     */
    getPendingTests: async (): Promise<LabTest[]> => {
        const response = await axiosInstance.get('/lab/labtests/pending', { baseURL: 'http://localhost:9018' });
        return response.data;
    },

    /**
     * Upload lab reports for a specific test
     */
    uploadReport: async (
        labTestId: string,
        files: File[],
        onProgress?: (progress: number) => void
    ): Promise<any> => {
        const formData = new FormData();
        formData.append('labTestId', labTestId);
        files.forEach((file) => {
            formData.append('report', file);
        });

        const response = await axiosInstance.post('/lab/create-report', formData, {
            baseURL: 'http://localhost:9018',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        return response.data;
    },

    /**
     * Get lab reports by patient ID
     */
    getPatientReports: async (patientId: string): Promise<LabReport[]> => {
        const response = await axiosInstance.get(`/lab/report/${patientId}`, { baseURL: 'http://localhost:9018' });
        return response.data;
    },

    /**
     * Download a lab report
     */
    downloadReport: async (reportId: string): Promise<void> => {
        const response = await axiosInstance.get(`/lab/download/${reportId}`, {
            baseURL: 'http://localhost:9018',
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report-${reportId}.pdf`); // Backend might return zip or pdf
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
