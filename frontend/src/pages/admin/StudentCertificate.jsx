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

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter,sans-serif', fontSize: 18, color: '#555' }}>Loading certificate...</div>;
    if (error) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter,sans-serif', fontSize: 18, color: '#dc2626' }}>{error}</div>;
    if (!student) return null;

    const courseName = student.courseApplied?.name || 'N/A';
    const courseDuration = student.courseApplied?.duration || '1 Year';
    const regDate = student.registrationDate ? new Date(student.registrationDate) : new Date();
    const issueDate = new Date();
    const endDate = new Date(regDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const formatDate = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const certNo = `PTECH-${student.studentId || 'XXXX'}`;
    const verificationUrl = `${window.location.origin}/login`;

    // Marks input form
    if (!ready) {
        return (
            <>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
                    *{margin:0;padding:0;box-sizing:border-box;}
                    body{background:#f0f2f5;font-family:'Inter',sans-serif;}
                    .mf-w{display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;}
                    .mf-c{background:#fff;border-radius:20px;padding:40px;box-shadow:0 10px 40px rgba(0,0,0,.1);max-width:420px;width:100%;}
                    .mf-c h2{font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;color:#1E40AF;margin-bottom:6px;}
                    .mf-c .mf-s{font-size:14px;color:#666;margin-bottom:24px;}
                    .mf-i{background:#f0f4ff;border-radius:12px;padding:14px;margin-bottom:24px;border:1px solid #dbeafe;}
                    .mf-i .n{font-weight:700;font-size:16px;color:#111;} .mf-i .co{font-size:13px;color:#555;margin-top:2px;}
                    .fg{margin-bottom:18px;} .fg label{display:block;font-size:13px;font-weight:600;color:#333;margin-bottom:6px;}
                    .fg input,.fg select{width:100%;padding:10px 14px;border:2px solid #e0e0e0;border-radius:10px;font-size:15px;font-family:'Inter',sans-serif;outline:none;color:#111;background:#fff;}
                    .fg select option{color:#111;background:#fff;}
                    .fg input:focus,.fg select:focus{border-color:#1E40AF;}
                    .gb{width:100%;padding:14px;background:linear-gradient(135deg,#1E40AF,#3B82F6);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:all .3s;margin-top:8px;}
                    .gb:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(30,64,175,.3);}
                `}</style>
                <div className="mf-w"><div className="mf-c">
                    <h2>📜 Generate Certificate</h2>
                    <p className="mf-s">Enter marks and grade for this student</p>
                    <div className="mf-i"><div className="n">{student.name}</div><div className="co">{courseName} • {student.studentId}</div></div>
                    <div className="fg"><label>Marks Percentage (%)</label><input type="number" min="0" max="100" value={marks} onChange={e => setMarks(e.target.value)} /></div>
                    <div className="fg"><label>Grade</label><select value={grade} onChange={e => setGrade(e.target.value)}>
                        <option value="A+">A+ (Outstanding)</option><option value="A">A (Excellent)</option>
                        <option value="B+">B+ (Very Good)</option><option value="B">B (Good)</option>
                        <option value="C">C (Average)</option><option value="D">D (Below Average)</option>
                    </select></div>
                    <button className="gb" onClick={() => setReady(true)}>Generate Certificate →</button>
                </div></div>
            </>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
                *{margin:0;padding:0;box-sizing:border-box;}
                body{background:#555;}

                /* ====== PAGE ====== */
                .c-page{
                    width:210mm;min-height:297mm;margin:20px auto;position:relative;overflow:hidden;
                    font-family:'Inter',sans-serif;
                    background:linear-gradient(170deg,#fdf6e3 0%,#f5e0b0 30%,#ecd39a 50%,#f0d8a0 70%,#fdf6e3 100%);
                    box-shadow:0 15px 50px rgba(0,0,0,.35);
                }

                /* Decorative maroon corner curves */
                .c-corner-tl{
                    position:absolute;top:0;left:0;width:180px;height:180px;pointer-events:none;z-index:0;
                }
                .c-corner-tr{
                    position:absolute;top:0;right:0;width:180px;height:180px;pointer-events:none;z-index:0;
                }
                .c-corner-bl-deco{
                    position:absolute;bottom:0;right:0;width:200px;height:200px;pointer-events:none;z-index:0;
                    opacity:.15;
                }

                /* Gold border frame */
                .c-frame{
                    position:absolute;top:12mm;left:12mm;right:12mm;bottom:12mm;
                    border:2px solid #b8860b;pointer-events:none;z-index:1;
                }

                /* Watermark logo center */
                .c-watermark{
                    position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                    width:320px;height:320px;opacity:.04;pointer-events:none;z-index:0;
                }
                .c-watermark img{width:100%;height:100%;object-fit:contain;}

                .c-content{position:relative;z-index:2;padding:14mm 16mm;}

                /* ====== TOP BADGES ROW ====== */
                .c-top-badges{
                    display:flex;justify-content:space-between;align-items:center;
                    margin-bottom:4px;padding:0 5mm;
                }
                .c-badge{
                    width:44px;height:44px;border-radius:50%;display:flex;align-items:center;
                    justify-content:center;font-size:5px;font-weight:700;text-align:center;line-height:1.1;
                }
                .c-msme{background:linear-gradient(135deg,#0c2340,#1e3a5f);color:#fff;border:2px solid #b8860b;font-size:6px;}
                .c-digital{background:linear-gradient(135deg,#e65100,#ff8f00);color:#fff;border:2px solid #bf360c;}
                .c-main-logo{width:80px;height:80px;}
                .c-main-logo img{width:100%;height:100%;object-fit:contain;}
                .c-make{background:linear-gradient(135deg,#0d47a1,#1565c0);color:#fff;border:2px solid #b8860b;}
                .c-govt{background:linear-gradient(135deg,#1b5e20,#388e3c);color:#fff;border:2px solid #b8860b;}

                /* ====== INSTITUTE NAME ====== */
                .c-inst{text-align:center;margin-bottom:2px;}
                .c-inst h1{
                    font-family:'Outfit',sans-serif;font-size:30px;font-weight:900;
                    color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;
                }
                .c-inst .c-iso-t{font-size:11px;font-weight:600;color:#444;margin-top:1px;}

                /* ====== CERTIFICATE TITLE ====== */
                .c-title{text-align:center;margin:6px 0 10px;}
                .c-title h2{
                    font-family:'Great Vibes',cursive;font-size:62px;color:#1E40AF;font-weight:400;line-height:1;
                }

                /* ====== BODY: Left badges | Photo | Right QR ====== */
                .c-body-row{
                    display:flex;justify-content:space-between;align-items:flex-start;
                    margin-bottom:8px;padding:0 8mm;
                }
                .c-side-col{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:70px;}

                /* ISO badge */
                .c-iso-badge{
                    width:55px;height:55px;border-radius:50%;
                    background:linear-gradient(135deg,#ffd700,#daa520);
                    display:flex;flex-direction:column;align-items:center;justify-content:center;
                    font-size:6px;font-weight:800;color:#1a1a1a;text-align:center;line-height:1.1;
                    border:2px solid #b8860b;box-shadow:0 2px 8px rgba(0,0,0,.15);
                }
                /* IAF badge */
                .c-iaf{
                    width:55px;height:55px;border-radius:50%;
                    background:linear-gradient(135deg,#0d1b4a,#1a237e);
                    display:flex;align-items:center;justify-content:center;
                    color:#ffd700;font-weight:900;font-size:16px;
                    border:3px solid #ffd700;box-shadow:0 2px 8px rgba(0,0,0,.15);
                }

                /* Photo */
                .c-photo-col{display:flex;flex-direction:column;align-items:center;}
                .c-photo{
                    width:115px;height:140px;border-radius:6px;object-fit:cover;
                    border:3px solid #8B0000;box-shadow:0 4px 15px rgba(0,0,0,.2);background:#f0e8d8;
                }
                .c-photo-ph{
                    width:115px;height:140px;border-radius:6px;border:3px solid #8B0000;
                    background:linear-gradient(135deg,#f5e6c8,#ecd9a8);
                    display:flex;align-items:center;justify-content:center;font-size:36px;color:#8B0000;
                }

                /* QR section */
                .c-qr-col{display:flex;flex-direction:column;align-items:center;gap:4px;}
                .c-qr-label{font-size:9px;font-weight:800;color:#1a1a1a;text-align:center;letter-spacing:.5px;line-height:1.3;}
                .c-qr-wrap{
                    padding:5px;background:#fff;border-radius:4px;border:1px solid #ddd;
                    box-shadow:0 2px 6px rgba(0,0,0,.08);
                }

                /* ====== CERTIFY TEXT ====== */
                .c-certify{text-align:center;margin:6px 0 4px;}
                .c-certify span{font-family:'Great Vibes',cursive;font-size:24px;color:#333;}

                .c-student{text-align:center;margin-bottom:3px;padding:0 15mm;border-bottom:2px solid #333;}
                .c-student h3{
                    font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;
                    color:#111;text-transform:uppercase;padding-bottom:4px;letter-spacing:.5px;
                }

                /* ====== RED BANNER ====== */
                .c-red-banner{
                    text-align:center;margin:10px auto;position:relative;
                    display:inline-block;width:100%;
                }
                .c-red-banner span{
                    background:linear-gradient(135deg,#b91c1c,#dc2626);color:#ffd700;
                    padding:4px 28px;font-weight:900;font-size:13px;letter-spacing:1.5px;
                    display:inline-block;border-radius:2px;text-transform:uppercase;
                    box-shadow:0 2px 8px rgba(185,28,28,.25);
                }

                /* ====== EXAM ROW ====== */
                .c-exam{text-align:center;margin:8px 0 4px;line-height:1.8;}
                .c-exam .it{font-family:'Great Vibes',cursive;font-size:18px;color:#333;}
                .c-exam .vb{
                    display:inline-block;border:1.5px solid #111;padding:1px 14px;
                    font-weight:800;color:#111;min-width:35px;text-align:center;font-size:14px;
                    margin:0 4px;background:rgba(255,255,255,.4);
                }
                .c-awarded{text-align:center;font-family:'Great Vibes',cursive;font-size:18px;color:#333;margin:2px 0;}

                .c-course{text-align:center;margin-bottom:2px;}
                .c-course h4{
                    font-family:'Outfit',sans-serif;font-size:18px;font-weight:900;
                    color:#111;text-transform:uppercase;letter-spacing:1px;
                }
                .c-course-meta{text-align:center;font-size:10px;font-weight:700;color:#555;margin-bottom:1px;}

                .c-standards{text-align:center;margin:6px 0 2px;}
                .c-standards .des{font-family:'Great Vibes',cursive;font-size:17px;color:#333;}
                .c-standards .inst-name{font-weight:900;font-size:15px;color:#b91c1c;display:block;margin-top:1px;}
                .c-standards-iso{text-align:center;font-size:10px;font-weight:600;color:#444;margin-bottom:6px;}

                /* ====== FOOTER ====== */
                .c-footer{display:flex;justify-content:space-between;align-items:flex-end;padding:0 2mm;margin-top:6px;}
                .c-foot-col{text-align:center;min-width:110px;}
                .c-sig{font-family:'Great Vibes',cursive;font-size:22px;color:#1e3a5f;margin-bottom:1px;}
                .c-sig-name{font-weight:800;font-size:10px;color:#111;text-transform:uppercase;}
                .c-sig-title{font-size:9px;font-weight:600;color:#555;}

                .c-foot-mid{text-align:center;flex:1;}
                .c-foot-mid .cn{font-size:11px;font-weight:700;color:#111;}
                .c-foot-mid .cd{font-size:10px;font-weight:600;color:#444;}
                .c-foot-mid .cv{font-size:8px;color:#888;margin-top:2px;}

                .c-iso-sm{
                    width:48px;height:48px;border-radius:50%;margin:0 auto 4px;
                    border:2px solid #b8860b;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;font-size:6px;font-weight:800;
                    color:#1a1a1a;background:linear-gradient(135deg,#ffd700,#daa520);line-height:1.1;
                }

                /* ====== RED SEAL ====== */
                .c-seal{
                    position:absolute;bottom:130px;left:15mm;width:50px;height:50px;z-index:3;
                    background:radial-gradient(circle,#dc2626 30%,#991b1b 100%);border-radius:50%;
                    display:flex;flex-direction:column;align-items:center;justify-content:center;
                    color:#fff;font-size:5px;font-weight:800;text-align:center;line-height:1.1;
                    box-shadow:0 3px 12px rgba(153,27,27,.4);border:2px solid #fca5a5;
                }
                .c-seal .st{font-size:12px;margin-bottom:1px;}

                /* ====== ADDRESS BAR ====== */
                .c-addr{
                    background:linear-gradient(135deg,#f5e0b0,#ecd39a);
                    text-align:center;padding:6px 15px;font-size:9px;font-weight:700;
                    color:#333;letter-spacing:.3px;line-height:1.5;border-top:1px solid #b8860b;
                    position:relative;z-index:2;
                }
                .c-addr .ab{font-size:11px;font-weight:900;color:#111;margin-top:1px;}

                /* ====== BUTTONS ====== */
                .pb{
                    position:fixed;bottom:30px;right:30px;background:linear-gradient(135deg,#1E40AF,#3B82F6);color:#fff;
                    border:none;padding:14px 28px;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;
                    box-shadow:0 6px 25px rgba(30,64,175,.4);z-index:1000;display:flex;align-items:center;gap:8px;
                    transition:all .3s;font-family:'Inter',sans-serif;
                }
                .pb:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(30,64,175,.5);}
                .eb{
                    position:fixed;bottom:30px;right:220px;background:linear-gradient(135deg,#92400e,#d97706);color:#fff;
                    border:none;padding:14px 28px;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;
                    box-shadow:0 6px 25px rgba(217,119,6,.35);z-index:1000;display:flex;align-items:center;gap:8px;
                    transition:all .3s;font-family:'Inter',sans-serif;
                }
                .eb:hover{transform:translateY(-2px);}

                @media print{
                    body{background:#fff!important;margin:0;padding:0;}
                    .c-page{margin:0;box-shadow:none;width:210mm;min-height:297mm;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
                    .pb,.eb{display:none!important;}
                    @page{size:A4 portrait;margin:0;}
                }
            `}</style>

            <button className="eb" onClick={() => setReady(false)}>✏️ Edit Marks</button>
            <button className="pb" onClick={handlePrint}>🖨️ Print Certificate</button>

            <div className="c-page">
                {/* Maroon decorative corner — top left */}
                <div className="c-corner-tl">
                    <svg viewBox="0 0 180 180" fill="none">
                        <path d="M0 0 H180 C140 10 80 20 40 80 C20 120 10 150 0 180 Z" fill="#5a0000" opacity=".85" />
                        <path d="M0 0 H150 C120 10 60 15 30 65 C15 100 8 130 0 160 Z" fill="#8B0000" opacity=".7" />
                        <path d="M0 0 H100 C80 8 40 12 22 50 C10 80 5 100 0 120 Z" fill="#a01010" opacity=".5" />
                    </svg>
                </div>
                {/* Maroon decorative corner — top right */}
                <div className="c-corner-tr">
                    <svg viewBox="0 0 180 180" fill="none">
                        <path d="M180 0 H0 C40 10 100 20 140 80 C160 120 170 150 180 180 Z" fill="#5a0000" opacity=".85" />
                        <path d="M180 0 H30 C60 10 120 15 150 65 C165 100 172 130 180 160 Z" fill="#8B0000" opacity=".7" />
                        <path d="M180 0 H80 C100 8 140 12 158 50 C170 80 175 100 180 120 Z" fill="#a01010" opacity=".5" />
                    </svg>
                </div>
                {/* Gold ornamental corner — bottom right */}
                <div className="c-corner-bl-deco">
                    <svg viewBox="0 0 200 200" fill="none">
                        <path d="M200 200 C180 160 160 120 120 100 C80 80 40 70 0 60 L0 200 Z" fill="#b8860b" opacity=".3" />
                        <path d="M200 200 C185 170 170 140 140 120 C110 100 70 90 30 85 L30 200 Z" fill="#daa520" opacity=".15" />
                        <circle cx="60" cy="160" r="15" fill="#b8860b" opacity=".08" />
                        <circle cx="100" cy="170" r="10" fill="#b8860b" opacity=".06" />
                        <circle cx="140" cy="180" r="8" fill="#daa520" opacity=".1" />
                        <path d="M200 200 Q170 180 150 150 Q140 130 130 100" stroke="#b8860b" strokeWidth="1" opacity=".15" fill="none" />
                        <path d="M200 200 Q180 170 160 140 Q150 120 140 90" stroke="#daa520" strokeWidth=".5" opacity=".1" fill="none" />
                    </svg>
                </div>

                {/* Gold frame */}
                <div className="c-frame" />
                {/* Watermark */}
                <div className="c-watermark"><img src="/logo.png" alt="" /></div>

                <div className="c-content">
                    {/* Top badges row */}
                    <div className="c-top-badges">
                        <div className="c-badge c-msme">MSME<br />GOVT OF<br />INDIA</div>
                        <div className="c-badge c-digital">Digital<br />India</div>
                        <div className="c-main-logo"><img src="/logo.png" alt="Pretech" /></div>
                        <div className="c-badge c-make">MAKE<br />IN<br />INDIA</div>
                        <div className="c-badge c-govt">भारत<br />सरकार</div>
                    </div>

                    {/* Institute Name */}
                    <div className="c-inst">
                        <h1>Pretech Computer Education</h1>
                        <p className="c-iso-t">An ISO 9001:2015 Certified Organisation</p>
                    </div>

                    {/* Certificate Title */}
                    <div className="c-title"><h2>Certificate</h2></div>

                    {/* Body: ISO | Photo | QR */}
                    <div className="c-body-row">
                        <div className="c-side-col">
                            <div className="c-iso-badge">ISO<br />9001<br />2015<br />CERTIFIED</div>
                            <div className="c-iaf">IAF</div>
                        </div>

                        <div className="c-photo-col">
                            {student.passportPhoto ? (
                                <img src={student.passportPhoto} alt="Student" className="c-photo" />
                            ) : (
                                <div className="c-photo-ph">👤</div>
                            )}
                        </div>

                        <div className="c-qr-col">
                            <div className="c-qr-label">FOR ONLINE<br />VERIFICATION SCAN</div>
                            <div className="c-qr-wrap">
                                <QRCode value={verificationUrl} size={70} level="M" />
                            </div>
                        </div>
                    </div>

                    {/* Certify text */}
                    <div className="c-certify"><span>This is to certify that,</span></div>

                    {/* Student Name */}
                    <div className="c-student">
                        <h3>{student.name} {student.fatherHusbandName ? `${student.gender === 'Female' ? 'D/O' : 'S/O'} ${student.fatherHusbandName}` : ''}</h3>
                    </div>

                    {/* Red Banner */}
                    <div className="c-red-banner">
                        <span>PRETECH COMPUTER EDUCATION</span>
                    </div>

                    {/* Exam details */}
                    <div className="c-exam">
                        <span className="it">has passed the prescribed examination with </span>
                        <span className="vb">{grade}</span>
                        <span className="it"> Grade ( </span>
                        <span className="vb">{marks}%</span>
                        <span className="it"> Marks)</span>
                    </div>

                    <div className="c-awarded">has been awarded the</div>

                    {/* Course */}
                    <div className="c-course"><h4>{courseName}</h4></div>
                    <div className="c-course-meta">(COURSE DURATION: {courseDuration})</div>
                    <div className="c-course-meta">(COURSE PERIOD: {formatDate(regDate)} TO {formatDate(endDate)})</div>

                    {/* Standards */}
                    <div className="c-standards">
                        <span className="des">designed and developed as per the standards of</span>
                        <span className="inst-name">PRETECH COMPUTER EDUCATION</span>
                    </div>
                    <div className="c-standards-iso">An ISO 9001:2015 Certified Organisation</div>

                    {/* Footer */}
                    <div className="c-footer">
                        <div className="c-foot-col">
                            <div className="c-sig">Pankaj Gilhotra</div>
                            <div className="c-sig-name">PANKAJ GILHOTRA</div>
                            <div className="c-sig-title">Controller Of Examination</div>
                        </div>
                        <div className="c-foot-mid">
                            <div className="cn">Certificate No : {certNo}</div>
                            <div className="cd">Date Of Issue : {formatDate(issueDate)}</div>
                            <div className="cv">Online Certificate Verification available on :</div>
                        </div>
                        <div className="c-foot-col">
                            <div className="c-iso-sm"><span>ISO</span><span style={{ fontSize: '9px', fontWeight: 900 }}>9001</span><span>2015</span><span>CERTIFIED</span></div>
                            <div className="c-sig">Pankaj Gilhotra</div>
                            <div className="c-sig-name">PANKAJ GILHOTRA</div>
                            <div className="c-sig-title">DIRECTOR</div>
                        </div>
                    </div>

                    {/* Red seal */}
                    <div className="c-seal"><span className="st">★</span><span>CERTIFIED</span><span>VERIFIED</span></div>
                </div>

                {/* Address bar */}
                <div className="c-addr">
                    ADDRESS: B-35, MP NAGAR, BIKANER, RAJASTHAN
                    <div className="ab">CONTACT : +91 PANKAJ GILHOTRA (DIRECTOR)</div>
                </div>
            </div>
        </>
    );
};

export default StudentCertificate;
