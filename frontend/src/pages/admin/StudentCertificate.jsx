import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';

const StudentCertificate = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const { data } = await API.get(`/admissions/${id}`);
                setStudent(data);
            } catch (err) {
                console.error('Certificate API Error:', err.response?.status, err.response?.data, err.message);
                setError(err.response?.data?.message || err.message || 'Failed to load student data');
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    const handlePrint = () => window.print();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#555' }}>Loading certificate...</div>;
    if (error) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#dc2626' }}>{error}</div>;
    if (!student) return null;

    const courseName = student.courseApplied?.name || 'N/A';
    const courseDuration = student.courseApplied?.duration || '1 Year';
    const regDate = student.registrationDate ? new Date(student.registrationDate) : new Date();
    const issueDate = new Date();
    const endDate = new Date(regDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const formatDate = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const certNo = `PTECH-${student.studentId || 'XXXX'}`;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');

                * { margin: 0; padding: 0; box-sizing: border-box; }

                body { background: #e8e8e8; }

                .cert-page {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 20px auto;
                    background: linear-gradient(160deg, #d4eaf7 0%, #b8d9f0 20%, #a8d4f0 40%, #c8e8f8 60%, #d8f0e8 80%, #c8e8d8 100%);
                    position: relative;
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                }

                .cert-watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 400px;
                    height: 400px;
                    opacity: 0.04;
                    pointer-events: none;
                }

                .cert-watermark img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .cert-border-inner {
                    position: absolute;
                    top: 8mm;
                    left: 8mm;
                    right: 8mm;
                    bottom: 8mm;
                    border: 2px solid rgba(30, 64, 175, 0.15);
                    border-radius: 4px;
                    pointer-events: none;
                }

                .cert-content {
                    padding: 12mm 15mm;
                    position: relative;
                    z-index: 1;
                }

                /* Header Logos Row */
                .cert-header-logos {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .cert-badge {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 7px;
                    font-weight: 700;
                    text-align: center;
                    line-height: 1.1;
                }

                .msme-badge {
                    background: linear-gradient(135deg, #1e3a5f, #2d5a8e);
                    color: white;
                    border: 2px solid #ffd700;
                }

                .digital-india-badge {
                    background: linear-gradient(135deg, #ff6600, #ff9933);
                    color: white;
                    border: 2px solid #cc5200;
                }

                .cert-main-logo {
                    width: 90px;
                    height: 90px;
                }

                .cert-main-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .govt-badge {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1e3a5f, #0a1628);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 6px;
                    color: white;
                    font-weight: 700;
                    border: 1.5px solid #ffd700;
                    text-align: center;
                    line-height: 1;
                }

                /* Institute Name */
                .cert-institute-name {
                    text-align: center;
                    margin-bottom: 3px;
                }

                .cert-institute-name h1 {
                    font-family: 'Outfit', sans-serif;
                    font-size: 32px;
                    font-weight: 900;
                    color: #1E40AF;
                    letter-spacing: 2px;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }

                .cert-institute-name .iso-text {
                    font-size: 12px;
                    font-weight: 600;
                    color: #1e3a5f;
                    margin-top: 2px;
                }

                /* Certificate Title */
                .cert-title {
                    text-align: center;
                    margin: 10px 0 15px;
                }

                .cert-title h2 {
                    font-family: 'Great Vibes', cursive;
                    font-size: 58px;
                    color: #1E40AF;
                    font-weight: 400;
                    line-height: 1;
                }

                /* QR + Badges Row */
                .cert-badges-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                    padding: 0 15mm;
                }

                .cert-side-badges {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    align-items: center;
                }

                .iso-round-badge {
                    width: 55px;
                    height: 55px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ffd700, #f0c000);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 6px;
                    font-weight: 800;
                    color: #1e3a5f;
                    text-align: center;
                    line-height: 1.1;
                    border: 2px solid #c8a000;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }

                .iaf-badge {
                    width: 55px;
                    height: 55px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1a237e, #283593);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffd700;
                    font-weight: 900;
                    font-size: 13px;
                    border: 3px solid #ffd700;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }

                .cert-qr-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }

                .cert-qr {
                    width: 70px;
                    height: 70px;
                    background: white;
                    border: 2px solid #ddd;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    color: #999;
                    text-align: center;
                }

                .cert-qr-label {
                    font-size: 8px;
                    font-weight: 700;
                    color: #1e3a5f;
                    text-align: center;
                    line-height: 1.2;
                }

                /* Photo Section */
                .cert-photo-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .cert-photo {
                    width: 110px;
                    height: 130px;
                    border: 3px solid #1E40AF;
                    border-radius: 8px;
                    object-fit: cover;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                    margin-bottom: 8px;
                    background: #f0f0f0;
                }

                .cert-photo-placeholder {
                    width: 110px;
                    height: 130px;
                    border: 3px solid #1E40AF;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #e8f0fe, #d0e0f0);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    color: #1E40AF;
                    margin-bottom: 8px;
                }

                /* Certify Text */
                .cert-certify {
                    text-align: center;
                    margin-bottom: 8px;
                }

                .cert-certify .certify-text {
                    font-family: 'Great Vibes', cursive;
                    font-size: 22px;
                    color: #333;
                }

                .cert-student-name {
                    text-align: center;
                    margin-bottom: 4px;
                }

                .cert-student-name h3 {
                    font-family: 'Outfit', sans-serif;
                    font-size: 28px;
                    font-weight: 800;
                    color: #111;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .cert-father-name {
                    text-align: center;
                    font-size: 20px;
                    font-weight: 700;
                    color: #111;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }

                .cert-institute-highlight {
                    text-align: center;
                    margin-bottom: 12px;
                }

                .cert-institute-highlight span {
                    background: linear-gradient(135deg, #1E40AF, #3B82F6);
                    color: white;
                    padding: 4px 20px;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 14px;
                    letter-spacing: 1px;
                    display: inline-block;
                }

                /* Exam Details */
                .cert-exam-row {
                    display: flex;
                    justify-content: center;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #333;
                }

                .cert-exam-row .label-italic {
                    font-style: italic;
                }

                .cert-exam-row .value-box {
                    border: 1.5px solid #1E40AF;
                    padding: 2px 12px;
                    border-radius: 4px;
                    font-weight: 700;
                    color: #1E40AF;
                    background: rgba(255,255,255,0.6);
                    min-width: 40px;
                    text-align: center;
                }

                .cert-awarded-text {
                    text-align: center;
                    font-style: italic;
                    font-size: 13px;
                    color: #444;
                    margin-bottom: 6px;
                }

                .cert-course-title {
                    text-align: center;
                    margin-bottom: 4px;
                }

                .cert-course-title h4 {
                    font-family: 'Outfit', sans-serif;
                    font-size: 20px;
                    font-weight: 800;
                    color: #1E40AF;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .cert-course-meta {
                    text-align: center;
                    font-size: 11px;
                    color: #555;
                    font-weight: 600;
                    margin-bottom: 3px;
                }

                .cert-standards-text {
                    text-align: center;
                    margin: 10px 0 5px;
                }

                .cert-standards-text .designed {
                    font-family: 'Great Vibes', cursive;
                    font-size: 18px;
                    color: #333;
                }

                .cert-standards-text .institute-name {
                    font-weight: 900;
                    font-size: 16px;
                    color: #1E40AF;
                    display: block;
                    margin-top: 2px;
                }

                .cert-iso-line {
                    text-align: center;
                    font-size: 11px;
                    font-weight: 600;
                    color: #1e3a5f;
                    margin-bottom: 10px;
                }

                /* Footer */
                .cert-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 10px;
                    padding: 0 5mm;
                }

                .cert-footer-left {
                    text-align: center;
                }

                .cert-footer-left .signature-line {
                    font-family: 'Great Vibes', cursive;
                    font-size: 22px;
                    color: #1e3a5f;
                    margin-bottom: 2px;
                }

                .cert-footer-left .signer-name {
                    font-weight: 800;
                    font-size: 11px;
                    color: #111;
                    text-transform: uppercase;
                }

                .cert-footer-left .signer-title {
                    font-size: 10px;
                    color: #555;
                    font-weight: 600;
                }

                .cert-footer-center {
                    text-align: center;
                    flex: 1;
                }

                .cert-footer-center .cert-number {
                    font-size: 11px;
                    font-weight: 700;
                    color: #111;
                    margin-bottom: 2px;
                }

                .cert-footer-center .cert-date {
                    font-size: 11px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 2px;
                }

                .cert-footer-center .cert-verify {
                    font-size: 9px;
                    color: #777;
                }

                .cert-footer-right {
                    text-align: center;
                }

                .cert-footer-right .iso-badge-sm {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1E40AF, #3B82F6);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 7px;
                    font-weight: 800;
                    line-height: 1.1;
                    margin: 0 auto 4px;
                    border: 2px solid #ffd700;
                }

                .cert-footer-right .director-sig {
                    font-family: 'Great Vibes', cursive;
                    font-size: 20px;
                    color: #1e3a5f;
                    margin-bottom: 2px;
                }

                .cert-footer-right .director-name {
                    font-weight: 800;
                    font-size: 10px;
                    color: #111;
                    text-transform: uppercase;
                }

                .cert-footer-right .director-title {
                    font-size: 9px;
                    font-weight: 600;
                    color: #555;
                }

                /* Address Bar */
                .cert-address-bar {
                    background: linear-gradient(135deg, #1E40AF, #3B82F6);
                    color: white;
                    text-align: center;
                    padding: 8px 15px;
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    margin-top: 12px;
                    line-height: 1.5;
                }

                .cert-address-bar .contact {
                    font-size: 11px;
                    font-weight: 800;
                    margin-top: 2px;
                }

                /* Red seal */
                .cert-seal {
                    width: 50px;
                    height: 50px;
                    background: radial-gradient(circle, #dc2626, #991b1b);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 7px;
                    font-weight: 800;
                    text-align: center;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                    line-height: 1;
                    position: absolute;
                    bottom: 95px;
                    left: 45px;
                }

                /* Print button */
                .print-btn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: linear-gradient(135deg, #1E40AF, #3B82F6);
                    color: white;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 14px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 25px rgba(30,64,175,0.4);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                    font-family: 'Inter', sans-serif;
                }

                .print-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(30,64,175,0.5);
                }

                @media print {
                    body { background: white !important; margin: 0; padding: 0; }
                    .cert-page {
                        margin: 0;
                        box-shadow: none;
                        width: 210mm;
                        min-height: 297mm;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print-btn { display: none !important; }
                    @page { size: A4 portrait; margin: 0; }
                }
            `}</style>

            <button className="print-btn" onClick={handlePrint}>
                🖨️ Print Certificate
            </button>

            <div className="cert-page">
                <div className="cert-watermark"><img src="/logo.png" alt="Pretech" /></div>
                <div className="cert-border-inner" />

                <div className="cert-content">
                    {/* Header Logos */}
                    <div className="cert-header-logos">
                        <div className="cert-badge msme-badge">
                            MSME<br />GOVT OF<br />INDIA
                        </div>
                        <div className="cert-badge digital-india-badge">
                            Digital<br />India
                        </div>
                        <div className="cert-main-logo">
                            <img src="/logo.png" alt="Pretech Computer Education" />
                        </div>
                        <div className="govt-badge">MAKE<br />IN<br />INDIA</div>
                        <div className="govt-badge">भारत<br />सरकार</div>
                    </div>

                    {/* Institute Name */}
                    <div className="cert-institute-name">
                        <h1>PRETECH COMPUTER EDUCATION</h1>
                        <p className="iso-text">An ISO 9001:2015 Certified Organisation</p>
                    </div>

                    {/* Certificate Title */}
                    <div className="cert-title">
                        <h2>Certificate</h2>
                    </div>

                    {/* Badges + QR Row */}
                    <div className="cert-badges-row">
                        <div className="cert-side-badges">
                            <div className="iso-round-badge">ISO<br />9001<br />2015<br />CERTIFIED</div>
                            <div className="iaf-badge">IAF</div>
                        </div>

                        <div className="cert-photo-section">
                            {student.passportPhoto ? (
                                <img src={student.passportPhoto} alt="Student" className="cert-photo" />
                            ) : (
                                <div className="cert-photo-placeholder">👤</div>
                            )}
                        </div>

                        <div className="cert-qr-box">
                            <div className="cert-qr">
                                <span>QR CODE<br />FOR ONLINE<br />VERIFICATION</span>
                            </div>
                            <span className="cert-qr-label">FOR ONLINE<br />VERIFICATION SCAN</span>
                        </div>
                    </div>

                    {/* Certify Text */}
                    <div className="cert-certify">
                        <span className="certify-text">This is to certify that,</span>
                    </div>

                    {/* Student Name */}
                    <div className="cert-student-name">
                        <h3>{student.name}</h3>
                    </div>

                    {/* Father's Name */}
                    {student.fatherHusbandName && (
                        <div className="cert-father-name">
                            {student.gender === 'Female' ? 'D/O' : 'S/O'} {student.fatherHusbandName}
                        </div>
                    )}

                    {/* Institute Highlight */}
                    <div className="cert-institute-highlight">
                        <span>PRETECH COMPUTER EDUCATION</span>
                    </div>

                    {/* Exam Details */}
                    <div className="cert-exam-row">
                        <span className="label-italic">has passed the prescribed examination with</span>
                        <span className="value-box">A</span>
                        <span>Grade (</span>
                        <span className="value-box">85%</span>
                        <span>Marks)</span>
                    </div>

                    <div className="cert-awarded-text">has been awarded the</div>

                    {/* Course Title */}
                    <div className="cert-course-title">
                        <h4>{courseName}</h4>
                    </div>

                    <div className="cert-course-meta">(COURSE DURATION: {courseDuration})</div>
                    <div className="cert-course-meta">(COURSE PERIOD: {formatDate(regDate)} TO {formatDate(endDate)})</div>

                    {/* Standards */}
                    <div className="cert-standards-text">
                        <span className="designed">designed and developed as per the standards of</span>
                        <span className="institute-name">PRETECH COMPUTER EDUCATION</span>
                    </div>

                    <div className="cert-iso-line">An ISO 9001:2015 Certified Organisation</div>

                    {/* Footer */}
                    <div className="cert-footer">
                        <div className="cert-footer-left">
                            <div className="signature-line">Pankaj Gilhotra</div>
                            <div className="signer-name">PANKAJ GILHOTRA</div>
                            <div className="signer-title">Controller Of Examination</div>
                        </div>

                        <div className="cert-footer-center">
                            <div className="cert-number">Certificate No: {certNo}</div>
                            <div className="cert-date">Date Of Issue: {formatDate(issueDate)}</div>
                            <div className="cert-verify">Online Certificate Verification available on:</div>
                        </div>

                        <div className="cert-footer-right">
                            <div className="iso-badge-sm">
                                <span>ISO</span>
                                <span>9001</span>
                                <span>2015</span>
                            </div>
                            <div className="director-sig">Pankaj Gilhotra</div>
                            <div className="director-name">PANKAJ GILHOTRA</div>
                            <div className="director-title">DIRECTOR</div>
                        </div>
                    </div>

                    {/* Seal */}
                    <div className="cert-seal">CERTIFIED<br />★</div>
                </div>

                {/* Address Bar */}
                <div className="cert-address-bar">
                    ADDRESS: PRETECH COMPUTER EDUCATION, BIKANER, RAJASTHAN
                    <div className="contact">CONTACT: PANKAJ GILHOTRA (DIRECTOR)</div>
                </div>
            </div>
        </>
    );
};

export default StudentCertificate;
