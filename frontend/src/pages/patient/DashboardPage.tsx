import { useState, useEffect } from 'react';
import { Calendar, Clipboard, ArrowRight, PlusCircle, Loader2, CalendarCheck, FileText, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Table, Column } from '@components/ui/Table';
import { Badge } from '@components/ui/Badge';
import { useAuth } from '@contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LucideIcon, Stethoscope, Heart, Eye, Brain, Baby, Bone, Activity, Ear, Smile, Pill } from 'lucide-react';
import { getMyAppointments, getMyRecords, getAllSpecialties } from '@services/patientService';
import { paymentService } from '@services/paymentService';
import type { AppointmentResponse, MedicalRecordResponse, SpecialtyResponse } from '@/types';

// Map icon name from DB → Lucide component
const iconMap: Record<string, LucideIcon> = {
    Stethoscope, Heart, Eye, Brain, Baby, Bone, Activity, Ear, Smile, Pill,
};

// ─── Stat Card Component ────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, href, delay }: {
    icon: LucideIcon;
    label: string;
    value: number;
    color: string;
    href: string;
    delay: number;
}) => (
    <Link to={href} className="block group">
        <div
            className="glass-stat rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:scale-[1.02] animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={22} />
                </div>
                <div>
                    <p className="text-3xl font-black text-slate-50 animate-count-up" style={{ animationDelay: `${delay + 200}ms` }}>
                        {value}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
                </div>
            </div>
        </div>
    </Link>
);

// ─── Greeting based on time of day ──────────────────────
const getGreetingInfo = (name: string) => {
    const hour = new Date().getHours();
    let text = 'Chào buổi tối';
    let subtext = 'Chúc bạn một buổi tối thư giãn.';

    if (hour < 12) {
        text = 'Chào buổi sáng';
        subtext = 'Chúc bạn một ngày mới tràn đầy năng lượng.';
    } else if (hour < 18) {
        text = 'Chào buổi chiều';
        subtext = 'Bạn đã uống đủ nước hôm nay chưa?';
    }

    return { text, subtext, name: name || 'Bệnh nhân' };
};

// ─── Wellness Quote Component ───────────────────────────
const WellnessQuote = () => {
    const quotes = [
        "Sức khỏe không phải là lựa chọn, đó là sự đầu tư.",
        "Mỗi bước nhỏ đều đưa bạn đến gần hơn với một cơ thể khỏe mạnh.",
        "Lắng nghe cơ thể bạn, nó biết bạn đang cần gì.",
        "Sức khỏe là chìa khóa của mọi thành công.",
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    return (
        <div className="bg-gradient-to-br from-primary-900/40 to-slate-900/20 border border-primary-800/20 rounded-[24px] p-6 animate-soft-glow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 text-primary-400">
                    <Activity size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">Lời khuyên hôm nay</p>
                    <p className="text-slate-50 italic text-sm leading-relaxed">&quot;{quote}&quot;</p>
                </div>
            </div>
        </div>
    );
};

// ─── Vitals Widget Component ────────────────────────────
const VitalsWidget = ({ records }: { records: MedicalRecordResponse[] }) => {
    // Placeholder vitals for premium dashboard look
    return (
        <Card className="rounded-[24px] border-slate-700/30 overflow-hidden">
            <CardHeader
                title="Chỉ số sức khỏe"
                description="Cập nhật từ lần khám gần nhất"
            />
            <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Nhịp tim</p>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-2xl font-black text-rose-500">72</span>
                        <span className="text-xs text-slate-400 mb-1">bpm</span>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Huyết áp</p>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-2xl font-black text-blue-500">120/80</span>
                        <span className="text-xs text-slate-400 mb-1">mmHg</span>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Cân nặng</p>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-2xl font-black text-emerald-500">65</span>
                        <span className="text-xs text-slate-400 mb-1">kg</span>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Nhiệt độ</p>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-2xl font-black text-amber-500">36.5</span>
                        <span className="text-xs text-slate-400 mb-1">°C</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const DashboardPage = () => {
    const { user } = useAuth();
    const greeting = getGreetingInfo(user?.fullName || '');

    const [upcomingAppointment, setUpcomingAppointment] = useState<AppointmentResponse | null>(null);
    const [recentRecords, setRecentRecords] = useState<MedicalRecordResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);

    // Stats
    const [upcomingCount, setUpcomingCount] = useState(0);
    const [recordsCount, setRecordsCount] = useState(0);
    const [pendingPayments, setPendingPayments] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const [appointments, records, paymentHistory] = await Promise.allSettled([
                    getMyAppointments(),
                    user?.id ? getMyRecords() : Promise.resolve([]),
                    paymentService.getPaymentHistory(),
                ]);

                // Process appointments
                if (appointments.status === 'fulfilled') {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const active = appointments.value.filter(apt =>
                        apt.appointmentDate >= todayStr &&
                        ['CONFIRMED', 'PENDING'].includes(apt.status)
                    );
                    setUpcomingCount(active.length);

                    const upcoming = active
                        .sort((a, b) => {
                            const dateCmp = a.appointmentDate.localeCompare(b.appointmentDate);
                            if (dateCmp !== 0) return dateCmp;
                            return a.appointmentTime.localeCompare(b.appointmentTime);
                        })[0] || null;
                    setUpcomingAppointment(upcoming);
                }

                if (records.status === 'fulfilled') {
                    setRecordsCount(records.value.length);
                    setRecentRecords(records.value.slice(0, 3));
                }

                // Count pending payments
                if (paymentHistory.status === 'fulfilled' && paymentHistory.value.result) {
                    const pending = paymentHistory.value.result.filter(p => p.status === 'PENDING');
                    setPendingPayments(pending.length);
                }

                // Fetch specialties
                const specs = await getAllSpecialties();
                setSpecialties(specs.slice(0, 4));
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [user?.id]);

    const columns: Column<MedicalRecordResponse>[] = [
        {
            header: 'Ngày',
            accessor: (item) => new Date(item.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric', month: 'short', day: 'numeric',
            }),
        },
        { header: 'Bác sĩ', accessor: 'doctorName' },
        { header: 'Chẩn đoán', accessor: 'diagnosis' },
        {
            header: '',
            accessor: (item) => (
                <Link to={`/medical-history/${item.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-400">
                        Chi tiết
                    </Button>
                </Link>
            )
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Welcome Section */}
            <section className="animate-fade-in-up flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 tracking-tight">
                        {greeting.text}, <span className="text-gradient font-black">{greeting.name}</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        {greeting.subtext}
                    </p>
                </div>
                <div className="flex-shrink-0 md:w-80">
                    <WellnessQuote />
                </div>
            </section>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-children">
                <StatCard
                    icon={CalendarCheck}
                    label="Lịch hẹn sắp tới"
                    value={upcomingCount}
                    color="bg-primary-900/30 text-primary-400"
                    href="/appointments"
                    delay={0}
                />
                <StatCard
                    icon={FileText}
                    label="Bệnh án"
                    value={recordsCount}
                    color="bg-blue-900/30 text-blue-400"
                    href="/medical-history"
                    delay={80}
                />
                <StatCard
                    icon={CreditCard}
                    label="Chờ thanh toán"
                    value={pendingPayments}
                    color={pendingPayments > 0 ? "bg-amber-900/30 text-amber-400" : "bg-emerald-900/30 text-emerald-400"}
                    href="/payment/history"
                    delay={160}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Appointments & Records */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Upcoming Appointment */}
                    <Card className="rounded-[24px]">
                        <CardHeader
                            title="Lịch hẹn sắp tới"
                            description="Lần khám tiếp theo của bạn"
                            action={
                                <Link to="/appointments">
                                    <Button variant="ghost" size="sm" className="text-primary-500">
                                        Tất cả <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </Link>
                            }
                        />
                        <CardContent>
                            {upcomingAppointment ? (
                                <Link to={`/appointments/${upcomingAppointment.id}`}>
                                    <div className="flex items-center gap-6 p-5 bg-slate-800/20 rounded-[20px] border border-slate-700/30 hover:border-primary-700/40 hover:bg-slate-800/40 transition-all cursor-pointer group">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-primary-900/30 rounded-2xl flex flex-col items-center justify-center text-primary-400 group-hover:bg-primary-900/50 transition-colors border border-primary-800/20">
                                                <span className="text-2xl font-bold">
                                                    {parseInt(upcomingAppointment.appointmentDate.split('-')[2], 10)}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold">
                                                    {new Date(upcomingAppointment.appointmentDate + 'T00:00:00').toLocaleDateString('vi-VN', { month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-lg font-bold text-slate-50 truncate">BS. {upcomingAppointment.doctorName}</h4>
                                                <Badge variant={upcomingAppointment.status === 'CONFIRMED' ? 'primary' : 'warning'} className="rounded-lg">
                                                    {upcomingAppointment.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đang xử lý'}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-400 text-sm flex items-center gap-1.5">
                                                <Stethoscope size={13} /> {upcomingAppointment.specialtyName || 'Chuyên khoa'}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs font-medium">
                                                <span className="text-slate-300 flex items-center gap-1.5">
                                                    <Calendar size={13} className="text-primary-500" />
                                                    {new Date(upcomingAppointment.appointmentDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long' })}
                                                </span>
                                                <span className="text-slate-300 flex items-center gap-1.5">
                                                    <Loader2 size={13} className="text-primary-500 animate-spin-slow" />
                                                    {upcomingAppointment.appointmentTime}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="text-slate-700 flex-shrink-0 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ) : (
                                <div className="py-10 text-center bg-slate-900/20 rounded-[20px] border border-dashed border-slate-800/50">
                                    <div className="w-16 h-16 bg-slate-800/40 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                        <Calendar size={32} />
                                    </div>
                                    <p className="text-slate-400 font-bold">Chưa có lịch hẹn nào</p>
                                    <p className="text-slate-500 text-sm mt-1 mb-6">Hãy đặt lịch để bác sĩ chăm sóc bạn tốt hơn</p>
                                    <Link to="/booking/specialty">
                                        <Button size="lg" className="rounded-full px-8 btn-primary">Đặt lịch khám ngay</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Records */}
                    <Card className="rounded-[24px]">
                        <CardHeader
                            title="Bệnh án gần đây"
                            action={
                                <Link to="/medical-history">
                                    <Button variant="ghost" size="sm" className="text-primary-500">
                                        Xem tất cả
                                    </Button>
                                </Link>
                            }
                        />
                        <CardContent>
                            {recentRecords.length > 0 ? (
                                <div className="overflow-hidden rounded-2xl border border-slate-700/30">
                                    <Table
                                        columns={columns}
                                        data={recentRecords}
                                        keyExtractor={(item) => item.id}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-900/20 rounded-[24px] border border-dashed border-slate-800/50">
                                    <FileText size={32} className="mx-auto mb-3 text-slate-700" />
                                    <p className="text-slate-500 font-medium">Lịch sử khám bệnh sẽ hiển thị tại đây</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Vitals & Specialties */}
                <div className="space-y-8">
                    {/* Vitals Widget */}
                    <VitalsWidget records={recentRecords} />

                    {/* Rapid Specialties Selection */}
                    <Card className="rounded-[24px]">
                        <CardHeader title="Khám chuyên khoa" />
                        <CardContent className="grid grid-cols-2 gap-3">
                            {specialties.map((spec) => {
                                const IconComponent = iconMap[spec.icon || 'Stethoscope'] || Stethoscope;
                                return (
                                    <Link key={spec.id} to={`/booking/doctor/${spec.id}`} className="block group">
                                        <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary-500/50 hover:bg-slate-800/60 transition-all text-center h-full group-hover:animate-float">
                                            <div className="w-10 h-10 bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-400 group-hover:bg-primary-900/40 transition-colors">
                                                <IconComponent size={20} />
                                            </div>
                                            <p className="font-bold text-slate-50 text-[11px] leading-tight">{spec.name}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </CardContent>
                        <div className="px-6 pb-6">
                            <Link to="/booking/specialty" className="block">
                                <Button fullWidth variant="ghost" className="text-slate-400 hover:text-primary-400 text-xs">
                                    Tất cả chuyên khoa <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Help Card */}
                    <div className="p-6 bg-slate-900/40 rounded-[24px] border border-slate-700/30">
                        <h4 className="font-bold text-slate-50 mb-2">Cần hỗ trợ?</h4>
                        <p className="text-sm text-slate-500 mb-4">Chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng sức khỏe của bạn.</p>
                        <Button fullWidth variant="outline" className="rounded-xl border-slate-700 text-slate-300">
                            Gọi tổng đài: 1900 1234
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

