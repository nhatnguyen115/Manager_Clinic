import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@hooks/useToast';
import { AuthLayout } from '@components/layout/AuthLayout';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { UserRole } from '@/types/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            showToast.error('Please enter both email and password');
            return;
        }

        setIsSubmitting(true);
        try {
            const user = await login({ email, password });
            showToast.success('Login successful! Welcome back.');

            // Redirect based on role if no 'from' state
            if (!location.state?.from) {
                const dashboardMap: Record<UserRole, string> = {
                    'ADMIN': '/admin/dashboard',
                    'DOCTOR': '/doctor/dashboard',
                    'PATIENT': '/dashboard'
                };
                navigate(dashboardMap[user.role], { replace: true });
            } else {
                navigate(location.state.from.pathname, { replace: true });
            }
        } catch (error: any) {
            showToast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Log in to manage your appointments">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                />
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-100">Password</label>
                        <Link to="/forgot-password" className="text-sm font-medium text-primary-500 hover:text-primary-400">
                            Forgot?
                        </Link>
                    </div>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                    />
                </div>

                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    fullWidth
                    className="mt-6"
                >
                    Sign In
                </Button>

                <p className="text-center text-sm text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-400">
                        Sign up now
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
