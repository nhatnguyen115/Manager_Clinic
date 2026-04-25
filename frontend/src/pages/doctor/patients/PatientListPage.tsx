import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    User,
    Phone,
    Mail,
    ChevronRight,
    Users,
    CircleDot,
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Loading } from '@components/ui/Loading';
import { Button } from '@components/ui/Button';
import { Link } from 'react-router-dom';
import type { PatientResponse } from '@/types';
import { getMyPatients } from '@services/doctorService';

const PatientListPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [patients, setPatients] = useState<PatientResponse[]>([]);
    const [filterGender, setFilterGender] = useState<string>('ALL');

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const data = await getMyPatients();
                setPatients(data);
            } catch (error) {
                console.error('Failed to load patients:', error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const filteredPatients = useMemo(() => {
        let result = patients;

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.fullName?.toLowerCase() || '').includes(q) ||
                (p.phoneNumber || '').includes(q) ||
                (p.email?.toLowerCase() || '').includes(q)
            );
        }

        // Gender filter
        if (filterGender !== 'ALL') {
            result = result.filter(p => p.gender === filterGender);
        }

        return result;
    }, [searchQuery, patients, filterGender]);

    const getAge = (dob?: string) => {
        if (!dob) return '';
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
        return `${age} tuổi`;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-primary-500 mb-1">
                        <Users size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">Quản lý bệnh nhân</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Danh sách bệnh nhân</h1>
                    <p className="text-slate-400 mt-1">Theo dõi và quản lý hồ sơ sức khỏe của bệnh nhân</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary-900/30 flex items-center justify-center">
                            <Users size={20} className="text-primary-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Tổng số</p>
                            <p className="text-lg font-bold text-slate-50">{patients.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters bar */}
            <Card className="border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input
                                placeholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-800/40 border-slate-700 focus:border-primary-500/50"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                                <button
                                    onClick={() => setFilterGender('ALL')}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filterGender === 'ALL' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Tất cả
                                </button>
                                <button
                                    onClick={() => setFilterGender('MALE')}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filterGender === 'MALE' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Nam
                                </button>
                                <button
                                    onClick={() => setFilterGender('FEMALE')}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filterGender === 'FEMALE' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Nữ
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content area */}
            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loading text="Đang tải dữ liệu bệnh nhân..." />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <p className="text-sm text-slate-400">
                            Hiển thị <span className="text-slate-200 font-bold">{filteredPatients.length}</span> bệnh nhân
                            {searchQuery && <span> cho từ khóa "<span className="text-primary-400 font-medium">{searchQuery}</span>"</span>}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredPatients.map(patient => (
                            <Link
                                key={patient.id}
                                to={`/doctor/patients/${patient.id}/history`}
                                className="block group"
                            >
                                <Card className="h-full border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/60 transition-all duration-300 group-hover:border-primary-700/40 group-hover:shadow-2xl group-hover:shadow-primary-900/20 active:scale-[0.98] overflow-hidden">
                                    <div className="h-1.5 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent group-hover:via-primary-500/50 transition-all" />
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-5">
                                            {/* Avatar with Status Ring */}
                                            <div className="relative flex-shrink-0">
                                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform duration-500">
                                                    <span className="text-xl font-black text-white">
                                                        {patient.fullName ? patient.fullName.charAt(0) : '?'}
                                                    </span>
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-slate-900 border-2 border-slate-900 flex items-center justify-center">
                                                    <CircleDot size={10} className="text-emerald-500 fill-emerald-500" />
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="text-base font-bold text-slate-50 truncate group-hover:text-primary-400 transition-colors">
                                                        {patient.fullName}
                                                    </h3>
                                                    <ChevronRight size={16} className="text-slate-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                </div>

                                                <div className="mt-3 space-y-2">
                                                    <div className="flex items-center gap-3 py-1 border-b border-slate-700/30">
                                                        <div className="w-4 flex justify-center"><Phone size={13} className="text-slate-500" /></div>
                                                        <span className="text-xs text-slate-300 font-medium">{patient.phoneNumber || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 py-1 border-b border-slate-700/30">
                                                        <div className="w-4 flex justify-center"><Mail size={13} className="text-slate-500" /></div>
                                                        <span className="text-xs text-slate-400 truncate">{patient.email}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-1">
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <div className="w-4 flex justify-center"><User size={13} className="text-slate-500" /></div>
                                                            <span>{patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
                                                        </div>
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                                                            {patient.dateOfBirth ? getAge(patient.dateOfBirth) : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {filteredPatients.length === 0 && (
                        <div className="text-center py-24 bg-slate-900/20 rounded-3xl border border-dashed border-slate-700 shadow-inner">
                            <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-200">Không có kết quả</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Chúng em không tìm thấy bệnh nhân nào khớp với từ khóa "<span className="text-primary-400 font-medium">{searchQuery}</span>"</p>
                            <Button
                                variant="ghost"
                                className="mt-6 text-primary-500"
                                onClick={() => { setSearchQuery(''); setFilterGender('ALL'); }}
                            >
                                Xóa tất cả bộ lọc
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PatientListPage;
