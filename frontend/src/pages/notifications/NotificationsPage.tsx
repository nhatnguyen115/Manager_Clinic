import { Bell, Check, Clock, Calendar, CreditCard, Info } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/utils/dateUtils';
import { NotificationType } from '@/types';
import { Card, CardContent } from '@components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const getIcon = (type: NotificationType) => {
    switch (type) {
        case 'APPOINTMENT': return <Calendar className="text-primary-500" size={20} />;
        case 'PAYMENT': return <CreditCard className="text-emerald-500" size={20} />;
        case 'REMINDER': return <Clock className="text-amber-500" size={20} />;
        case 'SYSTEM': return <Info className="text-slate-400" size={20} />;
        default: return <Bell size={20} />;
    }
};

const NotificationsPage = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleNotificationClick = (notification: any) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        if (notification.relatedEntityType === 'APPOINTMENT' && notification.relatedEntityId) {
            if (user?.role === 'PATIENT') {
                navigate(`/appointments/${notification.relatedEntityId}`);
            } else if (user?.role === 'DOCTOR') {
                navigate(`/doctor/appointments`);
            } else if (user?.role === 'ADMIN') {
                navigate(`/admin/appointments`);
            }
        } else if (notification.relatedEntityType === 'PAYMENT' && notification.relatedEntityId) {
            if (user?.role === 'PATIENT') {
                navigate(`/payment/history`);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50">Thông báo của bạn</h1>
                    <p className="text-slate-400 mt-1">
                        Bạn có {unreadCount} thông báo chưa đọc
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl transition-colors font-medium text-sm"
                    >
                        <Check size={16} className="text-primary-500" />
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card className="border-dashed border-2 bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-300">Chưa có thông báo nào</h3>
                        <p className="text-slate-500 mt-1">Tất cả thông báo của bạn sẽ xuất hiện ở đây</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Card 
                            key={notification.id} 
                            className={`transition-colors cursor-pointer hover:border-slate-600 ${!notification.isRead ? 'border-primary-500/50 bg-primary-900/10' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <CardContent className="p-4 sm:p-6 flex gap-4 sm:gap-6">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-2">
                                        <h3 className={`text-base font-semibold ${!notification.isRead ? 'text-slate-50' : 'text-slate-300'}`}>
                                            {notification.title}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                                            <Clock size={12} />
                                            {formatRelativeTime(notification.createdAt)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="flex-shrink-0 flex items-center">
                                        <div className="h-3 w-3 rounded-full bg-primary-500 animate-pulse" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
