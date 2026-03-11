import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, FileText, Plus, Calendar, Phone,
    Stethoscope, Pill, ChevronDown, Edit3,
    HeartPulse, Activity, UserCheck, ShieldCheck, MapPin, Mail, Droplets, CircleDot
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Loading } from '@components/ui/Loading';
import MedicalRecordFormModal from '@components/doctor/MedicalRecordFormModal';
import { getPatientById, getPatientRecords, updateMedicalRecord } from '@services/doctorService';
import type { PatientResponse, MedicalRecordResponse } from '@/types';

const PatientHistoryPage = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [patient, setPatient] = useState<PatientResponse | null>(null);
    const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
    const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MedicalRecordResponse | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!patientId) return;
            try {
                setIsLoading(true);
                const [patientData, recordsData] = await Promise.all([
                    getPatientById(patientId),
                    getPatientRecords(patientId),
                ]);
                setPatient(patientData);
                setRecords(recordsData);
                if (recordsData.length > 0) setExpandedRecord(recordsData[0].id);
            } catch (error) {
                console.error('Failed to load patient history:', error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [patientId]);

    const getAge = (dob: string) => {
        if (!dob) return 0;
        const birth = new Date(dob);
        const today = new Date();
        if (isNaN(birth.getTime())) return 0;
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const handleCreateRecord = () => { setEditingRecord(null); setShowForm(true); };
    const handleEditRecord = (record: MedicalRecordResponse) => { setEditingRecord(record); setShowForm(true); };

    const handleSaveRecord = async (data: any) => {
        try {
            if (editingRecord) {
                const updated = await updateMedicalRecord(editingRecord.id, {
                    appointmentId: editingRecord.appointmentId,
                    ...data
                });
                setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
            } else {
                alert('Vui lòng tạo bệnh án mới từ chi tiết lịch hẹn để đảm bảo gắn với phiên khám cụ thể.');
                return;
            }
        } catch (error) {
            console.error('Failed to save record:', error);
            alert('Có lỗi xảy ra khi lưu bệnh án. Vui lòng kiểm tra lại dữ liệu.');
        }
        setShowForm(false);
        setEditingRecord(null);
    };

    if (isLoading) return <Loading fullPage text="Đang tải lịch sử bệnh án..." />;
    if (!patient) return <div className="text-center py-24 text-slate-400 bg-slate-900/20 rounded-3xl border border-dashed border-slate-700 m-6">Không tìm thấy thông tin bệnh nhân</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/doctor/patients"
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-primary-400 hover:border-primary-700/50 transition-all shadow-lg active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-50">Chi tiết bệnh nhân</h1>
                            <Badge variant="primary" size="sm" className="bg-primary-900/30 text-primary-400 border-primary-800/50 uppercase tracking-widest px-2">Hồ sơ</Badge>
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">Mã BN: <span className="font-mono text-slate-200 uppercase">{patient.id.slice(-8)}</span></p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    className="shadow-xl shadow-primary-900/20 bg-primary-600 hover:bg-primary-500 text-white font-bold"
                    onClick={handleCreateRecord}
                >
                    <Plus size={18} className="mr-2" /> Tạo bệnh án mới
                </Button>
            </div>

            {/* Patient Hero Card */}
            <PatientHeroCard patient={patient} getAge={getAge} />

            {/* Medical Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                            <Activity size={18} className="text-primary-500" />
                            Lịch sử khám bệnh
                        </h3>
                        <span className="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50">
                            {records.length} phiên khám
                        </span>
                    </div>

                    {records.length === 0 ? (
                        <Card className="bg-slate-900/30 border-dashed">
                            <CardContent className="py-20 text-center">
                                <FileText size={48} className="mx-auto text-slate-700 mb-4 opacity-50" />
                                <p className="text-slate-400 font-medium italic">Bệnh nhân chưa có lịch sử khám bệnh tại phòng khám.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {records.map(record => (
                                <TimelineItem
                                    key={record.id}
                                    record={record}
                                    isExpanded={expandedRecord === record.id}
                                    onToggle={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                                    onEdit={() => handleEditRecord(record)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column - Secondary Info */}
                <div className="space-y-6">
                    {/* Allergy & Health Alerts */}
                    <Card className="border-red-900/30 bg-red-900/5 overflow-hidden">
                        <div className="h-1 bg-red-600" />
                        <CardHeader
                            title="Cảnh báo sức khỏe"
                            icon={<ShieldCheck size={18} className="text-red-500" />}
                            className="pb-2"
                        />
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-[10px] text-red-400 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <CircleDot size={8} /> Dị ứng
                                </p>
                                {patient.allergies && patient.allergies.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {patient.allergies.map((a, i) => (
                                            <span key={i} className="px-2 py-1 rounded bg-red-900/20 text-red-200 text-xs font-bold border border-red-800/30 lowercase">
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Không có thông tin dị ứng</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vitals Summary Card (if available from last record) */}
                    {records.length > 0 && records[0].vitalSigns && (
                        <Card className="border-sky-900/30 bg-sky-900/5">
                            <CardHeader
                                title="Chỉ số gần nhất"
                                icon={<HeartPulse size={18} className="text-sky-500" />}
                                className="pb-2"
                            />
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(records[0].vitalSigns).map(([label, value]) => (
                                        <div key={label} className="bg-slate-900/50 p-2.5 rounded-xl border border-sky-800/10 hover:border-sky-500/20 transition-colors">
                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">
                                                {label === 'bloodPressure' ? 'Huyết áp' : label === 'heartRate' ? 'Nhịp tim' : label === 'temperature' ? 'Nhiệt độ' : label === 'weight' ? 'Cân nặng' : label.replace(/([A-Z])/g, ' $1').trim()}
                                            </p>
                                            <p className="text-sm font-bold text-sky-400">{String(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <MedicalRecordFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingRecord(null); }}
                onSave={handleSaveRecord}
                editData={editingRecord ? {
                    id: editingRecord.id,
                    diagnosis: editingRecord.diagnosis,
                    symptoms: editingRecord.symptoms,
                    vitalSigns: editingRecord.vitalSigns || {},
                    treatment: editingRecord.treatment || '',
                    notes: editingRecord.notes || '',
                    followUpDate: editingRecord.followUpDate,
                    prescription: editingRecord.prescription ? {
                        notes: editingRecord.prescription.notes || '',
                        details: editingRecord.prescription.details?.map(d => ({
                            id: d.id || 0,
                            medicineName: d.medicineName,
                            dosage: d.dosage,
                            frequency: d.frequency,
                            duration: d.duration || '',
                            instructions: d.instructions || '',
                            quantity: d.quantity
                        })) || [],
                    } : undefined,
                } : null}
                patientName={patient.fullName}
            />
        </div>
    );
};

const PatientHeroCard = ({ patient, getAge }: { patient: PatientResponse; getAge: (d: string) => number }) => (
    <Card className="border-slate-700/50 bg-slate-950/80 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary-600/10 blur-[60px] rounded-full -mr-16 -mt-16" />
        <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row border-l-4 border-l-primary-600">
                {/* Profile Section */}
                <div className="p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 lg:border-r lg:border-r-slate-800 flex-1">
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center shadow-2xl relative">
                        <span className="text-4xl font-black text-white">{patient.fullName ? patient.fullName.charAt(0) : '?'}</span>
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-slate-900 border-2 border-primary-600 flex items-center justify-center">
                            <UserCheck size={16} className="text-primary-500" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-50 tracking-tight">{patient.fullName}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-2">
                            <Badge variant="default" size="sm" className="bg-slate-800 text-slate-300 border-slate-700 font-bold px-3">
                                {patient.gender === 'MALE' ? 'Nam' : 'Nữ'}
                            </Badge>
                            {patient.dateOfBirth && (
                                <Badge variant="default" size="sm" className="bg-slate-800 text-slate-300 border-slate-700 font-bold px-3">
                                    {getAge(patient.dateOfBirth)} tuổi
                                </Badge>
                            )}
                            {patient.bloodType && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/30 text-red-400 border border-red-900/20 text-xs font-black">
                                    <Droplets size={12} /> {patient.bloodType}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/20 lg:w-1/3">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700"><Phone size={14} /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">Số điện thoại</p>
                                <p className="text-sm font-semibold text-slate-200">{patient.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700"><Mail size={14} /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">Email</p>
                                <p className="text-xs font-medium text-slate-300 truncate max-w-[150px]">{patient.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700"><Calendar size={14} /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">Ngày sinh</p>
                                <p className="text-sm font-semibold text-slate-200">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700"><MapPin size={14} /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">Địa chỉ</p>
                                <p className="text-sm font-semibold text-slate-200 truncate max-w-[150px]">{patient.address || 'Hà Nội, Việt Nam'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

const TimelineItem = ({ record, isExpanded, onToggle, onEdit }: { record: MedicalRecordResponse; isExpanded: boolean; onToggle: () => void; onEdit: () => void }) => (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-primary-700/50 bg-slate-900/40 shadow-2xl' : 'border-slate-700/50 hover:bg-slate-800/30'}`}>
        <button onClick={onToggle} className="w-full flex items-center gap-4 p-4 text-left group">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${isExpanded ? 'bg-primary-600 shadow-lg shadow-primary-900/20 text-white' : 'bg-slate-800 text-primary-400 border border-slate-700 group-hover:border-primary-600/50'}`}>
                <Stethoscope size={20} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-base font-bold text-slate-50 tracking-tight">{record.diagnosis}</p>
                    {record.prescription && <Badge variant="success" size="sm" className="bg-emerald-950/30 text-emerald-400 border-emerald-900/20 font-bold px-2 py-0.5"><Pill size={11} className="mr-1.5" /> Có đơn thuốc</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(record.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                    <span className="text-slate-700">•</span>
                    <p className="text-xs font-medium text-slate-400">Bác sĩ: <span className="text-slate-200">{record.doctorName || 'Bs. Đang cập nhật'}</span></p>
                </div>
            </div>

            <div className="flex items-center gap-3 pr-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-primary-400 hover:bg-primary-900/20 transition-all border border-transparent hover:border-primary-800/50"
                    title="Chỉnh sửa ghi chú"
                >
                    <Edit3 size={15} />
                </button>
                <div className={`h-8 w-8 flex items-center justify-center rounded-full transition-all ${isExpanded ? 'bg-primary-900/20 text-primary-400 rotate-180' : 'text-slate-600'}`}>
                    <ChevronDown size={18} />
                </div>
            </div>
        </button>

        {isExpanded && <DetailedRecordView record={record} />}
    </div>
);

const DetailedRecordView = ({ record }: { record: MedicalRecordResponse }) => (
    <div className="border-t border-slate-700/30 p-6 bg-slate-950/20 animate-fade-in space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-500" /> Triệu chứng & Khám lâm sàng
                </h4>
                <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/60 leading-relaxed text-slate-200 text-sm">
                    {record.symptoms || "Không có ghi chú triệu chứng cụ thể."}
                </div>
            </section>

            <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Chỉ số sinh hiệu
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {record.vitalSigns && typeof record.vitalSigns === 'object' ? (
                        Object.entries(record.vitalSigns).map(([label, value]) => (
                            <div key={label} className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center text-center">
                                <p className="text-[9px] text-slate-500 uppercase font-black leading-tight mb-1">
                                    {label === 'bloodPressure' ? 'Huyết áp' : label === 'heartRate' ? 'Nhịp tim' : label === 'temperature' ? 'Nhiệt độ' : label === 'weight' ? 'Cân nặng' : label.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-sm font-black text-sky-400">{String(value)}</p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-4 text-center text-xs text-slate-500 italic">Không có dữ liệu sinh hiệu.</div>
                    )}
                </div>
            </section>
        </div>

        <section>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Chẩn đoán & Xử trí
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-900/10 border border-indigo-900/20 rounded-2xl p-4">
                    <p className="text-[9px] font-bold text-indigo-400 uppercase mb-1">Chẩn đoán chính</p>
                    <p className="text-base font-bold text-slate-50">{record.diagnosis}</p>
                </div>
                <div className="bg-emerald-900/5 border border-emerald-900/10 rounded-2xl p-4">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase mb-1">Hướng điều trị</p>
                    <p className="text-sm text-slate-300">{record.treatment || "Theo dõi và điều trị triệu chứng."}</p>
                </div>
            </div>
        </section>

        {record.notes && (
            <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Ghi chú bác sĩ
                </h4>
                <p className="text-xs text-slate-400 italic bg-slate-900/30 p-3 rounded-xl border border-slate-800 border-l-4 border-l-slate-700">
                    "{record.notes}"
                </p>
            </section>
        )}

        {record.followUpDate && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-900/10 border border-amber-900/20 rounded-2xl text-amber-500">
                <Calendar size={16} className="animate-pulse" />
                <span className="text-sm font-black uppercase tracking-widest">Hẹn tái khám: {new Date(record.followUpDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
        )}

        {record.prescription && (
            <section className="animate-slide-up">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[3px] mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Thông tin đơn thuốc
                </h4>
                <div className="border border-emerald-900/20 rounded-3xl p-6 bg-emerald-950/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-40 w-40 bg-emerald-600/5 blur-[50px] -ml-20 -mt-20" />

                    <div className="flex items-center justify-between mb-6 relative">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20"><Pill size={20} /></div>
                            <div>
                                <h5 className="text-lg font-black text-slate-50">Toa thuốc điện tử</h5>
                                {record.prescription.prescriptionNumber && <p className="text-[10px] font-mono text-emerald-500 font-bold">Ref: {record.prescription.prescriptionNumber}</p>}
                            </div>
                        </div>
                        {record.prescription.validUntil && (
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Có giá trị đến</p>
                                <p className="text-xs font-black text-slate-200">{new Date(record.prescription.validUntil).toLocaleDateString('vi-VN')}</p>
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto relative">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800">
                                    <th className="text-left py-4 px-2">#</th>
                                    <th className="text-left py-4 px-2">Tên dược phẩm</th>
                                    <th className="text-left py-4 px-2">Liều lượng</th>
                                    <th className="text-left py-4 px-2">Cách dùng</th>
                                    <th className="text-right py-4 px-2">Số lượng</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {record.prescription.details?.map((item, i) => (
                                    <tr key={item.id || i} className="group hover:bg-slate-800/20 transition-colors">
                                        <td className="py-4 px-2 text-xs font-mono text-slate-600">{String(i + 1).padStart(2, '0')}</td>
                                        <td className="py-4 px-2">
                                            <p className="text-sm font-black text-slate-100 group-hover:text-emerald-400 transition-colors">{item.medicineName}</p>
                                            <p className="text-[10px] text-slate-500 italic mt-0.5">{item.instructions || "Dùng theo chỉ định."}</p>
                                        </td>
                                        <td className="py-4 px-2 text-xs text-slate-300 font-bold">{item.dosage}</td>
                                        <td className="py-4 px-2 text-xs text-slate-400">{item.frequency} <span className="text-slate-600">trong</span> {item.duration}</td>
                                        <td className="py-4 px-2 text-right text-sm font-black text-emerald-500">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {record.prescription.notes && (
                        <div className="mt-6 pt-4 border-t border-slate-800 flex items-start gap-2">
                            <span className="text-emerald-500 text-lg leading-none mt-0.5">“</span>
                            <p className="text-xs text-slate-400 italic">{record.prescription.notes}</p>
                        </div>
                    )}
                </div>
            </section>
        )}
    </div>
);

export default PatientHistoryPage;
