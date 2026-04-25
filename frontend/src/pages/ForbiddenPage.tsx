import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { ShieldAlert } from 'lucide-react';

const ForbiddenPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="text-center animate-scale-in">
                <div className="mx-auto h-20 w-20 rounded-full bg-error/10 flex items-center justify-center mb-6">
                    <ShieldAlert className="text-error" size={48} />
                </div>
                <h1 className="text-4xl font-bold text-slate-50 mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    You don't have permission to access this page. Please contact your system administrator if you believe this is an error.
                </p>
                <Link to="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
};

export default ForbiddenPage;
