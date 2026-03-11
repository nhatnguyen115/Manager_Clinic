import { useRef, useEffect, useState } from 'react';
import { Bell, Check, Calendar, CreditCard, Info, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/utils/dateUtils';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationType } from '@/types';
import { Link } from 'react-router-dom';

export const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'APPOINTMENT': return <Calendar className="text-primary-500" size={18} />;
            case 'PAYMENT': return <CreditCard className="text-emerald-500" size={18} />;
            case 'REMINDER': return <Clock className="text-amber-500" size={18} />;
            case 'SYSTEM': return <Info className="text-slate-400" size={18} />;
            default: return <Bell size={18} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white border-2 border-slate-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="flex items-center justify-between p-4 border-b border-slate-800">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-50">Thông báo</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Bạn có {unreadCount} thông báo mới</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-medium text-primary-500 hover:text-primary-400 flex items-center gap-1"
                            >
                                <Check size={12} /> Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={32} className="mx-auto text-slate-700 mb-3" />
                                <p className="text-sm text-slate-500">Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`group relative p-4 hover:bg-slate-800/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary-900/5' : ''}`}
                                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 mt-1 h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-600 transition-colors">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-medium leading-none ${!notification.isRead ? 'text-slate-50' : 'text-slate-300'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <div className="h-2 w-2 rounded-full bg-primary-500 mt-1" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock size={10} className="text-slate-600" />
                                                    <span className="text-[10px] text-slate-500">
                                                        {formatRelativeTime(notification.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-slate-800 bg-slate-900/50">
                        <Link
                            to="/notifications"
                            className="block w-full text-center py-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-slate-300 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Xem tất cả thông báo
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
