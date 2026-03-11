import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import {
    Shield, Calendar, ClipboardList, CreditCard, Clock,
    Users, ArrowRight, Stethoscope, Activity,
    ChevronRight, Star, Heart, Zap, Lock, MapPin, Award
} from 'lucide-react';
import { Logo } from '@components/ui/Logo';

// ─── Feature Card ───────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, color, delay }: {
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
    delay: number;
}) => (
    <div
        className="group relative p-6 rounded-2xl border border-th-800/80 bg-th-900/50 hover:bg-th-900/80 hover:border-primary-700/40 transition-all duration-300 cursor-pointer animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={22} />
        </div>
        <h3 className="text-lg font-bold text-th-50 mb-2">{title}</h3>
        <p className="text-th-400 text-sm leading-relaxed">{description}</p>
    </div>
);

// ─── Stat Counter ───────────────────────────────────────
const StatItem = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
    <div className="text-center animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
        <p className="text-4xl md:text-5xl font-black text-gradient tracking-tight">{value}</p>
        <p className="text-th-400 text-sm font-medium mt-2">{label}</p>
    </div>
);

// ─── Step Card ──────────────────────────────────────────
const StepCard = ({ step, title, description, delay }: {
    step: number; title: string; description: string; delay: number;
}) => (
    <div className="relative flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
        <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary-900/40 mb-4">
            {step}
        </div>
        <h4 className="text-lg font-bold text-th-50 mb-1">{title}</h4>
        <p className="text-th-400 text-sm leading-relaxed max-w-xs">{description}</p>
    </div>
);

// ─── Testimonial Card ───────────────────────────────────
const TestimonialCard = ({ name, role, text, delay, avatarImg }: {
    name: string; role: string; text: string; delay: number; avatarImg?: string;
}) => (
    <div
        className="p-6 rounded-2xl border border-th-800/80 bg-th-900/40 animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
        </div>
        <p className="text-th-300 text-sm leading-relaxed mb-5 italic">"{text}"</p>
        <div className="flex items-center gap-3">
            {avatarImg ? (
                <img src={avatarImg} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-primary-700/40" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-primary-900/40 flex items-center justify-center text-primary-400 font-bold text-sm">
                    {name.charAt(0)}
                </div>
            )}
            <div>
                <p className="text-th-50 font-semibold text-sm">{name}</p>
                <p className="text-th-500 text-xs">{role}</p>
            </div>
        </div>
    </div>
);

// ─── Doctor Card ────────────────────────────────────────
const DoctorCard = ({ name, specialty, experience, rating, reviews, avatarImg, delay }: {
    name: string;
    specialty: string;
    experience: string;
    rating: number;
    reviews: number;
    avatarImg: string;
    delay: number;
}) => (
    <div
        className="group relative p-6 rounded-2xl border border-th-800/60 bg-th-900/40 hover:bg-th-900/70 hover:border-primary-600/40 transition-all duration-300 cursor-pointer animate-fade-in-up flex flex-col items-center text-center"
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Avatar */}
        <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary-700/30 group-hover:ring-primary-500/60 transition-all duration-300">
                <img
                    src={avatarImg}
                    alt={`Bác sĩ ${name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-th-900 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
            </div>
        </div>

        {/* Info */}
        <h3 className="text-th-50 font-bold text-base mb-1">{name}</h3>
        <p className="text-primary-400 text-sm font-medium mb-2">{specialty}</p>

        <div className="flex items-center gap-1.5 text-xs text-th-400 mb-3">
            <Award size={12} className="text-amber-400" />
            <span>{experience}</span>
            <span className="text-th-700">•</span>
            <MapPin size={11} />
            <span>TP. HCM</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-th-200 font-semibold text-sm">{rating}</span>
            <span className="text-th-500 text-xs">({reviews} đánh giá)</span>
        </div>

        <Link to="/booking/specialty" className="w-full">
            <button className="w-full py-2 px-4 rounded-xl bg-primary-900/30 hover:bg-primary-700/30 border border-primary-700/20 hover:border-primary-500/40 text-primary-400 hover:text-primary-300 text-sm font-semibold transition-all duration-200 cursor-pointer">
                Đặt lịch ngay
            </button>
        </Link>
    </div>
);

const HomePage = () => {
    return (
        <div className="min-h-screen bg-th-950 overflow-hidden">
            {/* ─── Navbar ─────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-th-950/80 backdrop-blur-xl border-b border-th-800/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <Logo />
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-th-400 hover:text-th-50 text-sm font-medium transition-colors">Tính năng</a>
                        <a href="#doctors" className="text-th-400 hover:text-th-50 text-sm font-medium transition-colors">Bác sĩ</a>
                        <a href="#how-it-works" className="text-th-400 hover:text-th-50 text-sm font-medium transition-colors">Cách hoạt động</a>
                        <a href="#testimonials" className="text-th-400 hover:text-th-50 text-sm font-medium transition-colors">Đánh giá</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button variant="ghost" size="sm" className="text-th-300 hover:text-th-50">
                                Đăng nhập
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm" className="bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-900/20 px-5">
                                Đăng ký
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ───────────────────────────── */}
            <section className="relative pt-16 pb-8 md:pt-20 md:pb-12 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary-600/5 blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-primary-500/5 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary-900/10" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text content */}
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/20 border border-primary-700/20 text-primary-400 text-xs font-semibold mb-6 animate-fade-in-up">
                                <Zap size={12} />
                                Nền tảng quản lý phòng khám #1 Việt Nam
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-th-50 tracking-tight leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                Quản lý phòng khám{' '}
                                <span className="text-gradient">thông minh</span>{' '}
                                và hiệu quả
                            </h1>

                            <p className="text-lg text-th-400 leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                Đặt lịch khám, quản lý bệnh án, thanh toán trực tuyến — tất cả trong một nền tảng duy nhất.
                                Dành cho bệnh nhân, bác sĩ và quản trị viên.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                                <Link to="/register">
                                    <Button size="lg" className="px-8 h-13 text-base bg-primary-600 hover:bg-primary-500 shadow-2xl shadow-primary-900/30 group">
                                        Bắt đầu miễn phí
                                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="lg" className="px-8 h-13 text-base border-th-700 hover:bg-th-900 hover:border-th-600">
                                        Đăng nhập ngay
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex items-center gap-5 mt-8 text-th-500 text-xs font-medium animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                                <span className="flex items-center gap-1.5"><Lock size={12} /> Bảo mật SSL</span>
                                <span className="h-1 w-1 rounded-full bg-th-700" />
                                <span className="flex items-center gap-1.5"><Shield size={12} /> Tuân thủ HIPAA</span>
                                <span className="h-1 w-1 rounded-full bg-th-700" />
                                <span className="flex items-center gap-1.5"><Clock size={12} /> Hỗ trợ 24/7</span>
                            </div>
                        </div>

                        {/* Right: Hero image */}
                        <div className="relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="relative rounded-3xl overflow-hidden border border-primary-800/20 shadow-2xl shadow-primary-900/20">
                                <img
                                    src="/images/doctor_hero_banner.png"
                                    alt="Đội ngũ bác sĩ ClinicPro"
                                    className="w-full h-auto object-cover"
                                />
                                {/* Overlay gradient at bottom */}
                                <div className="absolute inset-0 bg-gradient-to-t from-th-950/60 via-transparent to-transparent" />

                                {/* Floating badge */}
                                <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                                    <div className="flex-1 bg-th-950/80 backdrop-blur-md rounded-xl p-3 border border-th-800/50">
                                        <p className="text-th-400 text-xs mb-1">Bác sĩ chuyên khoa</p>
                                        <p className="text-th-50 text-lg font-black">500<span className="text-primary-400">+</span></p>
                                    </div>
                                    <div className="flex-1 bg-th-950/80 backdrop-blur-md rounded-xl p-3 border border-th-800/50">
                                        <p className="text-th-400 text-xs mb-1">Đánh giá trung bình</p>
                                        <p className="text-th-50 text-lg font-black flex items-center gap-1">4.9 <Star size={14} className="text-amber-400 fill-amber-400" /></p>
                                    </div>
                                    <div className="flex-1 bg-th-950/80 backdrop-blur-md rounded-xl p-3 border border-th-800/50">
                                        <p className="text-th-400 text-xs mb-1">Bệnh nhân</p>
                                        <p className="text-th-50 text-lg font-black">10K<span className="text-primary-400">+</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating notification card */}
                            <div className="absolute -top-4 -right-4 bg-th-900/90 backdrop-blur-md rounded-2xl p-3.5 border border-th-700/50 shadow-xl animate-float hidden lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-th-50 text-xs font-bold">Lịch hẹn xác nhận!</p>
                                        <p className="text-th-500 text-xs">BS. Lê Thị Thảo • 9:00 AM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Stats Section ──────────────────────────── */}
            <section className="py-14 border-y border-th-800/50 bg-th-900/30">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatItem value="100+" label="Phòng khám" delay={0} />
                    <StatItem value="500+" label="Bác sĩ" delay={100} />
                    <StatItem value="10K+" label="Bệnh nhân" delay={200} />
                    <StatItem value="99.9%" label="Uptime" delay={300} />
                </div>
            </section>

            {/* ─── Featured Doctors Section ────────────────── */}
            <section id="doctors" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-primary-400 font-semibold text-sm uppercase tracking-widest mb-3">Đội ngũ bác sĩ</p>
                        <h2 className="text-3xl md:text-4xl font-black text-th-50 tracking-tight">
                            Các chuyên gia <span className="text-gradient">hàng đầu</span> của chúng tôi
                        </h2>
                        <p className="text-th-400 mt-4 max-w-xl mx-auto">
                            Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm với bệnh nhân. Luôn sẵn sàng phục vụ sức khỏe của bạn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DoctorCard
                            name="BS. Lê Thị Thảo"
                            specialty="Thần kinh học"
                            experience="12 năm kinh nghiệm"
                            rating={4.9}
                            reviews={248}
                            avatarImg="/images/doctor_avatar_1.png"
                            delay={0}
                        />
                        <DoctorCard
                            name="BS. Trần Văn Minh"
                            specialty="Tim mạch"
                            experience="15 năm kinh nghiệm"
                            rating={4.8}
                            reviews={312}
                            avatarImg="/images/doctor_avatar_2.png"
                            delay={100}
                        />
                        <DoctorCard
                            name="BS. Phạm Thị Hương"
                            specialty="Nhi khoa"
                            experience="8 năm kinh nghiệm"
                            rating={5.0}
                            reviews={189}
                            avatarImg="/images/doctor_avatar_3.png"
                            delay={200}
                        />
                    </div>

                    <div className="text-center mt-10">
                        <Link to="/booking/specialty">
                            <Button variant="outline" className="border-th-700 hover:bg-th-900 hover:border-primary-600 group px-8">
                                Xem tất cả bác sĩ
                                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Features Section ──────────────────────── */}
            <section id="features" className="py-24 bg-th-900/20 border-y border-th-800/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-primary-400 font-semibold text-sm uppercase tracking-widest mb-3">Tính năng</p>
                        <h2 className="text-3xl md:text-4xl font-black text-th-50 tracking-tight">
                            Mọi thứ bạn cần, trong <span className="text-gradient">một nền tảng</span>
                        </h2>
                        <p className="text-th-400 mt-4 max-w-xl mx-auto">
                            Từ đặt lịch khám đến quản lý bệnh án, thanh toán và phân tích — ClinicPro giúp vận hành phòng khám trơn tru.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard icon={Calendar} title="Đặt lịch thông minh" description="Bệnh nhân đặt lịch 24/7. Tự động check conflict, gửi nhắc hẹn qua email và SMS." color="bg-primary-900/30 text-primary-400" delay={0} />
                        <FeatureCard icon={ClipboardList} title="Bệnh án điện tử" description="Lưu trữ hồ sơ y tế an toàn. Bác sĩ truy cập nhanh tiền sử, chẩn đoán và đơn thuốc." color="bg-blue-900/30 text-blue-400" delay={80} />
                        <FeatureCard icon={CreditCard} title="Thanh toán trực tuyến" description="Tích hợp VNPay, tự động tạo hóa đơn, quản lý công nợ minh bạch." color="bg-emerald-900/30 text-emerald-400" delay={160} />
                        <FeatureCard icon={Shield} title="Bảo mật cao cấp" description="Mã hóa dữ liệu AES-256, phân quyền chi tiết, log audit đầy đủ." color="bg-amber-900/30 text-amber-400" delay={240} />
                        <FeatureCard icon={Activity} title="Dashboard thời gian thực" description="Theo dõi hoạt động phòng khám real-time: lịch hẹn, doanh thu, hiệu suất bác sĩ." color="bg-pink-900/30 text-pink-400" delay={320} />
                        <FeatureCard icon={Users} title="Đa vai trò" description="3 portal riêng biệt cho Bệnh nhân, Bác sĩ và Quản trị viên, tối ưu cho từng nhu cầu." color="bg-indigo-900/30 text-indigo-400" delay={400} />
                    </div>
                </div>
            </section>

            {/* ─── How It Works Section ───────────────────── */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-primary-400 font-semibold text-sm uppercase tracking-widest mb-3">Cách hoạt động</p>
                        <h2 className="text-3xl md:text-4xl font-black text-th-50 tracking-tight">
                            Đơn giản chỉ <span className="text-gradient">3 bước</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-7 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px bg-gradient-to-r from-primary-700/50 via-primary-500/30 to-primary-700/50" />
                        <StepCard step={1} title="Đăng ký tài khoản" description="Tạo tài khoản miễn phí chỉ trong 30 giây với email hoặc số điện thoại." delay={0} />
                        <StepCard step={2} title="Chọn bác sĩ & đặt lịch" description="Tìm bác sĩ theo chuyên khoa, xem đánh giá và đặt lịch phù hợp." delay={150} />
                        <StepCard step={3} title="Khám & nhận kết quả" description="Đến khám đúng giờ, nhận bệnh án điện tử và đơn thuốc ngay lập tức." delay={300} />
                    </div>
                </div>
            </section>

            {/* ─── Testimonials Section ───────────────────── */}
            <section id="testimonials" className="py-24 bg-th-900/20 border-y border-th-800/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-primary-400 font-semibold text-sm uppercase tracking-widest mb-3">Đánh giá</p>
                        <h2 className="text-3xl md:text-4xl font-black text-th-50 tracking-tight">
                            Được tin tưởng bởi <span className="text-gradient">hàng nghìn</span> người dùng
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TestimonialCard
                            name="BS. Trần Văn Minh"
                            role="Bác sĩ Tim mạch"
                            text="ClinicPro giúp tôi quản lý lịch khám và bệnh án hiệu quả hơn rất nhiều. Giao diện trực quan, dễ sử dụng."
                            avatarImg="/images/doctor_avatar_2.png"
                            delay={0}
                        />
                        <TestimonialCard
                            name="Trần Thị Bảo Châu"
                            role="Bệnh nhân"
                            text="Đặt lịch khám online nhanh chóng, không phải chờ đợi. Theo dõi bệnh án mọi lúc mọi nơi rất tiện lợi."
                            delay={100}
                        />
                        <TestimonialCard
                            name="Lê Hoàng Phúc"
                            role="Quản lý phòng khám"
                            text="Dashboard giúp tôi nắm bắt tình hình phòng khám real-time. Doanh thu tăng 40% từ khi sử dụng ClinicPro."
                            delay={200}
                        />
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ────────────────────────────── */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-primary-800/40 to-th-900 animate-gradient-shift" />
                        <div className="absolute inset-0 border border-primary-700/20 rounded-3xl" />

                        <div className="relative py-16 px-8 md:px-16 text-center">
                            <Stethoscope size={40} className="text-primary-400 mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-black text-th-50 tracking-tight mb-4">
                                Sẵn sàng nâng cấp phòng khám?
                            </h2>
                            <p className="text-th-300 text-lg mb-8 max-w-lg mx-auto">
                                Tham gia cùng hàng trăm phòng khám đã tin chọn ClinicPro. Bắt đầu miễn phí hôm nay.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/register">
                                    <Button size="lg" className="px-10 h-14 text-lg bg-white text-th-900 hover:bg-th-100 font-bold shadow-2xl group">
                                        Tạo tài khoản miễn phí
                                        <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="ghost" size="lg" className="px-8 h-14 text-lg text-th-200 border border-th-500/30 hover:bg-white/5">
                                        Đăng nhập
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─────────────────────────────────── */}
            <footer className="border-t border-th-800/50 py-12 bg-th-950">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                        <div className="col-span-2 md:col-span-1">
                            <Link to="/" className="flex items-center gap-2 mb-4">
                                <Logo size="sm" />
                            </Link>
                            <p className="text-th-500 text-sm leading-relaxed">
                                Nền tảng quản lý phòng khám thông minh cho y tế hiện đại.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-th-200 font-semibold text-sm mb-4">Sản phẩm</h4>
                            <ul className="space-y-2.5">
                                <li><a href="#features" className="text-th-500 text-sm hover:text-primary-400 transition-colors">Tính năng</a></li>
                                <li><a href="#doctors" className="text-th-500 text-sm hover:text-primary-400 transition-colors">Bác sĩ</a></li>
                                <li><a href="#how-it-works" className="text-th-500 text-sm hover:text-primary-400 transition-colors">Cách hoạt động</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-th-200 font-semibold text-sm mb-4">Hỗ trợ</h4>
                            <ul className="space-y-2.5">
                                <li><a href="#" className="text-th-500 text-sm hover:text-primary-400 transition-colors">Trung tâm hỗ trợ</a></li>
                                <li><a href="#" className="text-th-500 text-sm hover:text-primary-400 transition-colors">Liên hệ</a></li>
                                <li><a href="#" className="text-th-500 text-sm hover:text-primary-400 transition-colors">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-th-200 font-semibold text-sm mb-4">Pháp lý</h4>
                            <ul className="space-y-2.5">
                                <li><a href="#" className="text-th-500 text-sm hover:text-primary-400 transition-colors">Điều khoản</a></li>
                                <li><a href="#" className="text-th-500 text-sm hover:text-primary-400 transition-colors">Bảo mật</a></li>
                                <li><a href="#" className="text-th-500 text-sm hover:text-primary-400 transition-colors">Cookie</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-th-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-th-600 text-xs">© 2026 ClinicPro. All rights reserved.</p>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-th-600 text-xs">
                                <Heart size={12} className="text-red-500" /> Made in Vietnam
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
