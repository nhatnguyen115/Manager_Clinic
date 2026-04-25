import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    Calendar,
    DollarSign,
    Download,
    Filter,
    FileText,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Loading } from '@components/ui/Loading';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import adminService from '@services/adminService';
import type { ReportResponse } from '@/types';
import { toast } from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ReportsDashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportResponse | null>(null);
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getSummaryReport(dateRange.from, dateRange.to);
            setReportData(data);
        } catch (error) {
            console.error('Failed to load report:', error);
            toast.error('Không thể tải dữ liệu báo cáo');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleExport = async (type: 'pdf' | 'excel') => {
        try {
            toast.loading(`Đang khởi tạo tệp ${type.toUpperCase()}...`, { id: 'export' });
            if (type === 'pdf') {
                await adminService.exportReportPdf(dateRange.from, dateRange.to);
            } else {
                await adminService.exportReportExcel(dateRange.from, dateRange.to);
            }
            toast.success(`Đã xuất báo cáo ${type.toUpperCase()}`, { id: 'export' });
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Xuất báo cáo thất bại', { id: 'export' });
        }
    };

    if (isLoading || !reportData) return <Loading fullPage text="Đang tổng hợp dữ liệu báo cáo..." />;

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50">Báo cáo & Thống kê</h1>
                    <p className="text-slate-400 mt-1">Phân tích chuyên sâu về hoạt động của phòng khám</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('excel')}
                        className="border-slate-700 text-slate-300"
                    >
                        <Download size={16} className="mr-2" /> Excel
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('pdf')}
                        className="border-primary-700/50 text-primary-400"
                    >
                        <FileText size={16} className="mr-2" /> PDF
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Từ ngày:</span>
                            <Input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                className="w-40 h-9 text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Đến ngày:</span>
                            <Input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                className="w-40 h-9 text-xs"
                            />
                        </div>
                        <Button size="sm" onClick={loadData} className="bg-primary-600 hover:bg-primary-500">
                            <Filter size={14} className="mr-2" /> Lọc dữ liệu
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Tổng doanh thu</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reportData.totalRevenue)}
                                </h3>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-primary-900/40 flex items-center justify-center">
                                <DollarSign className="text-primary-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Tổng lịch hẹn</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{reportData.totalAppointments}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-purple-900/40 flex items-center justify-center">
                                <Calendar className="text-purple-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Lịch hẹn hoàn thành</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{reportData.completedAppointments}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-emerald-900/40 flex items-center justify-center">
                                <TrendingUp className="text-emerald-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Người dùng mới</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    {reportData.userRegistrationTrend.reduce((acc, curr) => acc + (curr.count || 0), 0)}
                                </h3>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-orange-900/40 flex items-center justify-center">
                                <Users className="text-orange-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary-400" />
                            Xu hướng doanh thu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={reportData.revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    formatter={(val: any) => [`${new Intl.NumberFormat('vi-VN').format(Number(val))} VNĐ`, 'Doanh thu']}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="value" name="Doanh thu" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Specialty Distribution */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <PieChartIcon size={18} className="text-purple-400" />
                            Phân bố chuyên khoa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reportData.specialtyDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="category"
                                >
                                    {reportData.specialtyDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Doctor Performance & Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Doctor Performance */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChartIcon size={18} className="text-emerald-400" />
                            Hiệu suất bác sĩ
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.doctorPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} hide />
                                <YAxis dataKey="doctorName" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                />
                                <Bar dataKey="appointmentCount" name="Số ca khám" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Age Distribution */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users size={18} className="text-blue-400" />
                            Cơ cấu độ tuổi bệnh nhân
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.ageDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Bar dataKey="count" name="Số nhân phẩm" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            {/* User Activity & Role Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users size={18} className="text-orange-400" />
                            Xu hướng đăng ký người dùng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.userRegistrationTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                    cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                                />
                                <Bar dataKey="count" name="Người dùng mới" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <PieChartIcon size={18} className="text-emerald-400" />
                            Cơ cấu vai trò
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reportData.roleDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="category"
                                >
                                    {reportData.roleDistribution.map((_, index) => (
                                        <Cell key={`cell-role-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReportsDashboardPage;
