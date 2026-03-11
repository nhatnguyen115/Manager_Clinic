import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { Avatar } from '@components/ui/Avatar';
import { useAuth } from '@contexts/AuthContext';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import { Link } from 'react-router-dom';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { Logo } from '@components/ui/Logo';

export const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsLogoutModalOpen(false);
        logout();
        window.location.href = '/login';
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-700 bg-slate-950/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 text-slate-400 lg:hidden hover:bg-slate-800 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                    <Link to="/" className="flex items-center gap-4">
                        <Logo />
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationDropdown />

                    <div className="h-6 w-px bg-slate-700 mx-2" />

                    {/* User Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 pl-2 p-1.5 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700"
                        >
                            <div className="hidden text-right md:block">
                                <p className="text-sm font-medium text-slate-50">{user?.fullName || 'User'}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{user?.role?.toLowerCase() || ''}</p>
                            </div>
                            <div className="relative">
                                <Avatar fallback={user?.fullName?.charAt(0) || 'U'} size="sm" />
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                                <div className="p-3 border-b border-slate-800">
                                    <p className="text-xs text-slate-500 font-medium mb-1">Tài khoản</p>
                                    <p className="text-sm text-slate-100 truncate">{user?.email}</p>
                                </div>
                                <div className="p-1.5">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-slate-50 hover:bg-slate-800 rounded-lg transition-colors group"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <UserIcon size={16} className="text-slate-500 group-hover:text-primary-500 transition-colors" />
                                        Hồ sơ cá nhân
                                    </Link>
                                    <button
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-slate-50 hover:bg-slate-800 rounded-lg transition-colors group"
                                    >
                                        <Settings size={16} className="text-slate-500 group-hover:text-primary-500 transition-colors" />
                                        Cài đặt
                                    </button>
                                </div>
                                <div className="p-1.5 border-t border-slate-800">
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            setIsLogoutModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error-400 hover:text-error-300 hover:bg-error-900/10 rounded-lg transition-colors group"
                                    >
                                        <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title="Xác nhận đăng xuất"
                message="Bạn có chắc chắn muốn thoát khỏi hệ thống không?"
                confirmText="Đăng xuất"
                cancelText="Quay lại"
                variant="danger"
                icon={LogOut}
            />
        </header>
    );
};
