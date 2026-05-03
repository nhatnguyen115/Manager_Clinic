import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@hooks/useToast';
import { authService } from '@services/authService';
import { AuthLayout } from '@components/layout/AuthLayout';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showToast.error('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.register({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: 'PATIENT' // Default to patient for public register
            });
            showToast.success('Account created successfully! Please log in.');
            navigate('/login');
        } catch (error: any) {
            showToast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout title="Create Account" subtitle="Join ClinicPro today">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="fullName"
                    label="Full Name"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <Input
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <Input
                    id="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <Input
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    fullWidth
                    className="mt-6"
                >
                    Create Account
                </Button>

                <p className="text-center text-sm text-slate-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-400">
                        Log in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;
