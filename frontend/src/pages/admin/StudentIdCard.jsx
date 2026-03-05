import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';

const StudentIdCard = () => {
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
                console.error('ID Card API Error:', err.response?.status, err.response?.data, err.message);
                setError(err.response?.data?.message || err.message || 'Failed to load student data');
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    const handlePrint = () => window.print();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#555' }}>Loading ID card...</div>;
    if (error) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#dc2626' }}>{error}</div>;
    if (!student) return null;

    const courseName = student.courseApplied?.name || 'N/A';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Great+Vibes&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { background: #1a1a2e; }

                .id-page-wrapper {
                    display: flex; justify-content: center; align-items: center;
                    min-height: 100vh; padding: 40px 20px;
                }

                /* ===== AADHAAR-SIZED LANDSCAPE ID CARD (85.6mm × 53.98mm) ===== */
                .id-card {
                    width: 85.6mm; height: 53.98mm;
                    background: linear-gradient(145deg, #fdf8ef 0%, #f5e6c8 40%, #ecd9a8 70%, #f0deb0 100%);
                    border-radius: 8px; position: relative; overflow: hidden;
                    font-family: 'Inter', sans-serif;
                    box-shadow: 0 10px 35px rgba(0,0,0,0.35), 0 0 0 1px rgba(200,160,80,0.5);
                    display: flex; flex-direction: column;
                }

                /* Top maroon header */
                .id-header {
                    background: linear-gradient(135deg, #5a0000, #8B0000, #a01010);
                    padding: 4px 8px;
                    display: flex; align-items: center; gap: 5px;
                    position: relative; flex-shrink: 0;
                    border-bottom: 1.5px solid #ffd700;
                }
                .id-header::after {
                    content: ''; position: absolute; bottom: -3px; left: 0; right: 0;
                    height: 1.5px; background: linear-gradient(90deg, transparent, #ffd700, transparent);
                }

                .id-header-logo { width: 22px; height: 22px; flex-shrink: 0; }
                .id-header-logo img { width: 100%; height: 100%; object-fit: contain; }

                .id-header-text { flex: 1; }
                .id-header-title {
                    font-family: 'Outfit', sans-serif; font-size: 8px; font-weight: 900;
                    color: #ffd700; letter-spacing: 0.8px;
                    text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.5);
                }
                .id-header-sub { font-size: 4.5px; color: #f0d080; font-weight: 600; letter-spacing: 0.3px; }

                .id-header-badges { display: flex; gap: 3px; flex-shrink: 0; }
                .id-hdr-badge {
                    width: 16px; height: 16px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.5px; font-weight: 700; text-align: center; line-height: 1;
                }
                .id-hdr-msme { background: linear-gradient(135deg, #1e3a5f, #2d5a8e); color: white; border: 0.5px solid #ffd700; }
                .id-hdr-digital { background: linear-gradient(135deg, #ff6600, #ff9933); color: white; border: 0.5px solid #cc5200; }

                /* ID CARD title bar */
                .id-title-bar {
                    background: linear-gradient(90deg, rgba(139,0,0,0.08), rgba(139,0,0,0.15), rgba(139,0,0,0.08));
                    text-align: center; padding: 1.5px 0; flex-shrink: 0;
                    border-bottom: 0.5px solid rgba(139,0,0,0.1);
                }
                .id-title-bar h2 {
                    font-family: 'Outfit', sans-serif; font-size: 9px; font-weight: 900;
                    color: #8B0000; letter-spacing: 3px;
                    text-shadow: 0 0.5px 1px rgba(0,0,0,0.08);
                }

                /* Body: left photo + right details */
                .id-body {
                    display: flex; flex: 1; padding: 4px 6px; gap: 6px;
                    position: relative; overflow: hidden;
                }

                /* Watermark */
                .id-watermark {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 70px; height: 70px; opacity: 0.05; pointer-events: none;
                }
                .id-watermark img { width: 100%; height: 100%; object-fit: contain; }

                /* Left column: photo + ISO */
                .id-left {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 2px; flex-shrink: 0; position: relative; z-index: 1;
                }
                .id-student-photo {
                    width: 48px; height: 56px; border-radius: 4px;
                    border: 1.5px solid #8B0000; object-fit: cover;
                    box-shadow: 0 2px 6px rgba(139,0,0,0.25); background: #f5e6c8;
                }
                .id-photo-placeholder {
                    width: 48px; height: 56px; border-radius: 4px;
                    border: 1.5px solid #8B0000;
                    background: linear-gradient(135deg, #f5e6c8, #ecd9a8);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 16px; color: #8B0000;
                }
                .id-iso-mini {
                    width: 18px; height: 18px; border-radius: 50%;
                    background: linear-gradient(135deg, #ffd700, #f0c000);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    font-size: 2.5px; font-weight: 800; color: #1e3a5f;
                    text-align: center; line-height: 1.1; border: 0.8px solid #c8a000;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                }

                /* Right column: fields */
                .id-right { flex: 1; position: relative; z-index: 1; display: flex; flex-direction: column; }
                .id-fields-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 1.5px 6px;
                    flex: 1;
                }
                .id-field-full { grid-column: 1 / -1; }
                .id-field { }
                .id-field-label {
                    font-size: 5px; font-weight: 800; color: #8B0000;
                    text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 0px;
                }
                .id-field-value {
                    font-size: 6px; font-weight: 700; color: #1a1a1a;
                    border-bottom: 0.5px dotted #b8a060; padding-bottom: 1px;
                    min-height: 8px; word-wrap: break-word;
                }

                /* Footer */
                .id-footer {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    padding: 0 6px 3px; flex-shrink: 0; position: relative; z-index: 1;
                    border-top: 0.5px dashed rgba(139,0,0,0.15); margin-top: 1px;
                    padding-top: 2px;
                }
                .id-footer-address { flex: 1; }
                .id-footer-address .addr-label {
                    font-size: 4px; font-weight: 800; color: #8B0000;
                    text-transform: uppercase; letter-spacing: 0.2px;
                }
                .id-footer-address .addr-text { font-size: 4.5px; font-weight: 600; color: #444; line-height: 1.3; }
                .id-footer-address .addr-phone { font-size: 4.5px; font-weight: 800; color: #8B0000; margin-top: 0px; }

                .id-footer-sig { text-align: right; flex-shrink: 0; }
                .id-footer-sig .sig-cursive { font-family: 'Great Vibes', cursive; font-size: 9px; color: #1e3a5f; }
                .id-footer-sig .sig-name { font-size: 4.5px; font-weight: 800; color: #111; text-transform: uppercase; }
                .id-footer-sig .sig-title { font-size: 4px; font-weight: 700; color: #555; }

                /* Bottom accent bar */
                .id-bottom-accent {
                    height: 2.5px; flex-shrink: 0;
                    background: linear-gradient(90deg, #8B0000, #dc2626, #ff4444, #dc2626, #8B0000);
                }

                /* Decorative corner */
                .id-card::before {
                    content: ''; position: absolute; bottom: 2px; right: 0;
                    width: 35px; height: 35px;
                    background: radial-gradient(circle at bottom right, rgba(255,215,0,0.08), transparent 70%);
                    pointer-events: none;
                }
                .id-card::after {
                    content: ''; position: absolute; top: 35px; left: 0;
                    width: 25px; height: 25px;
                    background: radial-gradient(circle at top left, rgba(139,0,0,0.04), transparent 70%);
                    pointer-events: none;
                }

                /* Print button */
                .print-btn-id {
                    position: fixed; bottom: 30px; right: 30px;
                    background: linear-gradient(135deg, #8B0000, #dc2626); color: white;
                    border: none; padding: 14px 28px; border-radius: 14px; font-size: 16px;
                    font-weight: 700; cursor: pointer; box-shadow: 0 6px 25px rgba(139,0,0,0.4);
                    z-index: 1000; display: flex; align-items: center; gap: 8px;
                    transition: all 0.3s; font-family: 'Inter', sans-serif;
                }
                .print-btn-id:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(139,0,0,0.5); }

                @media print {
                    body { background: white !important; margin: 0; padding: 0; }
                    .id-page-wrapper { padding: 0; min-height: auto; }
                    .id-card {
                        box-shadow: none; margin: 10mm auto;
                        width: 85.6mm; height: 53.98mm;
                        -webkit-print-color-adjust: exact; print-color-adjust: exact;
                    }
                    .print-btn-id { display: none !important; }
                    @page { size: A4 portrait; margin: 10mm; }
                }
            `}</style>

            <button className="print-btn-id" onClick={handlePrint}>🖨️ Print ID Card</button>

            <div className="id-page-wrapper">
                <div className="id-card">

                    {/* Maroon Header */}
                    <div className="id-header">
                        <div className="id-header-logo">
                            <img src="/logo.png" alt="Pretech" />
                        </div>
                        <div className="id-header-text">
                            <div className="id-header-title">PRETECH COMPUTER EDUCATION</div>
                            <div className="id-header-sub">An ISO 9001:2015 Certified Organization</div>
                        </div>
                        <div className="id-header-badges">
                            <div className="id-hdr-badge id-hdr-msme">MSME<br />GOVT<br />INDIA</div>
                            <div className="id-hdr-badge id-hdr-digital">Digital<br />India</div>
                        </div>
                    </div>

                    {/* ID CARD Title */}
                    <div className="id-title-bar">
                        <h2>ID CARD</h2>
                    </div>

                    {/* Body: Photo Left + Fields Right */}
                    <div className="id-body">
                        <div className="id-watermark"><img src="/logo.png" alt="" /></div>

                        <div className="id-left">
                            {student.passportPhoto ? (
                                <img src={student.passportPhoto} alt="Student" className="id-student-photo" />
                            ) : (
                                <div className="id-photo-placeholder">👤</div>
                            )}
                            <div className="id-iso-mini">
                                <span>CERTIFIED</span>
                                <span style={{ fontSize: '7px', fontWeight: 900 }}>ISO</span>
                                <span>9001:2015</span>
                            </div>
                        </div>

                        <div className="id-right">
                            <div className="id-fields-grid">
                                <div className="id-field id-field-full">
                                    <div className="id-field-label">Student Name</div>
                                    <div className="id-field-value">{student.name || ''}</div>
                                </div>
                                <div className="id-field id-field-full">
                                    <div className="id-field-label">Father's Name</div>
                                    <div className="id-field-value">{student.fatherHusbandName || ''}</div>
                                </div>
                                <div className="id-field">
                                    <div className="id-field-label">Course</div>
                                    <div className="id-field-value">{courseName}</div>
                                </div>
                                <div className="id-field">
                                    <div className="id-field-label">Mobile No.</div>
                                    <div className="id-field-value">{student.mobile || ''}</div>
                                </div>
                                <div className="id-field id-field-full">
                                    <div className="id-field-label">Student Address</div>
                                    <div className="id-field-value">{student.address || ''}</div>
                                </div>
                                <div className="id-field">
                                    <div className="id-field-label">Student ID</div>
                                    <div className="id-field-value">{student.studentId || ''}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Centre Address + Director Signature */}
                    <div className="id-footer">
                        <div className="id-footer-address">
                            <div className="addr-label">Centre Address:</div>
                            <div className="addr-text">B-35, MP Nagar, Bikaner, Rajasthan</div>
                            <div className="addr-phone">📞 Pankaj Gilhotra (Director)</div>
                        </div>
                        <div className="id-footer-sig">
                            <div className="sig-cursive">Pankaj Gilhotra</div>
                            <div className="sig-name">Pankaj Gilhotra</div>
                            <div className="sig-title">DIRECTOR</div>
                        </div>
                    </div>

                    <div className="id-bottom-accent" />
                </div>
            </div>
        </>
    );
};

export default StudentIdCard;
