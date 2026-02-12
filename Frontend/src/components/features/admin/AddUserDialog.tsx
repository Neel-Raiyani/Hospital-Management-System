import React, { useState } from 'react';
import {
    Plus, UserPlus, CheckCircle, Copy, Check, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService, type CreateUserRequest, type CreateUserResponse, type StaffUser } from '../../../api/auth.service';
import { toast } from 'react-hot-toast';

// UI Components
import { Input } from '../../ui/Input';
import {
    Dialog, DialogContent,
    DialogHeader, DialogTitle, DialogTrigger
} from '../../ui/Dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../../ui/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from '../../ui/AlertDialog';

// ============================================================================
// SCHEMA & TYPES
// ============================================================================
const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(['DOCTOR', 'RECEPTIONIST', 'LAB', 'ADMIN']),
    specialization: z.string().optional(),
    qualification: z.string().optional(),
    experienceYears: z.coerce.number().min(0).optional(),
    opdStartTime: z.string().optional(),
    opdEndTime: z.string().optional(),
    checkupFee: z.coerce.number().min(0, "Checkup fee must be at least 0").optional(),
    phone: z.string().optional(),
    shift: z.enum(['MORNING', 'EVENING', 'NIGHT']).optional(),
}).refine((data) => {
    if (data.role === 'DOCTOR') {
        return !!data.specialization && !!data.qualification && data.experienceYears !== undefined && !!data.opdStartTime && !!data.opdEndTime && data.checkupFee !== undefined;
    }
    if (data.role === 'RECEPTIONIST' || data.role === 'LAB') {
        return !!data.phone && !!data.shift;
    }
    return true;
}, {
    message: "Please fill all required fields for the selected role",
    path: ["role"],
});

type FormValues = z.infer<typeof formSchema>;

interface AddUserDialogProps {
    onSuccess?: () => void;
    trigger?: React.ReactNode;
    userToEdit?: StaffUser;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
    onSuccess,
    trigger,
    userToEdit,
    open: externalOpen,
    onOpenChange: onExternalOpenChange
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isModalOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setIsModalOpen = onExternalOpenChange || setInternalOpen;

    const isEditMode = !!userToEdit;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
    const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
    const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            email: '',
            role: 'DOCTOR',
            specialization: '',
            qualification: '',
            experienceYears: 0,
            opdStartTime: '09:00',
            opdEndTime: '17:00',
            checkupFee: 0,
            phone: '',
            shift: 'MORNING',
        },
    });

    const selectedRole = form.watch('role');

    // Populate form for Edit Mode
    React.useEffect(() => {
        if (userToEdit && isModalOpen) {
            form.reset({
                name: userToEdit.name,
                email: userToEdit.email,
                role: (userToEdit.role as any) || 'DOCTOR',
                specialization: userToEdit.specialization || '',
                qualification: userToEdit.qualification || '',
                experienceYears: userToEdit.experienceYears || 0,
                opdStartTime: userToEdit.opdStartTime || '09:00',
                opdEndTime: userToEdit.opdEndTime || '17:00',
                checkupFee: userToEdit.checkupFee ?? 0,
                phone: userToEdit.phone || '',
                shift: (userToEdit as any).shift || 'MORNING',
            });
        }
    }, [userToEdit, isModalOpen, form]);

    const resetForm = () => {
        form.reset({
            name: '',
            email: '',
            role: 'DOCTOR',
            specialization: '',
            qualification: '',
            experienceYears: 0,
            opdStartTime: '09:00',
            opdEndTime: '17:00',
            phone: '',
            shift: 'MORNING',
        });
        setCreatedCredentials(null);
        setCopiedField(null);
    };

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
            setIsModalOpen(false);
        } else {
            setIsModalOpen(true);
        }
    };

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const request: CreateUserRequest = {
                name: values.name,
                email: values.email,
                role: values.role as any,
                doctorData: values.role === 'DOCTOR' ? {
                    specialization: values.specialization || '',
                    qualification: values.qualification || '',
                    experienceYears: Number(values.experienceYears) || 0,
                    opdStartTime: values.opdStartTime || '09:00',
                    opdEndTime: values.opdEndTime || '17:00',
                    checkupFee: Number(values.checkupFee) || 0,
                } : undefined,
                receptionistData: (values.role === 'RECEPTIONIST') ? {
                    phone: values.phone?.replace(/\D/g, '') || '',
                    shift: values.shift as any,
                } : undefined,
                labStaffData: (values.role === 'LAB') ? {
                    phone: values.phone?.replace(/\D/g, '') || '',
                    shift: values.shift as any,
                } : undefined,
            };

            if (isEditMode && userToEdit) {
                await authService.updateUser(userToEdit.id, request);
                toast.success('Staff profile updated successfully');
                setIsModalOpen(false);
                resetForm();
            } else {
                const response: CreateUserResponse = await authService.createUser(request);
                setCreatedCredentials(response.Credentials);
                toast.success('New staff member added successfully');
            }
            onSuccess?.();
        } catch (error: any) {
            console.error(isEditMode ? 'Update User Error:' : 'Create User Error:', error);
            const serverErrors = error.response?.data?.errors;
            const serverMessage = error.response?.data?.message;
            let displayError = isEditMode ? 'Failed to update user' : 'Failed to create user';
            if (Array.isArray(serverErrors) && serverErrors.length > 0) {
                displayError = `Validation Error: ${serverErrors.map((e: any) => e.message).join(', ')}`;
            } else if (serverMessage) {
                displayError = serverMessage;
            }
            toast.error(displayError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = async (field: 'email' | 'password', value: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <>
            <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                {trigger && (
                    <DialogTrigger asChild>
                        {trigger}
                    </DialogTrigger>
                )}
                <DialogContent className="sm:max-w-[650px] w-full max-h-[90vh] rounded-lg p-0 border-none shadow-2xl bg-transparent [&>button]:hidden flex flex-col">
                    <div className="bg-white rounded-lg overflow-hidden flex flex-col h-full font-['Inter',sans-serif]">
                        {/* Fixed Header */}
                        <DialogHeader className="p-6 border-b border-gray-100/80 bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                                    <UserPlus className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                                        {isEditMode ? 'Edit Staff Profile' : 'Add New Staff'}
                                    </DialogTitle>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                                        {isEditMode ? `Updating details for ${userToEdit?.name}` : 'Create a new hospital staff account'}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Scrollable Content area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 bg-gray-50/30">
                            <div className="space-y-6">
                                {createdCredentials ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                                            <Check size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-8">Access account created. Please save credentials safely.</p>

                                        <div className="bg-white rounded-lg p-5 border border-gray-200 text-left space-y-4 max-w-sm mx-auto shadow-sm">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Login Email</p>
                                                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 group">
                                                    <code className="text-sm font-bold text-indigo-700">{createdCredentials?.email}</code>
                                                    <button
                                                        onClick={() => handleCopy('email', createdCredentials?.email || '')}
                                                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-400 hover:text-indigo-600 transition-all"
                                                    >
                                                        {copiedField === 'email' ? <CheckCircle size={16} className="text-emerald-600" /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Initial Password</p>
                                                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                                    <code className="text-sm font-bold text-emerald-700">{createdCredentials?.password}</code>
                                                    <button
                                                        onClick={() => handleCopy('password', createdCredentials?.password || '')}
                                                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-400 hover:text-emerald-600 transition-all"
                                                    >
                                                        {copiedField === 'password' ? <CheckCircle size={16} className="text-emerald-600" /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                resetForm();
                                                setIsModalOpen(false);
                                            }}
                                            className="mt-10 w-full sm:w-48 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest h-11 rounded-lg shadow-lg active:scale-95 transition-all"
                                        >
                                            Done & Close
                                        </button>
                                    </motion.div>
                                ) : (
                                    <Form {...form}>
                                        <form id="add-staff-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                            {/* Basic Information Section */}
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-2 mb-1 px-1">
                                                    <div className="w-1 h-3.5 bg-indigo-500 rounded-full" />
                                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Basic Information</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <FormField
                                                        control={form.control}
                                                        name="name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider ml-1">Full Name</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative group/input">
                                                                        <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/input:text-indigo-500 transition-colors" />
                                                                        <Input
                                                                            placeholder="John Doe"
                                                                            {...field}
                                                                            className="w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white hover:bg-white hover:border-gray-300 transition-all text-sm font-medium h-11 shadow-sm"
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-[10px] font-bold" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider ml-1">Email Address</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative group/input">
                                                                        <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-45 group-focus-within/input:text-indigo-500 transition-colors" />
                                                                        <Input
                                                                            placeholder="john@hospital.com"
                                                                            {...field}
                                                                            className="w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white hover:bg-white hover:border-gray-300 transition-all text-sm font-medium h-11 shadow-sm"
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-[10px] font-bold" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    {/* Hide role selector for ADMIN users in edit mode */}
                                                    {!(isEditMode && userToEdit?.role === 'ADMIN') && (
                                                        <FormField
                                                            control={form.control}
                                                            name="role"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider ml-1">User Role</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger
                                                                                disabled={isEditMode}
                                                                                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white hover:bg-white hover:border-gray-300 transition-all text-sm font-medium h-11 shadow-sm disabled:opacity-80"
                                                                            >
                                                                                <SelectValue placeholder="Select a role" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="rounded-lg border-gray-200 shadow-2xl overflow-hidden py-1">
                                                                            <SelectItem value="DOCTOR" className="font-semibold py-3 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer text-sm">Doctor</SelectItem>
                                                                            <SelectItem value="RECEPTIONIST" className="font-semibold py-3 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer text-sm">Receptionist</SelectItem>
                                                                            <SelectItem value="LAB" className="font-semibold py-3 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer text-sm">Lab Staff</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-[10px] font-bold" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                    {(selectedRole === 'LAB' || selectedRole === 'RECEPTIONIST') && (
                                                        <FormField
                                                            control={form.control}
                                                            name="phone"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider ml-1">Phone Number</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="+91 XXXXX XXXXX"
                                                                            {...field}
                                                                            className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white hover:bg-white hover:border-gray-300 transition-all text-sm font-medium h-11 shadow-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-[10px] font-bold" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Role Specific Details */}
                                            {selectedRole === 'DOCTOR' && (
                                                <div className="space-y-5 pt-2">
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        <div className="w-1 h-3.5 bg-indigo-400 rounded-full" />
                                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Medical Credentials</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <FormField
                                                            control={form.control}
                                                            name="specialization"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider ml-1">Specialization</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="e.g. Cardiology"
                                                                            {...field}
                                                                            className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white hover:bg-white hover:border-gray-300 transition-all text-sm font-medium h-11 shadow-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-[10px] font-bold" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="qualification"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider ml-1">Qualification</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="e.g. MBBS, MD"
                                                                            {...field}
                                                                            className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white hover:bg-white hover:border-gray-300 transition-all text-sm font-medium h-11 shadow-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-[10px] font-bold" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <FormField
                                                            control={form.control}
                                                            name="experienceYears"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Years of Experience</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            {...field}
                                                                            className="w-full px-3.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 h-11 text-sm font-semibold transition-all shadow-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-[10px] font-bold" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="checkupFee"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Checkup Fee (₹)</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            {...field}
                                                                            className="w-full px-3.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 h-11 text-sm font-semibold transition-all font-mono shadow-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-[10px] font-bold" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-5">
                                                        <FormField
                                                            control={form.control}
                                                            name="opdStartTime"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">OPD Start</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="time"
                                                                            {...field}
                                                                            className="w-full px-3.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 h-11 text-sm font-semibold transition-all shadow-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-[10px] font-bold" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="opdEndTime"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">OPD End</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="time"
                                                                            {...field}
                                                                            className="w-full px-3.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 h-11 text-sm font-semibold transition-all shadow-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-[10px] font-bold" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {(selectedRole === 'RECEPTIONIST' || selectedRole === 'LAB') && (
                                                <div className="space-y-5 pt-2">
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        <div className="w-1 h-3.5 bg-indigo-400 rounded-full" />
                                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Assignment Details</h4>
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name="shift"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Working Shift</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-[5px] focus:ring-indigo-500/10 focus:border-indigo-600 h-11 text-sm font-semibold shadow-sm">
                                                                            <SelectValue placeholder="Select shift" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="rounded-lg border-gray-200 shadow-2xl overflow-hidden">
                                                                        <SelectItem value="MORNING" className="font-bold py-3">Morning Shift</SelectItem>
                                                                        <SelectItem value="EVENING" className="font-bold py-3">Evening Shift</SelectItem>
                                                                        <SelectItem value="NIGHT" className="font-bold py-3">Night Shift</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-[10px] font-bold" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </form>
                                    </Form>
                                )}
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        {!createdCredentials && (
                            <div className="p-6 border-t border-gray-100/80 bg-white shrink-0">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleModalOpenChange(false)}
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-black hover:bg-gray-50 transition-all disabled:opacity-50 tracking-widest uppercase active:scale-[0.98] shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        form="add-staff-form"
                                        disabled={isSubmitting}
                                        className="flex-[1.5] px-4 py-3 bg-indigo-600 text-white rounded-lg text-xs font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/20 tracking-widest uppercase active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                {isEditMode ? <Check size={16} /> : <UserPlus size={16} />}
                                                {isEditMode ? 'Save Changes' : 'Register Staff Member'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
                <AlertDialogContent className="rounded-lg border-none shadow-2xl p-8">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-[#1E293B]">Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#64748B]">
                            You have unsaved information. Are you sure you want to discard these changes and close the dialog?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-11 px-6 rounded-lg border-[#B9D7EA] hover:bg-[#D6E6F2] font-semibold" onClick={() => setIsDiscardConfirmOpen(false)}>
                            Keep Editing
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-11 px-6 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold"
                            onClick={() => {
                                setIsDiscardConfirmOpen(false);
                                resetForm();
                                setIsModalOpen(false);
                            }}
                        >
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
