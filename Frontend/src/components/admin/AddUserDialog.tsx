import React, { useState } from 'react';
import {
    UserPlus, CheckCircle, Copy, ShieldCheck,
    UserIcon, Mail, Phone, GraduationCap, Clock, Stethoscope, History, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService, type CreateUserRequest, type CreateUserResponse } from '../../api/auth.service';
import { cn } from '../../lib/utils';

// UI Components
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogTrigger
} from '../ui/Dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from '../ui/AlertDialog';

// ============================================================================
// SCHEMA & TYPES
// ============================================================================
const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(['DOCTOR', 'RECEPTIONIST', 'LAB']),
    specialization: z.string().optional(),
    qualification: z.string().optional(),
    experienceYears: z.coerce.number().min(0).optional(),
    opdStartTime: z.string().optional(),
    opdEndTime: z.string().optional(),
    phone: z.string().optional(),
    shift: z.enum(['MORNING', 'EVENING', 'NIGHT']).optional(),
}).refine((data) => {
    if (data.role === 'DOCTOR') {
        return !!data.specialization && !!data.qualification && data.experienceYears !== undefined && !!data.opdStartTime && !!data.opdEndTime;
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
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({ onSuccess, trigger }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
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
            phone: '',
            shift: 'MORNING',
        },
    });

    const selectedRole = form.watch('role');

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
            if (form.formState.isDirty && !createdCredentials) {
                setIsDiscardConfirmOpen(true);
            } else {
                resetForm();
                setIsModalOpen(false);
            }
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

            const response: CreateUserResponse = await authService.createUser(request);
            setCreatedCredentials(response.Credentials);
            onSuccess?.();
        } catch (error: any) {
            console.error('Create User Error:', error);
            const serverErrors = error.response?.data?.errors;
            const serverMessage = error.response?.data?.message;
            let displayError = 'Failed to create user';
            if (Array.isArray(serverErrors) && serverErrors.length > 0) {
                displayError = `Validation Error: ${serverErrors.map((e: any) => e.message).join(', ')}`;
            } else if (serverMessage) {
                displayError = serverMessage;
            }
            alert(displayError);
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
                <DialogTrigger asChild>
                    {trigger || (
                        <Button className="h-11 px-6 bg-[#769FCD] hover:bg-[#608FBF] shadow-md">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] overflow-hidden p-0 rounded-2xl border-none shadow-2xl">
                    <DialogHeader className="relative p-8 bg-[#F7FBFC] overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <UserPlus size={120} />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-[#769FCD] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#769FCD]/20">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-[#091E42]">Add New User</DialogTitle>
                                <DialogDescription className="text-[#64748B] mt-1 text-sm">Create a new staff account with specific roles and professional details.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {createdCredentials ? (
                        <div className="p-12">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-md mx-auto text-center"
                            >
                                <div className="w-16 h-16 bg-[#F0FAF5] text-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1E293B]">Account Created Successfully</h3>
                                <p className="text-[#64748B] mt-2">The new staff member can now log in using the credentials below.</p>

                                <div className="mt-10 space-y-3 text-left">
                                    <div className="p-4 rounded-xl bg-[#D6E6F2] border border-[#B9D7EA] flex items-center justify-between group">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Email Address</p>
                                            <p className="font-mono text-[15px] font-semibold text-[#1E293B] truncate">{createdCredentials.email}</p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleCopy('email', createdCredentials.email)}
                                            className={cn("h-10 w-10 shrink-0 rounded-lg transition-colors", copiedField === 'email' ? 'text-[#10B981] bg-green-50' : 'text-[#64748B] hover:bg-white hover:shadow-sm')}
                                        >
                                            {copiedField === 'email' ? <CheckCircle size={18} /> : <Copy size={18} />}
                                        </Button>
                                    </div>

                                    <div className="p-4 rounded-xl bg-[#D6E6F2] border border-[#B9D7EA] flex items-center justify-between group">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Initial Password</p>
                                            <p className="font-mono text-[15px] font-bold text-[#769FCD] truncate">{createdCredentials.password}</p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleCopy('password', createdCredentials.password)}
                                            className={cn("h-10 w-10 shrink-0 rounded-lg transition-colors", copiedField === 'password' ? 'text-[#10B981] bg-green-50' : 'text-[#64748B] hover:bg-white hover:shadow-sm')}
                                        >
                                            {copiedField === 'password' ? <CheckCircle size={18} /> : <Copy size={18} />}
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-10 h-12 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white font-bold transition-all"
                                    onClick={() => {
                                        resetForm();
                                        setIsModalOpen(false);
                                    }}
                                >
                                    Continue to Staff List
                                </Button>
                            </motion.div>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[75vh]">
                                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 pb-2 border-b border-[#B9D7EA] mb-6">
                                            <div className="w-1 h-6 bg-[#769FCD] rounded-full" />
                                            <h4 className="text-sm font-bold text-[#475569] uppercase tracking-widest">Personal Identification</h4>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                        <ShieldCheck size={14} className="text-[#769FCD]" />
                                                        Staff Role
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 border-[#B9D7EA] rounded-xl focus:ring-4 focus:ring-[#769FCD]/10 focus:border-[#769FCD] transition-all outline-none">
                                                                <SelectValue placeholder="Select staff role" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl border-[#B9D7EA] shadow-xl">
                                                            <SelectItem value="DOCTOR" className="rounded-lg py-3">Doctor</SelectItem>
                                                            <SelectItem value="RECEPTIONIST" className="rounded-lg py-3">Receptionist</SelectItem>
                                                            <SelectItem value="LAB" className="rounded-lg py-3">Lab Staff</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                            <UserIcon size={14} className="text-[#769FCD]" />
                                                            Full Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter full name" className="h-12 border-[#B9D7EA] rounded-xl focus-visible:ring-4 focus-visible:ring-[#769FCD]/10 focus-visible:border-[#769FCD] transition-all outline-none" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                            <Mail size={14} className="text-[#769FCD]" />
                                                            Email Address
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="example@hospital.com" className="h-12 border-[#B9D7EA] rounded-xl focus-visible:ring-4 focus-visible:ring-[#769FCD]/10 focus-visible:border-[#769FCD] transition-all outline-none" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 pb-2 border-b border-[#B9D7EA] mb-6 mt-4">
                                            <div className="w-1 h-6 bg-blue-500 rounded-full" />
                                            <h4 className="text-sm font-bold text-[#475569] uppercase tracking-widest">Professional Assignment</h4>
                                        </div>

                                        <div className="rounded-2xl bg-[#D6E6F2]/50 p-6 border border-[#B9D7EA]">
                                            {selectedRole === 'DOCTOR' && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="specialization"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                                        <Stethoscope size={14} className="text-[#769FCD]" />
                                                                        Specialization
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="e.g. Cardiology" className="h-12 border-white bg-white rounded-xl shadow-sm focus-visible:ring-4 focus-visible:ring-[#769FCD]/10 focus-visible:border-[#769FCD] transition-all outline-none" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="qualification"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                                        <GraduationCap size={14} className="text-[#769FCD]" />
                                                                        Qualification
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="e.g. MBBS, MD" className="h-12 border-white bg-white rounded-xl shadow-sm focus-visible:ring-4 focus-visible:ring-[#769FCD]/10 focus-visible:border-[#769FCD] transition-all outline-none" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="experienceYears"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-3">
                                                                <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                                    <History size={14} className="text-[#769FCD]" />
                                                                    Years of Experience
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" min="0" className="h-12 border-white bg-white rounded-xl shadow-sm focus-visible:ring-4 focus-visible:ring-[#769FCD]/10 focus-visible:border-[#769FCD] transition-all outline-none" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="grid grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="opdStartTime"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                                        <Clock size={14} className="text-[#769FCD]" />
                                                                        Shift Start
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input type="time" className="h-12 border-white bg-white rounded-xl shadow-sm focus-visible:ring-4 focus-visible:ring-[#769FCD]/10 focus-visible:border-[#769FCD] transition-all outline-none" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="opdEndTime"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                                        <Clock size={14} className="text-[#769FCD]" />
                                                                        Shift End
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input type="time" className="h-12 border-white bg-white rounded-xl shadow-sm focus-visible:ring-4 focus-visible:ring-[#769FCD]/10 focus-visible:border-[#769FCD] transition-all outline-none" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {(selectedRole === 'RECEPTIONIST' || selectedRole === 'LAB') && (
                                                <div className="space-y-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="phone"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-3">
                                                                <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                                    <Phone size={14} className="text-[#769FCD]" />
                                                                    Phone Number
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="+91 XXXXX XXXXX" className="h-12 border-white bg-white rounded-xl shadow-sm focus-visible:ring-4 focus-visible:ring-[#769FCD]/10 focus-visible:border-[#769FCD] transition-all outline-none" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="shift"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-3">
                                                                <FormLabel className="flex items-center gap-2 text-[#475569] font-bold">
                                                                    <Clock size={14} className="text-[#769FCD]" />
                                                                    Working Shift
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 border-white bg-white rounded-xl shadow-sm focus:ring-4 focus:ring-[#769FCD]/10 focus:border-[#769FCD] transition-all outline-none">
                                                                            <SelectValue placeholder="Select work shift" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="rounded-xl border-[#B9D7EA] shadow-xl">
                                                                        <SelectItem value="MORNING" className="rounded-lg py-3">Morning Shift (8 AM - 4 PM)</SelectItem>
                                                                        <SelectItem value="EVENING" className="rounded-lg py-3">Evening Shift (4 PM - 12 AM)</SelectItem>
                                                                        <SelectItem value="NIGHT" className="rounded-lg py-3">Night Shift (12 AM - 8 AM)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-[#D6E6F2] border-t border-[#B9D7EA] flex items-center justify-end gap-4 mt-auto">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-12 px-6 rounded-xl text-[#64748B] hover:bg-slate-200/50"
                                        onClick={() => handleModalOpenChange(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-12 px-8 rounded-xl bg-[#769FCD] hover:bg-[#608FBF] text-white font-bold shadow-lg shadow-[#769FCD]/10 min-w-[140px]"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="animate-spin" size={18} />
                                                <span>Registering...</span>
                                            </div>
                                        ) : (
                                            <span>Register User</span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl p-8">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-[#1E293B]">Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#64748B]">
                            You have unsaved information. Are you sure you want to discard these changes and close the dialog?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-11 px-6 rounded-xl border-[#B9D7EA] hover:bg-[#D6E6F2] font-semibold" onClick={() => setIsDiscardConfirmOpen(false)}>
                            Keep Editing
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
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
