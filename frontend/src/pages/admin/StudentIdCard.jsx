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
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 40px 20px;
                }

                .id-card {
                    width: 340px;
                    min-height: 540px;
                    background: linear-gradient(170deg, #fdf6e3 0%, #f5e6c8 30%, #ecd9a8 60%, #f0deb0 80%, #fdf6e3 100%);
                    border-radius: 16px;
                    position: relative;
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                    box-shadow: 0 15px 50px rgba(0,0,0,0.25);
                    border: 2px solid #c8a050;
                }

                /* Top decorative bar */
                .id-top-bar {
                    height: 8px;
                    background: linear-gradient(90deg, #8B0000, #dc2626, #8B0000);
                }

                /* Curved maroon shape at top */
                .id-maroon-curve {
                    position: relative;
                    background: linear-gradient(135deg, #6B0000, #8B0000, #a01010);
                    padding: 14px 16px 18px;
                    clip-path: ellipse(85% 100% at 50% 0%);
                    text-align: center;
                }

                /* MSME Badge */
                .id-msme-badge {
                    position: absolute;
                    top: 8px;
                    left: 12px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1e3a5f, #2d5a8e);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 5px;
                    font-weight: 700;
                    color: white;
                    text-align: center;
                    line-height: 1.1;
                    border: 1.5px solid #ffd700;
                }

                /* Logo in header */
                .id-logo-circle {
                    width: 65px;
                    height: 65px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ff6600, #ff8533);
                    margin: 0 auto 6px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid #ffd700;
                    box-shadow: 0 3px 12px rgba(0,0,0,0.3);
                }

                .id-logo-circle .logo-icon {
                    font-size: 20px;
                }

                .id-logo-circle .logo-text {
                    font-size: 5px;
                    font-weight: 800;
                    color: white;
                    letter-spacing: 0.5px;
                    text-align: center;
                    line-height: 1.1;
                }

                .id-institute-name {
                    font-family: 'Outfit', sans-serif;
                    font-size: 19px;
                    font-weight: 900;
                    color: #ffd700;
                    letter-spacing: 1.5px;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.4);
                    margin-bottom: 2px;
                }

                .id-iso-text {
                    font-size: 10px;
                    color: #f0d080;
                    font-weight: 600;
                }

                /* ID CARD title section */
                .id-title-section {
                    text-align: center;
                    padding: 10px 16px 6px;
                    position: relative;
                }

                .id-title-badges {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .id-small-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 5px;
                    font-weight: 700;
                    text-align: center;
                    line-height: 1;
                }

                .id-police-badge {
                    background: linear-gradient(135deg, #1e3a5f, #0a1628);
                    color: #ffd700;
                    border: 1.5px solid #ffd700;
                }

                .id-digital-badge {
                    background: linear-gradient(135deg, #ff6600, #ff9933);
                    color: white;
                    border: 1.5px solid #cc5200;
                }

                .id-title-text {
                    font-family: 'Outfit', sans-serif;
                    font-size: 32px;
                    font-weight: 900;
                    color: #8B0000;
                    letter-spacing: 4px;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }

                /* ISO Badge below title */
                .id-iso-badge-row {
                    display: flex;
                    justify-content: flex-start;
                    padding: 0 16px 8px;
                }

                .id-iso-round {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ffd700, #f0c000);
                    display: flex;
                    flex-direction: column;
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

                /* Watermark */
                .id-watermark {
                    position: absolute;
                    top: 45%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-20deg);
                    font-family: 'Great Vibes', cursive;
                    font-size: 80px;
                    color: rgba(139, 0, 0, 0.04);
                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 0;
                }

                .id-watermark-logo {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 100px;
                    opacity: 0.03;
                    pointer-events: none;
                }

                /* Student fields */
                .id-fields {
                    padding: 15px 24px;
                    position: relative;
                    z-index: 1;
                }

                .id-field {
                    margin-bottom: 16px;
                }

                .id-field-label {
                    font-size: 15px;
                    font-weight: 800;
                    color: #333;
                    margin-bottom: 2px;
                }

                .id-field-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e3a5f;
                    border-bottom: 1.5px dotted #999;
                    padding-bottom: 3px;
                    min-height: 20px;
                }

                /* Director section */
                .id-director-section {
                    padding: 10px 24px 4px;
                    position: relative;
                    z-index: 1;
                }

                .id-director-sig {
                    font-family: 'Great Vibes', cursive;
                    font-size: 24px;
                    color: #1e3a5f;
                }

                .id-director-name {
                    font-size: 11px;
                    font-weight: 800;
                    color: #111;
                    text-transform: uppercase;
                }

                .id-director-title {
                    font-size: 10px;
                    font-weight: 700;
                    color: #555;
                }

                /* Bottom decorative bar */
                .id-bottom-bar {
                    height: 8px;
                    background: linear-gradient(90deg, #8B0000, #dc2626, #8B0000);
                    margin-top: auto;
                }

                /* Decorative corner accents */
                .id-card::before {
                    content: '';
                    position: absolute;
                    bottom: 8px;
                    right: 0;
                    width: 120px;
                    height: 120px;
                    background: radial-gradient(circle at bottom right, rgba(139,0,0,0.06), transparent 70%);
                    pointer-events: none;
                }

                /* Print button */
                .print-btn-id {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: linear-gradient(135deg, #8B0000, #dc2626);
                    color: white;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 14px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 25px rgba(139,0,0,0.4);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                    font-family: 'Inter', sans-serif;
                }

                .print-btn-id:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(139,0,0,0.5);
                }

                @media print {
                    body { background: white !important; margin: 0; padding: 0; }
                    .id-page-wrapper { padding: 0; min-height: auto; }
                    .id-card {
                        box-shadow: none;
                        border: 1px solid #c8a050;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        margin: 10mm auto;
                    }
                    .print-btn-id { display: none !important; }
                    @page { size: A4 portrait; margin: 10mm; }
                }
            `}</style>

            <button className="print-btn-id" onClick={handlePrint}>
                🖨️ Print ID Card
            </button>

            <div className="id-page-wrapper">
                <div className="id-card">
                    {/* Top bar */}
                    <div className="id-top-bar" />

                    {/* Watermarks */}
                    <div className="id-watermark">Pretech Computer Education</div>
                    <div className="id-watermark-logo">🔥</div>

                    {/* Maroon curve header */}
                    <div className="id-maroon-curve">
                        <div className="id-msme-badge">MSME<br />GOVT<br />INDIA</div>
                        <div className="id-logo-circle">
                            <span className="logo-icon">🔥</span>
                            <span className="logo-text">Pretech Computer<br />Education</span>
                        </div>
                        <div className="id-institute-name">PRETECH COMPUTER EDUCATION</div>
                        <div className="id-iso-text">An ISO 9001:2015 Certified Organization</div>
                    </div>

                    {/* ID CARD Title */}
                    <div className="id-title-section">
                        <div className="id-title-badges">
                            <div className="id-small-badge id-police-badge">भारत<br />सरकार</div>
                            <h2 className="id-title-text">ID CARD</h2>
                            <div className="id-small-badge id-digital-badge">Digital<br />India</div>
                        </div>
                    </div>

                    {/* ISO Badge */}
                    <div className="id-iso-badge-row">
                        <div className="id-iso-round">
                            <span>CERTIFIED</span>
                            <span style={{ fontSize: '10px', fontWeight: 900 }}>ISO</span>
                            <span>9001:2015</span>
                        </div>
                    </div>

                    {/* Student Fields */}
                    <div className="id-fields">
                        <div className="id-field">
                            <div className="id-field-label">Student Name.:</div>
                            <div className="id-field-value">{student.name || ''}</div>
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
                            <div className="id-field-label">Referral Code.:</div>
                            <div className="id-field-value">{student.studentId || ''}</div>
                        </div>
                    </div>

                    {/* Director */}
                    <div className="id-director-section">
                        <div className="id-director-sig">Pankaj Gilhotra</div>
                        <div className="id-director-name">PANKAJ GILHOTRA</div>
                        <div className="id-director-title">DIRECTOR</div>
                    </div>

                    {/* Bottom bar */}
                    <div className="id-bottom-bar" />
                </div>
            </div>
        </>
    );
};

export default StudentIdCard;
