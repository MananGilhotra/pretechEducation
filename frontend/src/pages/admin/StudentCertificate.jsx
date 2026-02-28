import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import API from '../../api/axios';

const StudentCertificate = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);
    const [marks, setMarks] = useState('85');
    const [grade, setGrade] = useState('A');

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
    const verificationUrl = `${window.location.origin}/verify/${certNo}`;

    // Marks input form
    if (!ready) {
        return (
            <>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { background: #0f172a; font-family: 'Inter', sans-serif; }
                    .mf-wrapper {
                        display: flex; justify-content: center; align-items: center;
                        min-height: 100vh; padding: 20px;
                    }
                    .mf-card {
                        background: white; border-radius: 20px; padding: 40px;
                        box-shadow: 0 25px 60px rgba(0,0,0,0.3); max-width: 440px; width: 100%;
                        border: 1px solid #e2e8f0;
                    }
                    .mf-card h2 {
                        font-family: 'Outfit', sans-serif; font-size: 24px;
                        font-weight: 800; color: #1E40AF; margin-bottom: 6px;
                    }
                    .mf-card .mf-sub { font-size: 14px; color: #64748b; margin-bottom: 24px; }
                    .mf-info {
                        background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; padding: 14px;
                        margin-bottom: 24px; border: 1px solid #bfdbfe;
                    }
                    .mf-info .mf-name { font-weight: 700; font-size: 16px; color: #1e293b; }
                    .mf-info .mf-course { font-size: 13px; color: #475569; margin-top: 2px; }
                    .mf-group { margin-bottom: 18px; }
                    .mf-group label {
                        display: block; font-size: 13px; font-weight: 600;
                        color: #334155; margin-bottom: 6px;
                    }
                    .mf-group input, .mf-group select {
                        width: 100%; padding: 10px 14px; border: 2px solid #e2e8f0;
                        border-radius: 10px; font-size: 15px; font-family: 'Inter', sans-serif;
                        outline: none; transition: all 0.2s; color: #1e293b; background: white;
                    }
                    .mf-group select option { color: #1e293b; background: white; }
                    .mf-group input:focus, .mf-group select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                    .mf-btn {
                        width: 100%; padding: 14px; background: linear-gradient(135deg, #1E40AF, #3B82F6);
                        color: white; border: none; border-radius: 12px; font-size: 16px;
                        font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif;
                        transition: all 0.3s; margin-top: 8px;
                    }
                    .mf-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(30,64,175,0.35); }
                `}</style>
                <div className="mf-wrapper">
                    <div className="mf-card">
                        <h2>📜 Generate Certificate</h2>
                        <p className="mf-sub">Enter marks and grade for this student</p>
                        <div className="mf-info">
                            <div className="mf-name">{student.name}</div>
                            <div className="mf-course">{courseName} • {student.studentId}</div>
                        </div>
                        <div className="mf-group">
                            <label>Marks Percentage (%)</label>
                            <input type="number" min="0" max="100" value={marks} onChange={e => setMarks(e.target.value)} placeholder="e.g. 85" />
                        </div>
                        <div className="mf-group">
                            <label>Grade</label>
                            <select value={grade} onChange={e => setGrade(e.target.value)}>
                                <option value="A+">A+ (Outstanding)</option>
                                <option value="A">A (Excellent)</option>
                                <option value="B+">B+ (Very Good)</option>
                                <option value="B">B (Good)</option>
                                <option value="C">C (Average)</option>
                                <option value="D">D (Below Average)</option>
                            </select>
                        </div>
                        <button className="mf-btn" onClick={() => setReady(true)}>Generate Certificate →</button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { background: #1a1a2e; }

                .cert-page {
                    width: 210mm; min-height: 297mm; margin: 20px auto;
                    background: #fff;
                    position: relative; overflow: hidden; font-family: 'Inter', sans-serif;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                }

                /* ===== ORNAMENTAL BORDER LAYERS ===== */
                .cert-border-outer {
                    position: absolute; top: 5mm; left: 5mm; right: 5mm; bottom: 5mm;
                    border: 3px solid #1E40AF; pointer-events: none;
                }
                .cert-border-inner {
                    position: absolute; top: 8mm; left: 8mm; right: 8mm; bottom: 8mm;
                    border: 1px solid #b8860b; pointer-events: none;
                }
                .cert-border-deco {
                    position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm;
                    border: 1px dashed rgba(30,64,175,0.2); pointer-events: none;
                }

                /* Corner ornaments */
                .corner { position: absolute; width: 50px; height: 50px; pointer-events: none; z-index: 2; }
                .corner svg { width: 100%; height: 100%; }
                .corner-tl { top: 5mm; left: 5mm; }
                .corner-tr { top: 5mm; right: 5mm; transform: scaleX(-1); }
                .corner-bl { bottom: 5mm; left: 5mm; transform: scaleY(-1); }
                .corner-br { bottom: 5mm; right: 5mm; transform: scale(-1,-1); }

                /* Watermark */
                .cert-watermark {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 350px; height: 350px; opacity: 0.03; pointer-events: none;
                }
                .cert-watermark img { width: 100%; height: 100%; object-fit: contain; }

                /* Background decorative circles */
                .cert-bg-circle-1 {
                    position: absolute; top: -100px; right: -100px; width: 300px; height: 300px;
                    border-radius: 50%; background: radial-gradient(circle, rgba(30,64,175,0.03), transparent 70%);
                    pointer-events: none;
                }
                .cert-bg-circle-2 {
                    position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px;
                    border-radius: 50%; background: radial-gradient(circle, rgba(184,134,11,0.04), transparent 70%);
                    pointer-events: none;
                }

                .cert-content { padding: 14mm 18mm; position: relative; z-index: 1; }

                /* ===== HEADER ===== */
                .cert-header {
                    display: flex; align-items: center; justify-content: center;
                    gap: 16px; margin-bottom: 6px;
                }
                .cert-header-badges-left, .cert-header-badges-right {
                    display: flex; flex-direction: column; gap: 4px; align-items: center;
                }
                .cert-mini-badge {
                    width: 38px; height: 38px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 5.5px; font-weight: 700; text-align: center; line-height: 1.1;
                }
                .badge-msme { background: linear-gradient(135deg, #0c2340, #1e3a5f); color: white; border: 1.5px solid #b8860b; }
                .badge-digital { background: linear-gradient(135deg, #e65100, #ff8f00); color: white; border: 1.5px solid #bf360c; }
                .badge-make { background: linear-gradient(135deg, #0d47a1, #1565c0); color: white; border: 1.5px solid #b8860b; }
                .badge-govt { background: linear-gradient(135deg, #1b5e20, #2e7d32); color: white; border: 1.5px solid #b8860b; }

                .cert-header-center { text-align: center; }
                .cert-logo { width: 80px; height: 80px; margin: 0 auto 4px; }
                .cert-logo img { width: 100%; height: 100%; object-fit: contain; }

                .cert-inst-name {
                    font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 900;
                    background: linear-gradient(135deg, #1E40AF, #1565c0, #1E40AF);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    background-clip: text; letter-spacing: 2px;
                }
                .cert-iso-line {
                    font-size: 10px; font-weight: 600; color: #b8860b;
                    letter-spacing: 1px; margin-top: 1px;
                }

                /* Gold divider */
                .gold-divider {
                    height: 2px; margin: 8px 25mm;
                    background: linear-gradient(90deg, transparent, #b8860b, #ffd700, #b8860b, transparent);
                }
                .gold-divider-thin {
                    height: 1px; margin: 3px 30mm;
                    background: linear-gradient(90deg, transparent, #b8860b, transparent);
                }

                /* ===== CERTIFICATE TITLE ===== */
                .cert-title-section { text-align: center; margin: 12px 0 8px; }
                .cert-title-word {
                    font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700;
                    color: #1E40AF; letter-spacing: 8px;
                    text-shadow: 0 2px 4px rgba(30,64,175,0.15);
                }
                .cert-of-excellence {
                    font-family: 'Great Vibes', cursive; font-size: 24px;
                    color: #b8860b; margin-top: -4px;
                }

                /* ===== BODY: Photo + QR row ===== */
                .cert-body-row {
                    display: flex; justify-content: center; align-items: flex-start;
                    gap: 40px; margin: 12px 0 10px; padding: 0 10mm;
                }
                .cert-side-col { display: flex; flex-direction: column; align-items: center; gap: 6px; }

                .cert-photo {
                    width: 105px; height: 125px; border-radius: 6px; object-fit: cover;
                    border: 3px solid #1E40AF; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #f0f0f0;
                }
                .cert-photo-placeholder {
                    width: 105px; height: 125px; border-radius: 6px;
                    border: 3px solid #1E40AF; background: linear-gradient(135deg, #e8f0fe, #d0e0f0);
                    display: flex; align-items: center; justify-content: center; font-size: 30px; color: #1E40AF;
                }
                .cert-iso-badge {
                    width: 45px; height: 45px; border-radius: 50%;
                    background: linear-gradient(135deg, #ffd700, #daa520);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    font-size: 5px; font-weight: 800; color: #1a1a1a; text-align: center;
                    line-height: 1.1; border: 2px solid #b8860b; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                }
                .cert-iaf-badge {
                    width: 45px; height: 45px; border-radius: 50%;
                    background: linear-gradient(135deg, #0d1b4a, #1a237e);
                    display: flex; align-items: center; justify-content: center;
                    color: #ffd700; font-weight: 900; font-size: 12px;
                    border: 2px solid #ffd700; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                }
                .cert-qr-wrapper {
                    padding: 5px; background: white; border-radius: 6px;
                    border: 2px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .cert-qr-label {
                    font-size: 7px; font-weight: 700; color: #1e3a5f;
                    text-align: center; line-height: 1.2; margin-top: 2px;
                }

                /* ===== CERTIFY TEXT ===== */
                .cert-certify {
                    text-align: center; font-family: 'Great Vibes', cursive;
                    font-size: 22px; color: #444; margin-bottom: 6px;
                }
                .cert-student-name {
                    text-align: center; margin-bottom: 4px;
                    font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 800;
                    color: #111; letter-spacing: 1px; text-transform: uppercase;
                }
                .cert-student-name-underline {
                    width: 200px; height: 2px; margin: 0 auto 6px;
                    background: linear-gradient(90deg, transparent, #b8860b, transparent);
                }
                .cert-father-name {
                    text-align: center; font-size: 16px; font-weight: 700; color: #333;
                    margin-bottom: 6px; text-transform: uppercase;
                }
                .cert-institute-pill {
                    text-align: center; margin-bottom: 10px;
                }
                .cert-institute-pill span {
                    background: linear-gradient(135deg, #1E40AF, #2563eb);
                    color: white; padding: 4px 24px; border-radius: 20px;
                    font-weight: 800; font-size: 12px; letter-spacing: 1px;
                    display: inline-block; box-shadow: 0 2px 8px rgba(30,64,175,0.2);
                }

                /* ===== EXAM DETAILS ===== */
                .cert-exam-section {
                    text-align: center; margin-bottom: 6px; line-height: 1.8;
                }
                .cert-exam-text { font-size: 13px; color: #444; font-style: italic; }
                .cert-exam-value {
                    display: inline-block; border: 1.5px solid #1E40AF;
                    padding: 1px 14px; border-radius: 4px; font-weight: 800;
                    color: #1E40AF; background: rgba(30,64,175,0.04);
                    margin: 0 4px; min-width: 35px; text-align: center; font-size: 14px;
                }
                .cert-awarded { font-size: 13px; color: #555; font-style: italic; margin-bottom: 4px; text-align: center; }
                .cert-course-name {
                    text-align: center; font-family: 'Outfit', sans-serif;
                    font-size: 19px; font-weight: 800; color: #1E40AF;
                    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;
                }
                .cert-course-meta {
                    text-align: center; font-size: 10px; font-weight: 600;
                    color: #666; margin-bottom: 2px;
                }
                .cert-standards {
                    text-align: center; margin: 8px 0 4px;
                }
                .cert-standards .designed {
                    font-family: 'Great Vibes', cursive; font-size: 17px; color: #444;
                }
                .cert-standards .inst {
                    font-weight: 900; font-size: 14px; color: #1E40AF;
                    display: block; margin-top: 1px;
                }
                .cert-standards-iso {
                    text-align: center; font-size: 10px; font-weight: 600;
                    color: #b8860b; margin-bottom: 8px;
                }

                /* ===== FOOTER ===== */
                .cert-footer {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    padding: 0 3mm; margin-top: 6px;
                }
                .cert-footer-col { text-align: center; min-width: 120px; }
                .cert-sig-line {
                    width: 100px; height: 1px; background: #333; margin: 0 auto 4px;
                }
                .cert-sig-cursive { font-family: 'Great Vibes', cursive; font-size: 20px; color: #1e3a5f; margin-bottom: 2px; }
                .cert-sig-name { font-weight: 800; font-size: 10px; color: #111; text-transform: uppercase; }
                .cert-sig-title { font-size: 9px; font-weight: 600; color: #555; }

                .cert-footer-mid { text-align: center; flex: 1; }
                .cert-footer-mid .cert-no { font-size: 11px; font-weight: 700; color: #111; }
                .cert-footer-mid .cert-date { font-size: 10px; font-weight: 600; color: #444; }
                .cert-footer-mid .cert-verify-text { font-size: 8px; color: #888; margin-top: 2px; }

                .cert-footer-right-badge {
                    width: 44px; height: 44px; border-radius: 50%;
                    background: linear-gradient(135deg, #1E40AF, #2563eb);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    color: white; font-size: 6px; font-weight: 800; line-height: 1.1;
                    margin: 0 auto 4px; border: 2px solid #b8860b;
                }

                /* Seal */
                .cert-seal {
                    position: absolute; bottom: 75px; left: 40px;
                    width: 55px; height: 55px;
                    background: radial-gradient(circle, #dc2626 30%, #991b1b 100%);
                    border-radius: 50%; display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    color: white; font-size: 6px; font-weight: 800; text-align: center;
                    box-shadow: 0 3px 12px rgba(153,27,27,0.4); line-height: 1.1;
                    border: 2px solid #fca5a5; z-index: 3;
                }
                .cert-seal .seal-star { font-size: 14px; margin-bottom: 1px; }

                /* ===== ADDRESS BAR ===== */
                .cert-address-bar {
                    background: linear-gradient(135deg, #0c2340, #1E40AF);
                    color: white; text-align: center; padding: 8px 15px;
                    font-size: 9px; font-weight: 600; letter-spacing: 0.5px;
                    line-height: 1.6; position: relative; z-index: 1;
                }
                .cert-address-bar .addr-bold { font-size: 11px; font-weight: 800; }

                /* ===== BUTTONS ===== */
                .print-btn {
                    position: fixed; bottom: 30px; right: 30px;
                    background: linear-gradient(135deg, #1E40AF, #3B82F6); color: white;
                    border: none; padding: 14px 28px; border-radius: 14px; font-size: 16px;
                    font-weight: 700; cursor: pointer; box-shadow: 0 6px 25px rgba(30,64,175,0.4);
                    z-index: 1000; display: flex; align-items: center; gap: 8px;
                    transition: all 0.3s; font-family: 'Inter', sans-serif;
                }
                .print-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(30,64,175,0.5); }
                .edit-btn {
                    position: fixed; bottom: 30px; right: 220px;
                    background: linear-gradient(135deg, #92400e, #d97706); color: white;
                    border: none; padding: 14px 28px; border-radius: 14px; font-size: 16px;
                    font-weight: 700; cursor: pointer; box-shadow: 0 6px 25px rgba(217,119,6,0.35);
                    z-index: 1000; display: flex; align-items: center; gap: 8px;
                    transition: all 0.3s; font-family: 'Inter', sans-serif;
                }
                .edit-btn:hover { transform: translateY(-2px); }

                @media print {
                    body { background: white !important; margin: 0; padding: 0; }
                    .cert-page { margin: 0; box-shadow: none; width: 210mm; min-height: 297mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-btn, .edit-btn { display: none !important; }
                    @page { size: A4 portrait; margin: 0; }
                }
            `}</style>

            <button className="edit-btn" onClick={() => setReady(false)}>✏️ Edit Marks</button>
            <button className="print-btn" onClick={handlePrint}>🖨️ Print Certificate</button>

            <div className="cert-page">
                {/* Background decorations */}
                <div className="cert-bg-circle-1" />
                <div className="cert-bg-circle-2" />
                <div className="cert-watermark"><img src="/logo.png" alt="" /></div>

                {/* Triple border frame */}
                <div className="cert-border-outer" />
                <div className="cert-border-inner" />
                <div className="cert-border-deco" />

                {/* Corner ornaments */}
                {['tl', 'tr', 'bl', 'br'].map(pos => (
                    <div key={pos} className={`corner corner-${pos}`}>
                        <svg viewBox="0 0 50 50" fill="none">
                            <path d="M0 0 L50 0 L50 8 Q30 8 20 18 Q10 28 8 50 L0 50 Z" fill="#1E40AF" opacity="0.15" />
                            <path d="M0 0 L40 0 L40 5 Q25 6 16 14 Q8 22 5 40 L0 40 Z" fill="#b8860b" opacity="0.2" />
                            <circle cx="6" cy="6" r="3" fill="#b8860b" opacity="0.3" />
                        </svg>
                    </div>
                ))}

                <div className="cert-content">
                    {/* Header: badges + logo + institute name */}
                    <div className="cert-header">
                        <div className="cert-header-badges-left">
                            <div className="cert-mini-badge badge-msme">MSME<br />GOVT OF<br />INDIA</div>
                            <div className="cert-mini-badge badge-digital">Digital<br />India</div>
                        </div>
                        <div className="cert-header-center">
                            <div className="cert-logo"><img src="/logo.png" alt="Pretech" /></div>
                            <div className="cert-inst-name">PRETECH COMPUTER EDUCATION</div>
                            <div className="cert-iso-line">✦ AN ISO 9001:2015 CERTIFIED ORGANISATION ✦</div>
                        </div>
                        <div className="cert-header-badges-right">
                            <div className="cert-mini-badge badge-make">MAKE<br />IN<br />INDIA</div>
                            <div className="cert-mini-badge badge-govt">भारत<br />सरकार</div>
                        </div>
                    </div>

                    <div className="gold-divider" />
                    <div className="gold-divider-thin" />

                    {/* Title */}
                    <div className="cert-title-section">
                        <div className="cert-title-word">CERTIFICATE</div>
                        <div className="cert-of-excellence">of Excellence</div>
                    </div>

                    {/* Body row: ISO badges | Photo | QR code */}
                    <div className="cert-body-row">
                        <div className="cert-side-col">
                            <div className="cert-iso-badge">ISO<br />9001<br />2015<br />CERTIFIED</div>
                            <div className="cert-iaf-badge">IAF</div>
                        </div>

                        <div className="cert-side-col">
                            {student.passportPhoto ? (
                                <img src={student.passportPhoto} alt="Student" className="cert-photo" />
                            ) : (
                                <div className="cert-photo-placeholder">👤</div>
                            )}
                        </div>

                        <div className="cert-side-col">
                            <div className="cert-qr-wrapper">
                                <QRCode value={verificationUrl} size={65} level="M" />
                            </div>
                            <span className="cert-qr-label">SCAN FOR<br />VERIFICATION</span>
                        </div>
                    </div>

                    {/* Certify text */}
                    <div className="cert-certify">This is to certify that,</div>
                    <div className="cert-student-name">{student.name}</div>
                    <div className="cert-student-name-underline" />
                    {student.fatherHusbandName && (
                        <div className="cert-father-name">
                            {student.gender === 'Female' ? 'D/O' : 'S/O'} {student.fatherHusbandName}
                        </div>
                    )}
                    <div className="cert-institute-pill"><span>PRETECH COMPUTER EDUCATION</span></div>

                    {/* Exam details */}
                    <div className="cert-exam-section">
                        <span className="cert-exam-text">has passed the prescribed examination with </span>
                        <span className="cert-exam-value">{grade}</span>
                        <span className="cert-exam-text"> Grade (</span>
                        <span className="cert-exam-value">{marks}%</span>
                        <span className="cert-exam-text"> Marks)</span>
                    </div>

                    <div className="cert-awarded">has been awarded the</div>
                    <div className="cert-course-name">{courseName}</div>
                    <div className="cert-course-meta">(COURSE DURATION: {courseDuration})</div>
                    <div className="cert-course-meta">(COURSE PERIOD: {formatDate(regDate)} TO {formatDate(endDate)})</div>

                    <div className="cert-standards">
                        <span className="designed">designed and developed as per the standards of</span>
                        <span className="inst">PRETECH COMPUTER EDUCATION</span>
                    </div>
                    <div className="cert-standards-iso">An ISO 9001:2015 Certified Organisation</div>

                    {/* Footer: signatures */}
                    <div className="cert-footer">
                        <div className="cert-footer-col">
                            <div className="cert-sig-cursive">Pankaj Gilhotra</div>
                            <div className="cert-sig-line" />
                            <div className="cert-sig-name">PANKAJ GILHOTRA</div>
                            <div className="cert-sig-title">Controller Of Examination</div>
                        </div>
                        <div className="cert-footer-mid">
                            <div className="cert-no">Certificate No: {certNo}</div>
                            <div className="cert-date">Date Of Issue: {formatDate(issueDate)}</div>
                            <div className="cert-verify-text">Online Certificate Verification Available</div>
                        </div>
                        <div className="cert-footer-col">
                            <div className="cert-footer-right-badge"><span>ISO</span><span>9001</span><span>2015</span></div>
                            <div className="cert-sig-cursive">Pankaj Gilhotra</div>
                            <div className="cert-sig-line" />
                            <div className="cert-sig-name">PANKAJ GILHOTRA</div>
                            <div className="cert-sig-title">DIRECTOR</div>
                        </div>
                    </div>

                    {/* Red seal */}
                    <div className="cert-seal">
                        <span className="seal-star">★</span>
                        <span>CERTIFIED</span>
                        <span>VERIFIED</span>
                    </div>
                </div>

                {/* Address bar */}
                <div className="cert-address-bar">
                    ADDRESS: B-35, MP NAGAR, BIKANER, RAJASTHAN
                    <div className="addr-bold">📞 CONTACT: PANKAJ GILHOTRA (DIRECTOR)</div>
                </div>
            </div>
        </>
    );
};

export default StudentCertificate;
