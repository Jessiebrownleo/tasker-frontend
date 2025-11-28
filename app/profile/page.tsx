'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api/auth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.fullName || '',
            password: '',
        },
    });

    const onSubmit = async (data: ProfileForm) => {
        setIsLoading(true);
        try {
            const updateData: any = { fullName: data.fullName };
            if (data.password) {
                updateData.password = data.password;
            }

            const updatedUser = await authApi.updateProfile(updateData);
            setUser(updatedUser);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                                {user?.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </label>
                                <input
                                    {...register('fullName')}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.fullName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    New Password (optional)
                                </label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    placeholder="Leave blank to keep current"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
