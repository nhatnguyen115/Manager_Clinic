import { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Calendar,
    Activity,
    TrendingUp,
    Settings,
    LayoutDashboard,
    Download,
    ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import StatsCard from '@components/admin/StatsCard';
import ChartWidget from '@components/admin/ChartWidget';
import adminService from '@services/adminService';
import type { AdminDashboardStats } from '@/types';
import { toast } from 'react-hot-toast';

const DashboardPage = () => {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            toast.error('Không thể tải số liệu thống kê dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleExport = async (type: 'users' | 'patients' | 'appointments') => {
        try {
            toast.loading(`Đang xuất dữ liệu ${type}...`, { id: 'export' });
            if (type === 'users') await adminService.exportUsers();
            else if (type === 'patients') await adminService.exportPatients();
            else if (type === 'appointments') await adminService.exportAppointments();
            toast.success(`Đã tải xuống file ${type}.csv`, { id: 'export' });
        } catch (error) {
            console.error(`Export ${type} failed:`, error);
            toast.error(`Xuất dữ liệu ${type} thất bại`, { id: 'export' });
        }
    };

    if (isLoading) {
        return <Loading fullPage text="Đang tải dữ liệu hệ thống..." />;
    }

    if (!stats) return null;

    return (
        <div className="space-y-8 animate-fade-in p-2">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3">
                        <LayoutDashboard className="text-primary-500" size={32} />
                        Hệ thống quản trị
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Tổng quan hoạt động và thống kê toàn bộ phòng khám
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('appointments')}
                        className="border-slate-700 hover:border-primary-500/50"
                    >
                        <Download size={16} className="mr-2" /> Xuất lịch hẹn
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={loadData}
                    >
                        <Activity size={16} className="mr-2" /> Làm mới
                    </Button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    icon={<Users size={24} />}
                    label="Người dùng"
                    value={stats.totalUsers}
                    sublabel="Tổng số tài khoản"
                    trend={{ value: '12%', isUp: true }}
                    bgColor="bg-blue-900/10"
                    borderColor="border-blue-700/20"
                    iconColor="text-blue-400"
                />
                <StatsCard
                    icon={<UserPlus size={24} />}
                    label="Bác sĩ"
                    value={stats.totalDoctors}
                    sublabel="Đội ngũ bác sĩ"
                    bgColor="bg-emerald-900/10"
                    borderColor="border-emerald-700/20"
                    iconColor="text-emerald-400"
                />
                <StatsCard
                    icon={<Calendar size={24} />}
                    label="Lịch hôm nay"
                    value={stats.todayAppointments}
                    trend={{ value: '5%', isUp: true }}
                    sublabel="Đã xác nhận & chờ"
                    bgColor="bg-primary-900/10"
                    borderColor="border-primary-700/20"
                    iconColor="text-primary-400"
                />
                <StatsCard
                    icon={<TrendingUp size={24} />}
                    label="Tháng này"
                    value={stats.monthAppointments}
                    sublabel="Tổng lịch khám tháng"
                    bgColor="bg-amber-900/10"
                    borderColor="border-amber-700/20"
                    iconColor="text-amber-400"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartWidget
                        title="Xu hướng đặt lịch"
                        description="Số lượng lịch hẹn trong 6 tháng gần nhất"
                        type="area"
                        data={stats.monthlyAppointmentStats}
                        nameKey="month"
                        dataKey="count"
                        icon={<TrendingUp size={18} />}
                    />
                </div>
                <div>
                    <ChartWidget
                        title="Phân bố chuyên khoa"
                        description="Tỷ lệ lịch hẹn theo chuyên khoa"
                        type="pie"
                        data={stats.specialtyDistribution}
                        nameKey="name"
                        dataKey="count"
                        icon={<Activity size={18} />}
                    />
                </div>
            </div>

            {/* Secondary stats & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader title="Hoạt động gần đây" icon={<Activity size={18} />} />
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-800">
                            {stats.recentActivities && stats.recentActivities.length > 0 ? (
                                stats.recentActivities.map((activity, i) => (
                                    <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                            <Activity size={14} className="text-slate-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-100 font-medium truncate">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(activity.timestamp).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        <ArrowUpRight size={14} className="text-emerald-500" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500 text-sm italic">
                                    Chưa có hoạt động nào được ghi lại
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Trạng thái hệ thống"
                        description="Tình trạng các tiến trình hiện tại"
                        icon={<Settings size={18} />}
                    />
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-300">Lịch chờ xác nhận</span>
                                        <span className="text-sm font-bold text-amber-500">{stats.pendingAppointments}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                        <div
                                            className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, (stats.pendingAppointments / (stats.todayAppointments || 1)) * 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-300">Thanh toán hoàn tất</span>
                                        <span className="text-sm font-bold text-emerald-500">
                                            {stats.paymentStats.successRate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                        <div
                                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.paymentStats.successRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-col justify-center gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Xuất báo cáo hệ thống</span>
                                    <Button variant="ghost" size="sm" onClick={() => handleExport('users')}>
                                        <Download size={14} className="mr-2" /> Users
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Dữ liệu bệnh nhân</span>
                                    <Button variant="ghost" size="sm" onClick={() => handleExport('patients')}>
                                        <Download size={14} className="mr-2" /> Patients
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
