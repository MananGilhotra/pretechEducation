import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home/Home';
import CoursesPage from './pages/CoursesPage';
import EnquiryForm from './pages/EnquiryForm';
import AdmissionForm from './pages/AdmissionForm';
import Payment from './pages/Payment';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageCourses from './pages/admin/ManageCourses';
import ViewAdmissions from './pages/admin/ViewAdmissions';
import ViewEnquiries from './pages/admin/ViewEnquiries';
import ViewPayments from './pages/admin/ViewPayments';
import AddAdmission from './pages/admin/AddAdmission';
import InstallmentReports from './pages/admin/InstallmentReports';
import ManageFees from './pages/admin/ManageFees';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <Router>
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3000,
                                style: {
                                    borderRadius: '12px',
                                    background: '#1F2937',
                                    color: '#F9FAFB',
                                    fontSize: '14px',
                                },
                            }}
                        />
                        <Routes>
                            {/* Public Routes */}
                            <Route element={<Layout />}>
                                <Route path="/" element={<Home />} />
                                <Route path="/courses" element={<CoursesPage />} />
                                <Route path="/enquiry" element={<EnquiryForm />} />
                                <Route path="/admission" element={<AdmissionForm />} />
                                <Route path="/payment" element={<Payment />} />
                                <Route path="/payment/success" element={<Payment />} />
                                <Route path="/payment/cancel" element={<Payment />} />
                            </Route>

                            {/* Auth Routes (no layout navbar/footer) */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Admin Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route element={<Layout />}>
                                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                    <Route path="/admin/courses" element={<ManageCourses />} />
                                    <Route path="/admin/admissions" element={<ViewAdmissions />} />
                                    <Route path="/admin/add-admission" element={<AddAdmission />} />
                                    <Route path="/admin/enquiries" element={<ViewEnquiries />} />
                                    <Route path="/admin/payments" element={<ViewPayments />} />
                                    <Route path="/admin/installments" element={<InstallmentReports />} />
                                    <Route path="/admin/fees" element={<ManageFees />} />
                                </Route>
                            </Route>

                            {/* Student Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                                <Route element={<Layout />}>
                                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                                </Route>
                            </Route>

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;
