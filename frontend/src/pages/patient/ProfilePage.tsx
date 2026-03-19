import { useState, useEffect, useRef } from 'react';
import {
    User, Phone, Shield, Save, Loader2,
    MapPin, CreditCard, CheckCircle2, Camera
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Textarea } from '@components/ui/Textarea';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@hooks/useToast';
import { Avatar } from '@components/ui/Avatar';
import { getMyProfile, updateMyProfile, getAllSpecialties, uploadAvatar } from '@services/patientService';
import type { Gender, SpecialtyResponse } from '@/types';

// ─── Completion Progress Component ──────────────────────
const ProfileCompletion = ({ percentage }: { percentage: number }) => {
    const getColor = () => {
        if (percentage >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-400', label: 'Hoàn thiện tốt!' };
        if (percentage >= 50) return { bar: 'bg-amber-500', text: 'text-amber-400', label: 'Cần bổ sung thêm' };
        return { bar: 'bg-red-500', text: 'text-red-400', label: 'Hãy hoàn thiện hồ sơ' };
    };
    const { bar, text, label } = getColor();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Hoàn thiện hồ sơ</span>
                <span className={`text-sm font-bold ${text}`}>{percentage}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${bar} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className={`text-xs ${text} font-medium`}>{label}</p>
        </div>
    );
};

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: '',
        dateOfBirth: '',
        gender: '' as Gender | '',
        address: '',
        city: '',
        bloodType: '',
        allergies: '',
        chronicDiseases: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        insuranceNumber: '',
        // Doctor specific (kept for compatibility)
        bio: '',
        experienceYears: 0,
        licenseNumber: '',
        consultationFee: 0,
        specialtyName: '',
        specialtyId: '',
        education: '',
        certifications: '',
    });

    const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate completion percentage
    const calculateCompletion = () => {
        const isDoctor = user?.role === 'DOCTOR';
        const patientFields = [
            formData.fullName, formData.phone, formData.dateOfBirth,
            formData.gender, formData.address, formData.city,
            formData.bloodType, formData.insuranceNumber,
            formData.emergencyContactName, formData.emergencyContactPhone,
        ];
        const doctorFields = [
            formData.fullName, formData.phone, formData.dateOfBirth,
            formData.gender, formData.address, formData.city,
            formData.specialtyId, formData.licenseNumber,
            formData.bio, formData.education,
        ];
        const fields = isDoctor ? doctorFields : patientFields;
        const filled = fields.filter(f => f && String(f).trim() !== '' && String(f) !== '0').length;
        return Math.round((filled / fields.length) * 100);
    };

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const [profile, specialtiesList] = await Promise.all([
                    getMyProfile(),
                    getAllSpecialties(),
                ]);

                setSpecialties(specialtiesList);

                setAvatarUrl(profile.avatarUrl || undefined);
                setFormData({
                    fullName: profile.fullName || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    dateOfBirth: profile.dateOfBirth || '',
                    gender: (profile.gender as Gender) || '',
                    address: profile.address || '',
                    city: profile.city || '',
                    bloodType: profile.bloodType || '',
                    allergies: profile.allergies?.join(', ') || '',
                    chronicDiseases: profile.chronicDiseases?.join(', ') || '',
                    emergencyContactName: profile.emergencyContactName || '',
                    emergencyContactPhone: profile.emergencyContactPhone || '',
                    insuranceNumber: profile.insuranceNumber || '',
                    bio: profile.bio || '',
                    experienceYears: profile.experienceYears || 0,
                    licenseNumber: profile.licenseNumber || '',
                    consultationFee: profile.consultationFee || 0,
                    specialtyId: profile.specialtyId || '',
                    specialtyName: profile.specialtyName || '',
                    education: profile.education?.join(', ') || '',
                    certifications: profile.certifications?.join(', ') || '',
                });
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate: only image, max 5MB
        if (!file.type.startsWith('image/')) {
            showToast.error('Vui lòng chọn file ảnh (jpg, png, webp...).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast.error('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
            return;
        }

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file);
        setAvatarUrl(objectUrl);

        try {
            setIsUploadingAvatar(true);
            showToast.loading('Đang tải ảnh lên...');
            const newUrl = await uploadAvatar(file);
            setAvatarUrl(newUrl);
            updateUser({ avatarUrl: newUrl });
            showToast.success('Cập nhật ảnh đại diện thành công!');
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Tải ảnh thất bại. Vui lòng thử lại.';
            showToast.error(msg);
            // Revert preview on error
            setAvatarUrl(undefined);
        } finally {
            setIsUploadingAvatar(false);
            // Reset input so same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            showToast.loading('Đang cập nhật hồ sơ...');

            await updateMyProfile({
                fullName: formData.fullName,
                phone: formData.phone || undefined,
                dateOfBirth: formData.dateOfBirth || undefined,
                gender: formData.gender || undefined,
                address: formData.address || undefined,
                city: formData.city || undefined,
                bio: formData.bio,
                experienceYears: formData.experienceYears,
                licenseNumber: formData.licenseNumber,
                consultationFee: formData.consultationFee,
                education: formData.education ? formData.education.split(',').map(s => s.trim()).filter(Boolean) : [],
                certifications: formData.certifications ? formData.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
                specialtyId: formData.specialtyId || undefined,
                bloodType: formData.bloodType || undefined,
                allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
                chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean) : [],
                emergencyContactName: formData.emergencyContactName || undefined,
                emergencyContactPhone: formData.emergencyContactPhone || undefined,
                insuranceNumber: formData.insuranceNumber || undefined,
            });

            showToast.success('Cập nhật hồ sơ thành công!');
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Cập nhật hồ sơ thất bại.';
            showToast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
        );
    }

    const genderOptions = [
        { label: 'Nam', value: 'MALE' },
        { label: 'Nữ', value: 'FEMALE' },
        { label: 'Khác', value: 'OTHER' }
    ];

    const bloodTypeOptions = [
        { label: 'A+', value: 'A+' },
        { label: 'A-', value: 'A-' },
        { label: 'B+', value: 'B+' },
        { label: 'B-', value: 'B-' },
        { label: 'AB+', value: 'AB+' },
        { label: 'AB-', value: 'AB-' },
        { label: 'O+', value: 'O+' },
        { label: 'O-', value: 'O-' }
    ];

    const specialtyOptions = [
        { label: 'Chọn chuyên khoa', value: '' },
        ...specialties.map(s => ({ label: s.name, value: s.id }))
    ];

    const isDoctor = user?.role === 'DOCTOR';
    const completion = calculateCompletion();

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-10">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Hồ sơ của bạn</h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        Quản lý thông tin cá nhân và thiết lập tài khoản của bạn.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Shield size={18} /> Bảo mật
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-6">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Lưu thay đổi
                    </Button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-8 flex flex-col items-center text-center">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <Avatar
                                    src={avatarUrl}
                                    size="xxl"
                                    fallback={formData.fullName.split(' ').map(n => n[0]).join('')}
                                    className="rounded-3xl border-4 border-slate-700/50 shadow-2xl"
                                />
                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-3xl flex flex-col items-center justify-center gap-1.5">
                                    {isUploadingAvatar ? (
                                        <Loader2 size={24} className="animate-spin text-white" />
                                    ) : (
                                        <>
                                            <Camera size={22} className="text-white" />
                                            <span className="text-white text-xs font-medium">Thay đổi ảnh</span>
                                        </>
                                    )}
                                </div>
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarFileChange}
                                />
                            </div>
                            <h2 className="mt-6 text-xl font-semibold text-slate-50">{formData.fullName}</h2>
                            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5 capitalize">
                                <Shield size={14} className="text-primary-500" />
                                {user?.role === 'PATIENT' ? 'Bệnh nhân' : user?.role?.toLowerCase()}
                            </p>
                            <div className="w-full h-px bg-slate-700/50 my-6" />
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Email</span>
                                    <span className="text-slate-100">{formData.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Trạng thái</span>
                                    <span className="inline-flex items-center gap-1.5 text-success px-2 py-0.5 rounded-full bg-success/10 text-xs font-medium border border-success/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                        Hoạt động
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completion Progress Card */}
                    <Card className="bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/20">
                        <CardContent className="p-6 space-y-4">
                            <ProfileCompletion percentage={completion} />
                            {completion < 80 && (
                                <div className="space-y-2 pt-2 border-t border-slate-700/30">
                                    <p className="text-xs text-slate-400 font-medium">Gợi ý bổ sung:</p>
                                    <div className="space-y-1.5">
                                        {!formData.phone && (
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-amber-500" /> Số điện thoại
                                            </p>
                                        )}
                                        {!formData.dateOfBirth && (
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-amber-500" /> Ngày sinh
                                            </p>
                                        )}
                                        {!formData.emergencyContactName && !isDoctor && (
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-amber-500" /> Liên hệ khẩn cấp
                                            </p>
                                        )}
                                        {!formData.insuranceNumber && !isDoctor && (
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-amber-500" /> Số thẻ bảo hiểm
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {completion >= 80 && (
                                <p className="text-slate-300 text-sm leading-relaxed flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                    Hồ sơ của bạn đã khá đầy đủ. Bác sĩ sẽ có cái nhìn tổng quan tốt hơn về tình trạng sức khỏe của bạn.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 text-sm font-bold">
                                1
                            </div>
                            <h3 className="text-xl font-semibold text-slate-50">Thông tin cá nhân</h3>
                        </div>
                        <Card>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                <Input
                                    label="Họ và tên"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    leftIcon={<User size={16} />}
                                    fullWidth
                                />
                                <Input
                                    label="Số điện thoại"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    leftIcon={<Phone size={16} />}
                                    fullWidth
                                />
                                <Input
                                    label="Ngày sinh"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    fullWidth
                                />
                                <Select
                                    label="Giới tính"
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                                    options={genderOptions}
                                    placeholder="Chọn giới tính"
                                    fullWidth
                                />
                                <Input
                                    label="Địa chỉ"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    leftIcon={<MapPin size={16} />}
                                    fullWidth
                                    className="md:col-span-2"
                                />
                                <Input
                                    label="Thành phố"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    leftIcon={<MapPin size={16} />}
                                    fullWidth
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Professional/Medical Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 text-sm font-bold">
                                2
                            </div>
                            <h3 className="text-xl font-semibold text-slate-50">
                                {isDoctor ? 'Thông tin nghề nghiệp' : 'Thông tin y tế'}
                            </h3>
                            {!isDoctor && (
                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                    Giúp bác sĩ phục vụ bạn tốt hơn
                                </span>
                            )}
                        </div>
                        <Card>
                            <CardContent className="space-y-6 pt-6">
                                {isDoctor ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Select
                                                label="Chuyên khoa"
                                                value={formData.specialtyId}
                                                onChange={e => setFormData({ ...formData, specialtyId: e.target.value })}
                                                options={specialtyOptions}
                                                fullWidth
                                            />
                                            <Input
                                                label="Số GPKD / License"
                                                value={formData.licenseNumber}
                                                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                                                fullWidth
                                            />
                                            <Input
                                                label="Số năm kinh nghiệm"
                                                type="number"
                                                value={formData.experienceYears}
                                                onChange={e => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                                                fullWidth
                                            />
                                            <Input
                                                label="Phí khám (VNĐ)"
                                                type="number"
                                                value={formData.consultationFee}
                                                onChange={e => setFormData({ ...formData, consultationFee: parseInt(e.target.value) || 0 })}
                                                fullWidth
                                            />
                                        </div>
                                        <Textarea
                                            label="Giới thiệu bản thân"
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Giới thiệu về kỹ năng, kinh nghiệm..."
                                            fullWidth
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Textarea
                                                label="Học vấn"
                                                value={formData.education}
                                                onChange={e => setFormData({ ...formData, education: e.target.value })}
                                                placeholder="VD: Thạc sĩ, Đại học Y Hà Nội..."
                                                fullWidth
                                            />
                                            <Textarea
                                                label="Chứng chỉ"
                                                value={formData.certifications}
                                                onChange={e => setFormData({ ...formData, certifications: e.target.value })}
                                                placeholder="VD: Chứng chỉ hành nghề X..."
                                                fullWidth
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Select
                                                label="Nhóm máu"
                                                value={formData.bloodType}
                                                onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                                                options={bloodTypeOptions}
                                                placeholder="Chọn nhóm máu"
                                                fullWidth
                                            />
                                            <Input
                                                label="Số thẻ bảo hiểm"
                                                value={formData.insuranceNumber}
                                                onChange={e => setFormData({ ...formData, insuranceNumber: e.target.value })}
                                                leftIcon={<CreditCard size={16} />}
                                                fullWidth
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Textarea
                                                label="Dị ứng"
                                                value={formData.allergies}
                                                onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                                                placeholder="VD: Hải sản, Phấn hoa..."
                                                helperText="Cách nhau bằng dấu phẩy"
                                                fullWidth
                                            />
                                            <Textarea
                                                label="Bệnh mãn tính"
                                                value={formData.chronicDiseases}
                                                onChange={e => setFormData({ ...formData, chronicDiseases: e.target.value })}
                                                placeholder="VD: Tiểu đường, Cao huyết áp..."
                                                helperText="Cách nhau bằng dấu phẩy"
                                                fullWidth
                                            />
                                        </div>
                                        <div className="pt-4 border-t border-slate-700/50">
                                            <div className="flex items-center gap-3 mb-4 px-2">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-500 text-sm font-bold">
                                                    3
                                                </div>
                                                <h4 className="text-lg font-semibold text-slate-100">Liên hệ khẩn cấp</h4>
                                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Quan trọng</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input
                                                    label="Tên người liên hệ"
                                                    value={formData.emergencyContactName}
                                                    onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                                    placeholder="Tên người thân"
                                                    fullWidth
                                                />
                                                <Input
                                                    label="Số điện thoại khẩn cấp"
                                                    value={formData.emergencyContactPhone}
                                                    onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                                    placeholder="0123456789"
                                                    fullWidth
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Danger Zone Section */}
                    <div className="pt-6 border-t border-slate-700/50">
                        <Card className="border-danger/20 bg-danger/5">
                            <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-danger">Vô hiệu hóa tài khoản</h4>
                                    <p className="text-slate-400 text-sm mt-1 max-w-sm">
                                        Một khi bạn vô hiệu hóa tài khoản, bạn sẽ không thể truy cập lại dữ liệu của mình.
                                    </p>
                                </div>
                                <Button variant="ghost" className="text-danger hover:bg-danger/10 border border-danger/20 cursor-pointer">
                                    Vô hiệu hóa ngay
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
