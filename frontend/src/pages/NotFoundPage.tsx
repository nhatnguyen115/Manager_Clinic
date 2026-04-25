import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="text-center animate-scale-in">
                <h1 className="text-9xl font-black text-slate-800 tracking-tighter">404</h1>
                <div className="mt-[-2rem]">
                    <h2 className="text-3xl font-bold text-slate-50 mb-2">Page Not Found</h2>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Sorry, the page you are looking for doesn't exist or has been moved.
                    </p>
                    <Link to="/">
                        <Button size="lg">Return Home</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
