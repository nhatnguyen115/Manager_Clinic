import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@components/common/ProtectedRoute';
import { MainLayout } from '@components/layout/MainLayout';
import { Loading } from '@components/ui/Loading';

// Public Pages
const HomePage = lazy(() => import('@pages/HomePage'));
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'));
const ForbiddenPage = lazy(() => import('@pages/ForbiddenPage'));

// Patient Pages
const PatientDashboardPage = lazy(() => import('@pages/patient/DashboardPage'));
const SelectSpecialtyPage = lazy(() => import('@pages/patient/appointments/SelectSpecialtyPage'));
const SelectDoctorPage = lazy(() => import('@pages/patient/appointments/SelectDoctorPage'));
const SelectDateTimePage = lazy(() => import('@pages/patient/appointments/SelectDateTimePage'));
const ConfirmBookingPage = lazy(() => import('@pages/patient/appointments/ConfirmBookingPage'));
const BookingSuccessPage = lazy(() => import('@pages/patient/appointments/BookingSuccessPage'));
const MedicalHistoryPage = lazy(() => import('@pages/patient/medical-history/MedicalHistoryPage'));
const RecordDetailPage = lazy(() => import('@pages/patient/medical-history/RecordDetailPage'));
const ProfilePage = lazy(() => import('@pages/patient/ProfilePage'));
const MyAppointmentsPage = lazy(() => import('@pages/patient/appointments/MyAppointmentsPage'));
const AppointmentDetailPage = lazy(() => import('@pages/patient/appointments/AppointmentDetailPage'));
const CheckoutPage = lazy(() => import('@pages/payment/CheckoutPage'));
const PaymentResultPage = lazy(() => import('@pages/payment/PaymentResultPage'));
const PaymentHistoryPage = lazy(() => import('@pages/payment/PaymentHistoryPage'));
const InvoiceDetailPage = lazy(() => import('@pages/payment/InvoiceDetailPage'));

// Doctor Pages


const DoctorDashboardPage = lazy(() => import('@pages/doctor/DashboardPage'));
const AppointmentListPage = lazy(() => import('@pages/doctor/appointments/AppointmentListPage'));
const CalendarPage = lazy(() => import('@pages/doctor/appointments/CalendarPage'));
const SchedulePage = lazy(() => import('@pages/doctor/schedule/SchedulePage'));
const PatientListPage = lazy(() => import('@pages/doctor/patients/PatientListPage'));
const PatientHistoryPage = lazy(() => import('@pages/doctor/patients/PatientHistoryPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('@pages/admin/DashboardPage'));
const AdminUserListPage = lazy(() => import('@pages/admin/users/UsersListPage'));
const AdminDoctorListPage = lazy(() => import('@pages/admin/doctors/DoctorsListPage'));
const AdminPatientListPage = lazy(() => import('@pages/admin/patients/PatientsListPage'));
const AdminSpecialtyListPage = lazy(() => import('@pages/admin/specialties/SpecialtiesListPage'));
const AdminAppointmentListPage = lazy(() => import('@pages/admin/appointments/AppointmentListPage'));
const AdminInvoicesListPage = lazy(() => import('@pages/admin/invoices/InvoicesListPage'));
const AdminReportsPage = lazy(() => import('@pages/admin/reports/ReportsDashboardPage'));

export const AppRouter = () => {

    return (
        <Suspense fallback={<Loading fullPage text="Đang tải dữ liệu..." />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Patient Routes */}
                <Route element={<ProtectedRoute roles={['PATIENT']} />}>
                    <Route path="/dashboard" element={<MainLayout><PatientDashboardPage /></MainLayout>} />
                    <Route path="/booking/specialty" element={<MainLayout><SelectSpecialtyPage /></MainLayout>} />
                    <Route path="/booking/doctor/:specialtyId" element={<MainLayout><SelectDoctorPage /></MainLayout>} />
                    <Route path="/booking/date-time/:specialtyId/:doctorId" element={<MainLayout><SelectDateTimePage /></MainLayout>} />
                    <Route path="/booking/confirm/:specialtyId/:doctorId" element={<MainLayout><ConfirmBookingPage /></MainLayout>} />
                    <Route path="/booking/success" element={<MainLayout><BookingSuccessPage /></MainLayout>} />
                    <Route path="/medical-history" element={<MainLayout><MedicalHistoryPage /></MainLayout>} />
                    <Route path="/medical-history/:recordId" element={<MainLayout><RecordDetailPage /></MainLayout>} />
                    <Route path="/appointments" element={<MainLayout><MyAppointmentsPage /></MainLayout>} />
                    <Route path="/appointments/:id" element={<MainLayout><AppointmentDetailPage /></MainLayout>} />
                    <Route path="/checkout/:appointmentId" element={<MainLayout><CheckoutPage /></MainLayout>} />
                    <Route path="/payment/result" element={<MainLayout><PaymentResultPage /></MainLayout>} />
                    <Route path="/payment/history" element={<MainLayout><PaymentHistoryPage /></MainLayout>} />
                    <Route path="/invoice/:invoiceId" element={<MainLayout><InvoiceDetailPage /></MainLayout>} />
                </Route>



                {/* Doctor Portal Routes */}
                <Route element={<ProtectedRoute roles={['DOCTOR']} />}>
                    <Route
                        path="/doctor/*"
                        element={
                            <MainLayout>
                                <Routes>
                                    <Route path="dashboard" element={<DoctorDashboardPage />} />
                                    <Route path="appointments" element={<AppointmentListPage />} />
                                    <Route path="calendar" element={<CalendarPage />} />
                                    <Route path="schedule" element={<SchedulePage />} />
                                    <Route path="patients" element={<PatientListPage />} />
                                    <Route path="patients/:patientId/history" element={<PatientHistoryPage />} />
                                </Routes>
                            </MainLayout>
                        }
                    />
                </Route>

                {/* Admin Portal Routes */}
                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                    <Route
                        path="/admin/*"
                        element={
                            <MainLayout>
                                <Routes>
                                    <Route path="dashboard" element={<AdminDashboardPage />} />
                                    <Route path="users" element={<AdminUserListPage />} />
                                    <Route path="doctors" element={<AdminDoctorListPage />} />
                                    <Route path="patients" element={<AdminPatientListPage />} />
                                    <Route path="specialties" element={<AdminSpecialtyListPage />} />
                                    <Route path="appointments" element={<AdminAppointmentListPage />} />
                                    <Route path="invoices" element={<AdminInvoicesListPage />} />
                                    <Route path="reports" element={<AdminReportsPage />} />
                                </Routes>

                            </MainLayout>
                        }
                    />
                </Route>

                {/* Shared Protected Routes */}
                <Route element={<ProtectedRoute roles={['PATIENT', 'DOCTOR', 'ADMIN']} />}>
                    <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
                </Route>

                <Route path="/forbidden" element={<ForbiddenPage />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRouter;
