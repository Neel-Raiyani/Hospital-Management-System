import React, { useState } from 'react';
import { Search, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Loader } from '../ui/Loader';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { patientService } from '../../api/patient.service';
import type { Patient } from '../../types/patient';

interface PatientSearchProps {
    onPatientSelect: (patient: Patient) => void;
    onCreateNew?: () => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onPatientSelect, onCreateNew }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'phone' | 'id'>('phone');
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('Please enter a search term');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearched(true);

            const response = await patientService.listPatients(1, 100);

            let filtered: Patient[] = [];
            if (searchType === 'phone') {
                filtered = response.data.filter(p => p.phone.includes(searchQuery));
            } else {
                filtered = response.data.filter(p => p.patientId.toString() === searchQuery);
            }

            setSearchResults(filtered);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to search patients');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Header */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
                        <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Search Existing Patient</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Find patient by phone number or ID to prevent duplicates</p>
                    </div>
                </div>

                {/* Search Type Toggle */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => {
                            setSearchType('phone');
                            setSearchQuery('');
                            setSearchResults([]);
                            setSearched(false);
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${searchType === 'phone'
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                    </button>
                    <button
                        onClick={() => {
                            setSearchType('id');
                            setSearchQuery('');
                            setSearchResults([]);
                            setSearched(false);
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${searchType === 'id'
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <User className="w-4 h-4 inline mr-2" />
                        Patient ID
                    </button>
                </div>

                {/* Search Input */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            type={searchType === 'phone' ? 'tel' : 'text'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(searchType === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={searchType === 'phone' ? 'Enter 10-digit phone number' : 'Enter patient ID'}
                            className="h-11 border-gray-300 placeholder:text-gray-400"
                            maxLength={searchType === 'phone' ? 10 : undefined}
                        />
                    </div>
                    <Button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-5 h-11 rounded-md font-medium bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        {loading ? (
                            <Loader size="sm" />
                        ) : (
                            <>
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
            )}

            {/* Search Results */}
            {searched && !loading && (
                <div className="space-y-4">
                    {searchResults.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                            <h4 className="text-base font-semibold text-gray-900 mb-2">No Patient Found</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                No existing patient matches your search. You can register a new patient.
                            </p>
                            {onCreateNew && (
                                <Button
                                    onClick={onCreateNew}
                                    className="px-5 h-10 rounded-md font-medium bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    Register New Patient
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
                                <p className="text-sm font-medium text-teal-900">
                                    Found {searchResults.length} patient{searchResults.length > 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {searchResults.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer group"
                                        onClick={() => onPatientSelect(patient)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-semibold text-lg group-hover:bg-teal-600 group-hover:text-white transition-all">
                                                    {patient.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {patient.phone}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            ID: {patient.patientId}
                                                        </span>
                                                        <span>
                                                            Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="px-4 h-9 rounded-md font-medium border-gray-300 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all"
                                            >
                                                Select
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientSearch;
