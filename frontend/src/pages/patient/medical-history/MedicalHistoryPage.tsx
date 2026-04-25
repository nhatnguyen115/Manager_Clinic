import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Loader2, User, ChevronRight, Activity, Pill, PlusCircle } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useAuth } from '@contexts/AuthContext';
import { getMyRecords } from '@services/patientService';
import type { MedicalRecordResponse } from '@/types';

// ─── Record Card Component ──────────────────────────────
const RecordCard = ({ record, isFirst, isLast }: { record: MedicalRecordResponse; isFirst?: boolean; isLast?: boolean }) => {
    const dateObj = new Date(record.createdAt);
    const dayNum = dateObj.getDate().toString().padStart(2, '0');
    const monthStr = dateObj.toLocaleDateString('vi-VN', { month: 'short' });
    const yearNum = dateObj.getFullYear();

    return (
        <Link to={`/medical-history/${record.id}`} className="block group relative">
            <div className="flex gap-6">
                {/* Timeline Connector */}
                <div className="flex flex-col items-center">
                    <div className="relative z-10 w-4 h-4 rounded-full bg-primary-500 border-4 border-slate-950 group-hover:scale-125 transition-transform duration-300" />
                    {!isLast && <div className="w-0.5 flex-1 bg-slate-800 -mt-0.5" />}
                </div>

                {/* Content Card */}
                <div className="flex-1 pb-10">
                    <div className="flex items-start gap-5 p-6 rounded-[24px] border border-slate-700/30 bg-slate-800/20 hover:border-primary-700/40 hover:bg-slate-800/40 transition-all duration-300 shadow-sm hover:shadow-wellness group">
                        {/* Date Block */}
                        <div className="flex-shrink-0 w-16 h-16 bg-slate-800/60 rounded-2xl flex flex-col items-center justify-center text-slate-50 border border-slate-700/50 group-hover:border-primary-500/30 transition-colors">
                            <span className="text-2xl font-black leading-none">{dayNum}</span>
                            <span className="text-[10px] uppercase font-bold mt-1 text-slate-400">{monthStr}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xl font-bold text-slate-50 truncate group-hover:text-primary-400 transition-colors">{record.diagnosis}</h4>
                                <span className="text-xs font-bold text-slate-500">{yearNum}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                                <span className="flex items-center gap-2 px-3 py-1 bg-slate-800/40 rounded-full border border-slate-700/30">
                                    <User size={14} className="text-primary-500" />
                                    BS. {record.doctorName}
                                </span>
                                {record.symptoms && (
                                    <span className="flex items-center gap-2 truncate max-w-[250px] italic">
                                        <Activity size={14} className="text-slate-600" />
                                        {record.symptoms}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Badge variant="info" className="border-slate-700 text-slate-400 bg-slate-900/40 rounded-lg py-1 px-3">
                                    <Pill size={12} className="mr-1.5 text-blue-500" /> Có đơn thuốc
                                </Badge>
                                {isFirst && (
                                    <Badge variant="primary" className="rounded-lg py-1 px-3">
                                        <PlusCircle size={12} className="mr-1.5" /> Theo dõi mới
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="self-center w-10 h-10 rounded-full bg-slate-900/50 flex items-center justify-center text-slate-600 group-hover:text-primary-400 group-hover:bg-primary-900/20 transition-all">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const MedicalHistoryPage = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user?.id) return;
        const load = async () => {
            try {
                setIsLoading(true);
                const data = await getMyRecords();
                setRecords(data);
            } catch (error) {
                console.error('Failed to load medical records:', error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [user?.id]);

    const filteredRecords = useMemo(() => {
        if (!searchQuery.trim()) return records;
        const q = searchQuery.toLowerCase();
        return records.filter(r =>
            r.doctorName.toLowerCase().includes(q) ||
            r.diagnosis.toLowerCase().includes(q) ||
            r.symptoms?.toLowerCase().includes(q)
        );
    }, [records, searchQuery]);

    // Stats
    const lastVisitDate = records.length > 0
        ? new Date(records[0].createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })
        : null;

    return (
        <div className="space-y-8 animate-fade-in">
            <section>
                <h1 className="text-3xl font-bold text-slate-50 tracking-tight flex items-center gap-3">
                    <Activity size={28} className="text-primary-400" />
                    Lịch sử khám bệnh
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                    Theo dõi các buổi khám, chẩn đoán và đơn thuốc của bạn.
                </p>
            </section>

            {/* Summary Stats */}
            {!isLoading && records.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-stat rounded-xl p-4 transition-all duration-200">
                        <p className="text-2xl font-black text-slate-50">{records.length}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Tổng bệnh án</p>
                    </div>
                    <div className="glass-stat rounded-xl p-4 transition-all duration-200">
                        <p className="text-sm font-bold text-slate-50 mt-1">{lastVisitDate}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Khám gần nhất</p>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo bác sĩ, chẩn đoán..."
                    className="w-full bg-slate-800 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all placeholder:text-slate-600 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Records List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-primary-500" />
                </div>
            ) : filteredRecords.length > 0 ? (
                <div className="relative pl-2 pt-4">
                    {filteredRecords.map((record, index) => (
                        <RecordCard
                            key={record.id}
                            record={record}
                            isFirst={index === 0}
                            isLast={index === filteredRecords.length - 1}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                    <div className="w-16 h-16 bg-slate-800/60 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                        <FileText size={28} />
                    </div>
                    <p className="text-slate-400 font-medium text-lg">
                        {searchQuery ? 'Không tìm thấy hồ sơ phù hợp' : 'Chưa có bệnh án nào'}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                        {searchQuery ? 'Thử tìm kiếm với từ khóa khác.' : 'Dữ liệu sẽ xuất hiện sau khi bạn hoàn tất buổi khám.'}
                    </p>
                    {searchQuery && (
                        <Button variant="ghost" size="sm" className="mt-4 text-primary-500" onClick={() => setSearchQuery('')}>
                            Xóa tìm kiếm
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MedicalHistoryPage;
