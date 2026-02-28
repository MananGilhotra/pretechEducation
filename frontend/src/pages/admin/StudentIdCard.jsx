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
                body { background: #e8e8e8; }

                .id-page-wrapper {
                    display: flex; justify-content: center; align-items: center;
                    min-height: 100vh; padding: 40px 20px;
                }

                .id-card {
                    width: 350px; height: 550px;
                    background: linear-gradient(170deg, #fdf6e3 0%, #f5e6c8 30%, #ecd9a8 60%, #f0deb0 80%, #fdf6e3 100%);
                    border-radius: 14px; position: relative; overflow: hidden;
                    font-family: 'Inter', sans-serif;
                    box-shadow: 0 15px 50px rgba(0,0,0,0.25); border: 2px solid #c8a050;
                    display: flex; flex-direction: column;
                }

                .id-top-bar { height: 6px; background: linear-gradient(90deg, #8B0000, #dc2626, #8B0000); flex-shrink: 0; }

                .id-maroon-curve {
                    position: relative;
                    background: linear-gradient(135deg, #6B0000, #8B0000, #a01010);
                    padding: 10px 16px 14px; text-align: center; flex-shrink: 0;
                    clip-path: ellipse(85% 100% at 50% 0%);
                }

                .id-msme-badge {
                    position: absolute; top: 6px; left: 10px;
                    width: 30px; height: 30px; border-radius: 50%;
                    background: linear-gradient(135deg, #1e3a5f, #2d5a8e);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 4px; font-weight: 700; color: white;
                    text-align: center; line-height: 1.1; border: 1.5px solid #ffd700;
                }

                .id-logo-circle { width: 60px; height: 60px; margin: 0 auto 4px; }
                .id-logo-circle img { width: 100%; height: 100%; object-fit: contain; }

                .id-institute-name {
                    font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 900;
                    color: #ffd700; letter-spacing: 1px; text-shadow: 1px 1px 3px rgba(0,0,0,0.4);
                    margin-bottom: 1px;
                }
                .id-iso-text { font-size: 8px; color: #f0d080; font-weight: 600; }

                .id-title-section { text-align: center; padding: 6px 16px 4px; flex-shrink: 0; }
                .id-title-badges {
                    display: flex; justify-content: space-between; align-items: center;
                }
                .id-small-badge {
                    width: 28px; height: 28px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 4px; font-weight: 700; text-align: center; line-height: 1;
                }
                .id-police-badge { background: linear-gradient(135deg, #1e3a5f, #0a1628); color: #ffd700; border: 1.5px solid #ffd700; }
                .id-digital-badge { background: linear-gradient(135deg, #ff6600, #ff9933); color: white; border: 1.5px solid #cc5200; }
                .id-title-text {
                    font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 900;
                    color: #8B0000; letter-spacing: 3px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }

                /* Photo + ISO row */
                .id-photo-row {
                    display: flex; align-items: flex-start; padding: 6px 18px 2px;
                    gap: 12px; flex-shrink: 0;
                }
                .id-iso-round {
                    width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
                    background: linear-gradient(135deg, #ffd700, #f0c000);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    font-size: 5px; font-weight: 800; color: #1e3a5f;
                    text-align: center; line-height: 1.1; border: 2px solid #c8a000;
                }
                .id-student-photo {
                    width: 80px; height: 95px; border-radius: 8px;
                    border: 2px solid #8B0000; object-fit: cover;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.2); background: #f0f0f0;
                }
                .id-photo-placeholder {
                    width: 80px; height: 95px; border-radius: 8px;
                    border: 2px solid #8B0000;
                    background: linear-gradient(135deg, #f5e6c8, #ecd9a8);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; color: #8B0000;
                }

                .id-watermark {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 200px; height: 200px; opacity: 0.05; pointer-events: none; z-index: 0;
                }
                .id-watermark img { width: 100%; height: 100%; object-fit: contain; }

                .id-fields { padding: 6px 18px; position: relative; z-index: 1; flex: 1; }
                .id-field { margin-bottom: 8px; }
                .id-field-label { font-size: 11px; font-weight: 800; color: #333; margin-bottom: 1px; }
                .id-field-value {
                    font-size: 12px; font-weight: 600; color: #1e3a5f;
                    border-bottom: 1px dotted #999; padding-bottom: 2px; min-height: 16px;
                    word-wrap: break-word;
                }

                .id-center-address {
                    padding: 4px 18px; position: relative; z-index: 1; flex-shrink: 0;
                    border-top: 1px dashed rgba(139,0,0,0.2); margin-top: 2px;
                }
                .id-center-address .center-label {
                    font-size: 8px; font-weight: 800; color: #8B0000;
                    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1px;
                }
                .id-center-address .center-text {
                    font-size: 8px; font-weight: 600; color: #444; line-height: 1.3;
                }
                .id-center-address .center-phone {
                    font-size: 9px; font-weight: 800; color: #8B0000; margin-top: 1px;
                }

                .id-director-section { padding: 4px 18px 2px; position: relative; z-index: 1; flex-shrink: 0; }
                .id-director-sig { font-family: 'Great Vibes', cursive; font-size: 18px; color: #1e3a5f; }
                .id-director-name { font-size: 9px; font-weight: 800; color: #111; text-transform: uppercase; }
                .id-director-title { font-size: 8px; font-weight: 700; color: #555; }

                .id-bottom-bar { height: 6px; background: linear-gradient(90deg, #8B0000, #dc2626, #8B0000); flex-shrink: 0; }

                .id-card::before {
                    content: ''; position: absolute; bottom: 6px; right: 0;
                    width: 100px; height: 100px;
                    background: radial-gradient(circle at bottom right, rgba(139,0,0,0.06), transparent 70%);
                    pointer-events: none;
                }

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
                        box-shadow: none; border: 1px solid #c8a050;
                        -webkit-print-color-adjust: exact; print-color-adjust: exact;
                        margin: 15mm auto;
                    }
                    .print-btn-id { display: none !important; }
                    @page { size: A4 portrait; margin: 10mm; }
                }
            `}</style>

            <button className="print-btn-id" onClick={handlePrint}>🖨️ Print ID Card</button>

            <div className="id-page-wrapper">
                <div className="id-card">
                    <div className="id-top-bar" />

                    <div className="id-watermark"><img src="/logo.png" alt="Pretech" /></div>

                    <div className="id-maroon-curve">
                        <div className="id-msme-badge">MSME<br />GOVT<br />INDIA</div>
                        <div className="id-logo-circle">
                            <img src="/logo.png" alt="Pretech Computer Education" />
                        </div>
                        <div className="id-institute-name">PRETECH COMPUTER EDUCATION</div>
                        <div className="id-iso-text">An ISO 9001:2015 Certified Organization</div>
                    </div>

                    <div className="id-title-section">
                        <div className="id-title-badges">
                            <div className="id-small-badge id-police-badge">भारत<br />सरकार</div>
                            <h2 className="id-title-text">ID CARD</h2>
                            <div className="id-small-badge id-digital-badge">Digital<br />India</div>
                        </div>
                    </div>

                    {/* Photo + ISO row */}
                    <div className="id-photo-row">
                        <div className="id-iso-round">
                            <span>CERTIFIED</span>
                            <span style={{ fontSize: '8px', fontWeight: 900 }}>ISO</span>
                            <span>9001:2015</span>
                        </div>
                        {student.passportPhoto ? (
                            <img src={student.passportPhoto} alt="Student" className="id-student-photo" />
                        ) : (
                            <div className="id-photo-placeholder">👤</div>
                        )}
                    </div>

                    <div className="id-fields">
                        <div className="id-field">
                            <div className="id-field-label">Student Name.:</div>
                            <div className="id-field-value">{student.name || ''}</div>
                        </div>
                        <div className="id-field">
                            <div className="id-field-label">Father's Name.:</div>
                            <div className="id-field-value">{student.fatherHusbandName || ''}</div>
                        </div>
                        <div className="id-field">
                            <div className="id-field-label">Course Name.:</div>
                            <div className="id-field-value">{courseName}</div>
                        </div>
                        <div className="id-field">
                            <div className="id-field-label">Mobile Number.:</div>
                            <div className="id-field-value">{student.mobile || ''}</div>
                        </div>
                        <div className="id-field">
                            <div className="id-field-label">Student Address.:</div>
                            <div className="id-field-value">{student.address || ''}</div>
                        </div>
                        <div className="id-field">
                            <div className="id-field-label">Referral Code.:</div>
                            <div className="id-field-value">{student.studentId || ''}</div>
                        </div>
                    </div>

                    {/* Center Address */}
                    <div className="id-center-address">
                        <div className="center-label">Centre Address:</div>
                        <div className="center-text">Pretech Computer Education, Bikaner, Rajasthan</div>
                        <div className="center-phone">📞 Contact: Pankaj Gilhotra (Director)</div>
                    </div>

                    <div className="id-director-section">
                        <div className="id-director-sig">Pankaj Gilhotra</div>
                        <div className="id-director-name">PANKAJ GILHOTRA</div>
                        <div className="id-director-title">DIRECTOR</div>
                    </div>

                    <div className="id-bottom-bar" />
                </div>
            </div>
        </>
    );
};

export default StudentIdCard;
