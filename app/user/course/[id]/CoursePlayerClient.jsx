"use client";
// app/user/course/[id]/page.jsx  →  use as CoursePlayerClient.jsx
// Converted from React Router CoursePlayer.jsx
//
// Changes:
//   1. "use client" directive
//   2. import { useParams, useNavigate } from "react-router-dom"
//      → import { useParams, useRouter } from "next/navigation"
//   3. const navigate = useNavigate() → const router = useRouter()
//   4. navigate(path) → router.push(path)
//   5. supabase import: ../../lib/supabase → @/lib/supabase
//   6. All logic, CSS, sub-components identical

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const C = {
  blue:'#0056D2',blueDark:'#003A8C',blueLight:'#EBF2FF',
  teal:'#00BFA5',amber:'#F5A623',red:'#E8453C',
  ink:'#1A1A2E',slate:'#475569',muted:'#94A3B8',
  border:'#E2E8F4',bg:'#F4F7FB',white:'#FFFFFF',
  success:'#12B76A',successBg:'#ECFDF3',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=DM+Sans:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;max-width:100%;}
html,body{overflow-x:hidden;width:100%;}
body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.ink};-webkit-font-smoothing:antialiased;}
button,input,textarea,select{font-family:'DM Sans',sans-serif;}
img{display:block;max-width:100%;}
a{text-decoration:none;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
.fade-up{animation:fadeUp .3s ease both;}
.slide-in{animation:slideIn .3s ease both;}
:root{--header-h:54px;--sidebar-w:272px;}
.cp-shell{display:flex;flex-direction:column;min-height:100vh;width:100%;overflow-x:hidden;}
.cp-header{position:sticky;top:0;z-index:200;height:var(--header-h);background:${C.ink};color:${C.white};display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0;overflow:hidden;width:100%;box-shadow:0 2px 12px rgba(0,0,0,.2);}
.cp-header-menu{background:rgba(255,255,255,.1);border:none;color:${C.white};width:32px;height:32px;border-radius:8px;font-size:15px;display:none;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .15s;}
.cp-header-menu:hover{background:rgba(255,255,255,.18);}
.cp-header-back{background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.8);width:32px;height:32px;border-radius:8px;font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .15s;}
.cp-header-back:hover{background:rgba(255,255,255,.18);}
.cp-header-title{flex:1;min-width:0;font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:clamp(13px,3.2vw,16px);color:rgba(255,255,255,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cp-header-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.cp-progress-wrap{display:flex;align-items:center;gap:7px;}
.cp-progress-bar{width:clamp(44px,8vw,80px);height:3px;background:rgba(255,255,255,.15);border-radius:100px;overflow:hidden;}
.cp-progress-fill{height:100%;background:${C.teal};border-radius:100px;transition:width .5s ease;}
.cp-progress-pct{font-size:11px;font-weight:700;color:rgba(255,255,255,.65);white-space:nowrap;}
.cp-cert-btn{background:${C.amber};color:#78350F;border:none;border-radius:7px;padding:5px 11px;font-weight:700;font-size:clamp(10px,2.2vw,12px);cursor:pointer;white-space:nowrap;transition:opacity .15s;display:flex;align-items:center;gap:5px;}
.cp-cert-btn:hover{opacity:.88;}
@media(max-width:900px){.cp-header-menu{display:flex;}:root{--header-h:50px;}}
@media(min-width:901px){:root{--header-h:56px;}.cp-header{padding:0 22px;gap:14px;}}
.cp-body{display:flex;flex:1;position:relative;min-height:0;overflow:hidden;}
.cp-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:150;backdrop-filter:blur(2px);}
@media(max-width:900px){.cp-overlay.show{display:block;}}
.cp-sidebar{width:var(--sidebar-w);background:${C.white};border-right:1.5px solid ${C.border};display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;overflow-x:hidden;position:sticky;top:var(--header-h);height:calc(100vh - var(--header-h));}
@media(max-width:900px){.cp-sidebar{position:fixed;top:0;left:0;bottom:0;height:100dvh;z-index:160;transform:translateX(-100%);transition:transform .25s cubic-bezier(.4,0,.2,1);box-shadow:6px 0 24px rgba(0,0,0,.15);}.cp-sidebar.open{transform:translateX(0);}}
.cp-mod-head{padding:10px 14px;background:${C.bg};border-bottom:1.5px solid ${C.border};border-top:1.5px solid ${C.border};}
.cp-mod-head:first-child{border-top:none;}
.cp-mod-head-title{font-size:11px;font-weight:700;color:${C.ink};text-transform:uppercase;letter-spacing:.6px;}
.cp-mod-head-sub{font-size:10.5px;color:${C.muted};margin-top:3px;}
.cp-lesson-btn{display:flex;align-items:flex-start;gap:10px;width:100%;padding:10px 14px;background:transparent;border:none;border-left:3px solid transparent;text-align:left;cursor:pointer;transition:background .12s,border-color .12s;}
.cp-lesson-btn:hover{background:${C.bg};}
.cp-lesson-btn.active{background:${C.blueLight};border-left-color:${C.blue};}
.cp-lesson-icon{font-size:13px;flex-shrink:0;margin-top:1px;}
.cp-lesson-title{font-size:12px;line-height:1.45;word-break:break-word;min-width:0;}
.cp-main{flex:1;min-width:0;display:flex;flex-direction:column;overflow-x:hidden;}
.cp-video-wrap{width:100%;aspect-ratio:16/9;background:#000;flex-shrink:0;overflow:hidden;}
.cp-video-wrap iframe{width:100%;height:100%;display:block;border:none;}
.cp-content{width:100%;max-width:820px;margin:0 auto;padding:22px 16px 80px;}
@media(min-width:600px){.cp-content{padding:28px 24px 88px;}}
@media(min-width:1024px){.cp-content{padding:32px 32px 88px;}}
.cp-tabs{display:flex;border-bottom:1.5px solid ${C.border};margin-bottom:24px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;gap:0;}
.cp-tabs::-webkit-scrollbar{display:none;}
.cp-tab{padding:10px 0;background:none;border:none;border-bottom:2.5px solid transparent;font-size:13px;font-weight:600;color:${C.muted};cursor:pointer;transition:color .13s,border-color .13s;margin-right:22px;flex-shrink:0;white-space:nowrap;}
.cp-tab.active{color:${C.blue};border-bottom-color:${C.blue};}
.cp-tab:hover:not(.active){color:${C.slate};}
.cp-lesson-h{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(1.3rem,4vw,1.9rem);color:${C.ink};margin-bottom:18px;line-height:1.2;letter-spacing:-.02em;}
.cp-mark-btn{width:100%;margin-top:28px;padding:13px;border-radius:11px;border:none;font-weight:700;font-size:14.5px;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:8px;}
.cp-quiz-opt{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px solid ${C.border};border-radius:9px;cursor:pointer;transition:all .13s;margin-bottom:8px;background:${C.white};}
.cp-quiz-opt:hover:not(.sel){border-color:#B8CFEF;background:${C.bg};}
.cp-quiz-opt.sel{border-color:${C.blue};background:${C.blueLight};}
.cp-quiz-radio{width:18px;height:18px;border-radius:50%;flex-shrink:0;border:2px solid ${C.border};background:${C.white};display:flex;align-items:center;justify-content:center;transition:all .13s;}
.cp-quiz-opt.sel .cp-quiz-radio{border-color:${C.blue};background:${C.blue};}
.cp-notes-ta{width:100%;min-height:260px;padding:14px 16px;border-radius:11px;border:1.5px solid ${C.border};font-size:14px;line-height:1.8;color:${C.ink};resize:vertical;transition:border-color .15s;}
.cp-notes-ta:focus{outline:none;border-color:${C.blue};box-shadow:0 0 0 3px rgba(0,86,210,.1);}
.cp-post{background:${C.white};border-radius:11px;border:1.5px solid ${C.border};padding:14px 16px;margin-bottom:10px;transition:border-color .15s;}
.cp-post:hover{border-color:#C7DCFF;}
.cp-post-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;flex-wrap:wrap;}
.cp-post-author{font-weight:700;font-size:13px;}
.cp-post-date{font-size:11px;color:${C.muted};}
.cp-post-body{font-size:13.5px;color:${C.slate};line-height:1.7;word-break:break-word;}
.cp-toast{position:fixed;top:14px;left:16px;right:16px;z-index:9999;color:${C.white};padding:12px 20px;border-radius:11px;font-weight:700;font-size:13.5px;box-shadow:0 10px 28px rgba(0,0,0,.2);text-align:center;animation:fadeUp .3s ease;display:flex;align-items:center;justify-content:center;gap:8px;}
@media(min-width:480px){.cp-toast{left:50%;right:auto;transform:translateX(-50%);white-space:nowrap;}}
.cp-loading{display:flex;height:100vh;align-items:center;justify-content:center;flex-direction:column;gap:16px;background:${C.bg};}
.cp-spinner{width:38px;height:38px;border:3px solid ${C.border};border-top-color:${C.blue};border-radius:50%;animation:spin .75s linear infinite;}
input:focus,textarea:focus{outline:none;border-color:${C.blue}!important;box-shadow:0 0 0 3px rgba(0,86,210,.1)!important;}
`;

const extractYTId = url => {
  const m = url?.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]{11})/);
  return m?.[1] || null;
};
const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function QuizEngine({ lesson, userId, courseId, onPassed }) {
  const [quiz, setQuiz]         = useState(null);
  const [questions, setQs]      = useState([]);
  const [answers, setAnswers]   = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [phase, setPhase]       = useState('loading');
  const [result, setResult]     = useState(null);
  const [attempts, setAttempts] = useState(0);
  const timerRef  = useRef(null);
  const submitRef = useRef(null);

  useEffect(() => { init(); return () => clearInterval(timerRef.current); }, [lesson.id]);

  const init = async () => {
    setPhase('loading');
    let { data: qz } = await supabase.from('course_quizzes').select('*').eq('lesson_id', lesson.id).single();
    if (!qz) {
      const { data: nq } = await supabase.from('course_quizzes')
        .insert([{ lesson_id: lesson.id, passing_score: 70, max_attempts: 3 }]).select().single();
      qz = nq;
    }
    setQuiz(qz);
    const { data: qs } = await supabase.from('course_questions').select('*').eq('quiz_id', qz.id).order('order');
    const sorted = qz.shuffle_questions ? [...(qs || [])].sort(() => Math.random() - .5) : (qs || []);
    setQs(sorted);
    const { data: att } = await supabase.from('course_quiz_attempts')
      .select('id,passed,score').eq('quiz_id', qz.id).eq('user_id', userId);
    setAttempts(att?.length || 0);
    const lastPassed = att?.find(a => a.passed);
    if (lastPassed) { setResult({ passed: true, score: lastPassed.score, correct: 0, total: sorted.length }); setPhase('result'); return; }
    if (qz.time_limit) {
      const mins = parseInt(qz.time_limit) || 0;
      if (mins > 0) {
        setTimeLeft(mins * 60);
        timerRef.current = setInterval(() => {
          setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); submitRef.current?.(); return 0; } return t - 1; });
        }, 1000);
      }
    }
    setPhase('quiz');
  };

  const submit = useCallback(async () => {
    clearInterval(timerRef.current);
    if (!questions.length || !quiz) return;
    let correct = 0;
    questions.forEach(q => {
      const ua = answers[q.id], ca = q.correct_answer;
      if (q.question_type === 'text') { if ((ua||'').trim().toLowerCase() === (ca||'').trim().toLowerCase()) correct++; }
      else { if (ua === ca) correct++; }
    });
    const score  = Math.round((correct / questions.length) * 100);
    const passed = score >= (quiz.passing_score || 70);
    await supabase.from('course_quiz_attempts').insert({ user_id:userId, quiz_id:quiz.id, score, passed, answers:JSON.stringify(answers), completed_at:new Date() });
    setResult({ score, passed, correct, total:questions.length });
    setPhase('result');
    if (passed) onPassed();
  }, [quiz, questions, answers, userId, onPassed]);

  useEffect(() => { submitRef.current = submit; }, [submit]);

  if (phase === 'loading') return <div style={{ padding:40, textAlign:'center', color:C.muted }}><div className="cp-spinner" style={{ margin:'0 auto 14px' }}/>Loading quiz…</div>;
  if (!quiz) return <div style={{ padding:'16px 18px', background:'#FFF8EC', borderRadius:10, border:'1px solid #FDE68A', color:'#92400E', fontWeight:600, fontSize:13.5 }}>⚠️ This quiz has not been configured yet.</div>;

  if (phase === 'result' && result) {
    const remaining = (quiz.max_attempts || 3) - attempts;
    return (
      <div className="fade-up" style={{ background:result.passed?C.successBg:'#FEF2F1', border:`1.5px solid ${result.passed?'#A7F3D0':'#FECACA'}`, borderRadius:16, padding:'clamp(20px,5vw,32px)', textAlign:'center' }}>
        <div style={{ fontSize:52, marginBottom:14 }}>{result.passed?'🎉':'😔'}</div>
        <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:300, fontSize:'clamp(1.2rem,4vw,1.6rem)', color:result.passed?'#065F46':'#991B1B', marginBottom:8 }}>{result.passed?'Quiz Passed!':'Not quite this time'}</h3>
        <p style={{ fontSize:'clamp(2rem,6vw,2.6rem)', fontWeight:800, color:result.passed?C.success:C.red, marginBottom:8, lineHeight:1 }}>{result.score}%</p>
        <p style={{ color:C.muted, fontSize:13, marginBottom:24 }}>{result.correct} of {result.total} correct · Passing: {quiz.passing_score}%</p>
        {result.passed
          ? <div style={{ background:C.success, color:'#fff', display:'inline-flex', alignItems:'center', gap:7, padding:'10px 22px', borderRadius:9, fontWeight:700, fontSize:13 }}>✓ Marked complete — great work!</div>
          : remaining > 0
            ? <button style={{ background:C.blue, color:'#fff', border:'none', borderRadius:9, padding:'11px 26px', fontWeight:700, fontSize:14, cursor:'pointer' }} onClick={() => { setAnswers({}); setResult(null); init(); }}>Try Again ({remaining} attempt{remaining!==1?'s':''} left)</button>
            : <p style={{ color:C.red, fontWeight:600, fontSize:14 }}>No attempts remaining.</p>
        }
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, background:C.blueLight, borderRadius:11, padding:'14px 16px', marginBottom:22, border:'1.5px solid #C7DCFF' }}>
        <div>
          <div style={{ fontWeight:700, color:C.ink, fontSize:13.5 }}>Quiz · {questions.length} question{questions.length!==1?'s':''}</div>
          <div style={{ fontSize:11.5, color:C.slate, marginTop:2 }}>Passing: {quiz.passing_score}% · Attempt {attempts+1}/{quiz.max_attempts}</div>
        </div>
        {timeLeft!==null&&<div style={{ background:timeLeft<60?'#FEF2F1':C.white, color:timeLeft<60?C.red:C.blue, border:`1.5px solid ${timeLeft<60?'#FECACA':C.border}`, padding:'8px 16px', borderRadius:9, fontWeight:800, fontSize:18 }}>⏱ {fmtTime(timeLeft)}</div>}
      </div>
      {questions.map((q, idx) => {
        const rawOpts = q.options ? (typeof q.options==='string'?JSON.parse(q.options):q.options) : [];
        const opts = q.question_type==='true_false'?[{id:'true',text:'True'},{id:'false',text:'False'}]:rawOpts;
        return (
          <div key={q.id} style={{ marginBottom:16, background:C.white, borderRadius:12, border:`1.5px solid ${C.border}`, padding:'18px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
            <p style={{ fontWeight:700, fontSize:13.5, color:C.ink, marginBottom:14, lineHeight:1.5 }}>
              <span style={{ color:C.blue, marginRight:7 }}>Q{idx+1}.</span>{q.question_text}
              {q.points>1&&<span style={{ marginLeft:8, fontSize:11, color:C.muted, fontWeight:500 }}>({q.points} pts)</span>}
            </p>
            {(q.question_type==='multiple_choice'||q.question_type==='single_choice'||q.question_type==='true_false')&&(
              <div>{opts.map(opt=>{ const id=typeof opt==='object'?opt.id:opt; const txt=typeof opt==='object'?opt.text:opt; const sel=answers[q.id]===id; return (<div key={id} className={`cp-quiz-opt${sel?' sel':''}`} onClick={()=>setAnswers(p=>({...p,[q.id]:id}))}><div className="cp-quiz-radio">{sel&&<div style={{ width:7,height:7,borderRadius:'50%',background:'#fff' }}/>}</div><span style={{ fontSize:13.5,color:sel?C.blue:C.ink,fontWeight:sel?600:400 }}>{txt}</span></div>); })}</div>
            )}
            {q.question_type==='text'&&<input value={answers[q.id]||''} onChange={e=>setAnswers(p=>({...p,[q.id]:e.target.value}))} placeholder="Type your answer…" style={{ width:'100%',padding:'10px 13px',borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:13.5,color:C.ink }}/>}
          </div>
        );
      })}
      <button onClick={submit} disabled={answered<questions.length} className="cp-mark-btn" style={{ background:answered<questions.length?C.border:C.blue, color:answered<questions.length?C.muted:'#fff', cursor:answered<questions.length?'not-allowed':'pointer', boxShadow:answered>=questions.length?'0 4px 16px rgba(0,86,210,.25)':'none' }}>
        Submit Quiz ({answered}/{questions.length} answered)
      </button>
    </div>
  );
}

function NotesPanel({ lessonId, userId }) {
  const [content, setContent] = useState('');
  const [status, setStatus]   = useState('idle');
  const [loaded, setLoaded]   = useState(false);
  const saveTimer = useRef(null);
  useEffect(() => {
    setLoaded(false);
    supabase.from('course_notes').select('content').eq('lesson_id',lessonId).eq('user_id',userId).single()
      .then(({ data }) => { setContent(data?.content||''); setLoaded(true); });
    return () => clearTimeout(saveTimer.current);
  }, [lessonId, userId]);
  const handleChange = val => {
    setContent(val); setStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase.from('course_notes').upsert({ lesson_id:lessonId, user_id:userId, content:val, updated_at:new Date() }, { onConflict:'lesson_id,user_id' });
      setStatus('saved'); setTimeout(()=>setStatus('idle'), 2200);
    }, 1000);
  };
  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:16 }}>
        <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:300, fontSize:20, color:C.ink }}>My Notes</h3>
        <div style={{ fontSize:12, fontWeight:600 }}>
          {status==='saved'&&<span style={{ color:C.success }}>✓ Saved</span>}
          {status==='saving'&&<span style={{ color:C.amber }}>● Saving…</span>}
          {status==='idle'&&<span style={{ color:C.muted }}>Auto-saves as you type</span>}
        </div>
      </div>
      <textarea className="cp-notes-ta" value={loaded?content:''} onChange={e=>handleChange(e.target.value)} disabled={!loaded} placeholder="Take notes for this lesson — private to you, auto-saved." style={{ background:loaded?C.white:C.bg }}/>
    </div>
  );
}

function DiscussionForum({ lessonId, userId, userName }) {
  const [posts, setPosts]     = useState([]);
  const [body, setBody]       = useState('');
  const [posting, setPosting] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  useEffect(() => {
    setLoaded(false);
    supabase.from('course_discussions').select('*').eq('lesson_id',lessonId).order('created_at',{ascending:false})
      .then(({ data }) => { setPosts(data||[]); setLoaded(true); });
  }, [lessonId]);
  const post = async () => {
    if (!body.trim()) return; setPosting(true);
    const { data, error } = await supabase.from('course_discussions').insert({ lesson_id:lessonId, user_id:userId, user_name:userName, body:body.trim() }).select().single();
    if (!error&&data) { setPosts(p=>[data,...p]); }
    else { setPosts(p=>[{ id:Date.now(), user_id:userId, user_name:userName, body:body.trim(), created_at:new Date().toISOString() },...p]); }
    setBody(''); setPosting(false);
  };
  return (
    <div className="fade-up">
      <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:300, fontSize:20, color:C.ink, marginBottom:18 }}>Discussion</h3>
      <div style={{ border:`1.5px solid ${C.border}`, borderRadius:12, overflow:'hidden', marginBottom:24, background:C.white }}>
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Ask a question, share a thought…" style={{ width:'100%',padding:'13px 15px',border:'none',resize:'none',fontSize:13.5,lineHeight:1.7,color:C.ink,minHeight:80,outline:'none' }}/>
        <div style={{ background:C.bg, padding:'9px 13px', display:'flex', justifyContent:'flex-end', borderTop:`1.5px solid ${C.border}` }}>
          <button onClick={post} disabled={posting||!body.trim()} style={{ background:body.trim()?C.blue:C.border, color:body.trim()?C.white:C.muted, border:'none', borderRadius:8, padding:'7px 18px', fontWeight:700, fontSize:13, cursor:body.trim()?'pointer':'not-allowed' }}>{posting?'Posting…':'Post'}</button>
        </div>
      </div>
      {!loaded ? <div style={{ color:C.muted, fontSize:13 }}>Loading discussion…</div>
        : posts.length===0 ? <div style={{ textAlign:'center', padding:'36px 0', color:C.muted, fontSize:13.5 }}><div style={{ fontSize:32, marginBottom:10 }}>💬</div>No posts yet — start the conversation!</div>
        : posts.map(p=>(
          <div key={p.id} className="cp-post">
            <div className="cp-post-meta">
              <span className="cp-post-author" style={{ color:p.user_id===userId?C.blue:C.ink }}>{p.user_id===userId?'👤 You':`👤 ${p.user_name||'Learner'}`}</span>
              <span className="cp-post-date">{new Date(p.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
            </div>
            <p className="cp-post-body">{p.body}</p>
          </div>
        ))
      }
    </div>
  );
}

function AssignmentSubmit({ lesson, userId, onSubmitted, showToast }) {
  const [file, setFile]             = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [existingSub, setExisting]  = useState(null);
  const [assignment, setAssignment] = useState(null);
  useEffect(() => {
    (async () => {
      const { data: a } = await supabase.from('course_assignments').select('*').eq('lesson_id',lesson.id).maybeSingle();
      if (!a) return; setAssignment(a);
      const { data: sub } = await supabase.from('course_assignment_submissions').select('*').eq('assignment_id',a.id).eq('user_id',userId).maybeSingle();
      if (sub) { setExisting(sub); setSubmitted(true); }
    })();
  }, [lesson.id, userId]);
  const handleSubmit = async () => {
    if (!file) { showToast('Please select a file first.','error'); return; }
    setSubmitting(true);
    try {
      let a = assignment;
      if (!a) { const { data: newA } = await supabase.from('course_assignments').insert([{ lesson_id:lesson.id, instructions:'', total_points:100 }]).select().single(); a=newA; setAssignment(newA); }
      const ext=file.name.split('.').pop(); const filePath=`${userId}/${lesson.id}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('assignment-submissions').upload(filePath,file);
      if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);
      const { data: urlData } = supabase.storage.from('assignment-submissions').getPublicUrl(filePath);
      const { data: newSub, error: dbErr } = await supabase.from('course_assignment_submissions').insert([{ assignment_id:a.id, user_id:userId, file_url:urlData.publicUrl, submitted_at:new Date() }]).select().single();
      if (dbErr) throw new Error(`Save failed: ${dbErr.message}`);
      setExisting(newSub); setSubmitted(true); showToast('✓ Assignment submitted!'); onSubmitted();
    } catch (e) { showToast(e.message,'error'); }
    setSubmitting(false);
  };
  return (
    <div style={{ background:'#F0FDF4', border:'1.5px solid #A7F3D0', borderRadius:13, padding:'20px 18px' }}>
      <h3 style={{ fontWeight:700, color:'#065F46', marginBottom:7, fontSize:15, display:'flex', alignItems:'center', gap:7 }}>📝 Assignment</h3>
      {assignment?.instructions&&<p style={{ color:'#047857', fontSize:13.5, lineHeight:1.7, marginBottom:16 }}>{assignment.instructions}</p>}
      {submitted
        ? <div style={{ display:'flex', alignItems:'center', gap:10, background:'#D1FAE5', borderRadius:9, padding:'10px 14px', flexWrap:'wrap' }}>
            <span style={{ fontSize:20 }}>✅</span>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:700, color:'#065F46', fontSize:13.5 }}>Assignment submitted</p>
              {existingSub?.submitted_at&&<p style={{ fontSize:11, color:'#047857', marginTop:2 }}>{new Date(existingSub.submitted_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>}
            </div>
            {existingSub?.file_url&&<a href={existingSub.file_url} target="_blank" rel="noreferrer" style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'6px 13px',background:'#065F46',color:'#fff',borderRadius:7,fontSize:12,fontWeight:700 }}>📎 View file</a>}
          </div>
        : <>
            <p style={{ color:'#047857', fontSize:13.5, lineHeight:1.65, marginBottom:14 }}>Upload your completed work for instructor review.</p>
            <input type="file" onChange={e=>setFile(e.target.files[0])} style={{ display:'block',marginBottom:12,maxWidth:'100%',fontSize:13 }}/>
            {file&&<p style={{ fontSize:12,color:'#065F46',marginBottom:12 }}>📄 <strong>{file.name}</strong> · {(file.size/1024).toFixed(1)} KB</p>}
            <button onClick={handleSubmit} disabled={!file||submitting} style={{ background:file&&!submitting?'#12B76A':C.muted, color:'#fff', border:'none', borderRadius:9, padding:'10px 22px', fontWeight:700, fontSize:13, cursor:file&&!submitting?'pointer':'not-allowed' }}>
              {submitting?'⏳ Uploading…':'📤 Submit Assignment'}
            </button>
          </>
      }
    </div>
  );
}

export default function CoursePlayerClient() {
  const params   = useParams();
  const courseId = params.id;
  const router   = useRouter(); // ← replaces useNavigate

  const [user, setUser]                   = useState(null);
  const [course, setCourse]               = useState(null);
  const [modules, setModules]             = useState([]);
  const [lessons, setLessons]             = useState([]);
  const [enrollment, setEnrollment]       = useState(null);
  const [completedIds, setCompletedIds]   = useState([]);
  const [certificate, setCertificate]     = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState('content');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [marking, setMarking]             = useState(false);
  const [toast, setToast]                 = useState(null);

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(()=>setToast(null), 4000); };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return; } // ← router.push
      setUser(data.user); boot(data.user.id);
    });
  }, [courseId]);

  const boot = async userId => {
    setLoading(true);
    const { data: c } = await supabase.from('course_courses').select('*').eq('id',courseId).single();
    if (!c) { alert('Course not found'); setLoading(false); return; }
    setCourse(c);
    const { data: e } = await supabase.from('course_enrollments').select('*').eq('course_id',courseId).eq('user_id',userId).single();
    if (!e) { alert('You are not enrolled.'); router.push('/user/learn'); return; }
    setEnrollment(e);
    const { data: cert } = await supabase.from('course_certificates').select('*').eq('course_id',courseId).eq('user_id',userId).single();
    if (cert) setCertificate(cert);
    const { data: mods } = await supabase.from('course_modules').select('*').eq('course_id',courseId).order('order');
    setModules(mods||[]);
    const modIds = (mods||[]).map(m=>m.id);
    const { data: less } = await supabase.from('course_lessons').select('*').in('module_id',modIds.length?modIds:['__none__']).order('order');
    setLessons(less||[]);
    const { data: comp } = await supabase.from('course_lesson_completion').select('lesson_id').eq('course_id',courseId).eq('user_id',userId);
    const ids = comp?.map(c=>c.lesson_id)||[];
    setCompletedIds(ids);
    if (less?.length) { const next=less.find(l=>!ids.includes(l.id)); setCurrentLesson(next||less[0]); }
    setLoading(false);
  };

  const markComplete = async () => {
    if (!currentLesson||completedIds.includes(currentLesson.id)||marking) return;
    setMarking(true);
    await supabase.from('course_lesson_completion').insert({ user_id:user.id, lesson_id:currentLesson.id, course_id:course.id });
    const newIds   = [...completedIds, currentLesson.id];
    const progress = Math.round((newIds.length/lessons.length)*100);
    setCompletedIds(newIds);
    await supabase.from('course_enrollments').update({ progress_percent:progress, last_accessed_at:new Date() }).eq('user_id',user.id).eq('course_id',course.id);
    setEnrollment(p=>({...p, progress_percent:progress}));
    if (progress===100) {
      showToast('🎉 Course complete! Checking for certificate…');
      setTimeout(async () => {
        const { data: cert } = await supabase.from('course_certificates').select('*').eq('course_id',course.id).eq('user_id',user.id).single();
        if (cert) { setCertificate(cert); showToast('🏆 Certificate earned!'); }
      }, 1800);
    } else { showToast('✓ Lesson complete!'); window.scrollTo({top:0,behavior:'smooth'}); }
    const idx = lessons.findIndex(l=>l.id===currentLesson.id);
    if (idx<lessons.length-1) setCurrentLesson(lessons[idx+1]);
    setMarking(false);
  };

  const selectLesson = lesson => { setCurrentLesson(lesson); setSidebarOpen(false); setTab('content'); window.scrollTo({top:0,behavior:'smooth'}); };

  const progress   = enrollment?.progress_percent||0;
  const isComplete = completedIds.includes(currentLesson?.id||'');

  if (loading) return (
    <div className="cp-loading">
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div className="cp-spinner"/>
      <p style={{ color:C.muted, fontWeight:600, fontSize:13.5, fontFamily:'DM Sans,sans-serif' }}>Loading your course…</p>
    </div>
  );

  const userName = user?.user_metadata?.full_name||user?.email?.split('@')[0]||'Learner';

  return (
    <>
      <style>{CSS}</style>
      {toast&&<div className="cp-toast" style={{ background:toast.type==='error'?C.red:'#0F172A' }}><span>{toast.type==='error'?'⚠️':'✓'}</span>{toast.msg}</div>}
      <div className="cp-shell">
        <header className="cp-header">
          <button className="cp-header-menu" onClick={()=>setSidebarOpen(v=>!v)} aria-label="Toggle lessons">{sidebarOpen?'✕':'☰'}</button>
          <span className="cp-header-title">{course?.title}</span>
          <div className="cp-header-right">
            <div className="cp-progress-wrap">
              <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width:`${progress}%` }}/></div>
              <span className="cp-progress-pct">{progress}%</span>
            </div>
            {certificate&&<button className="cp-cert-btn" onClick={()=>router.push(`/user/certificate/${certificate.id}`)}>🏆 <span>Cert</span></button>}
          </div>
        </header>
        <div className="cp-body">
          <div className={`cp-overlay${sidebarOpen?' show':''}`} onClick={()=>setSidebarOpen(false)}/>
          <nav className={`cp-sidebar${sidebarOpen?' open':''}`}>
            {modules.map(mod=>{
              const modLessons   = lessons.filter(l=>l.module_id===mod.id);
              const modCompleted = modLessons.filter(l=>completedIds.includes(l.id)).length;
              return (
                <div key={mod.id}>
                  <div className="cp-mod-head">
                    <div className="cp-mod-head-title">M{mod.order}: {mod.title}</div>
                    <div className="cp-mod-head-sub">{modCompleted}/{modLessons.length} completed</div>
                  </div>
                  {modLessons.map(lesson=>{
                    const done   = completedIds.includes(lesson.id);
                    const active = currentLesson?.id===lesson.id;
                    const icon   = {video:'▶',article:'📄',quiz:'❓',assignment:'📝'}[lesson.content_type]||'📄';
                    return (
                      <button key={lesson.id} className={`cp-lesson-btn${active?' active':''}`} onClick={()=>selectLesson(lesson)}>
                        <span className="cp-lesson-icon">{done?'✅':icon}</span>
                        <span className="cp-lesson-title" style={{ color:active?C.blue:C.ink, fontWeight:active?700:400 }}>{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
          <div className="cp-main">
            {currentLesson ? (
              <>
                {currentLesson.content_type==='video'&&currentLesson.content_url&&(
                  <div className="cp-video-wrap">
                    <iframe src={`https://www.youtube.com/embed/${extractYTId(currentLesson.content_url)}?rel=0&modestbranding=1`} title={currentLesson.title} allowFullScreen/>
                  </div>
                )}
                <div className="cp-content">
                  <div className="cp-tabs">
                    {[{key:'content',label:currentLesson.content_type==='quiz'?'❓ Quiz':'📄 Content'},{key:'notes',label:'📓 Notes'},{key:'discuss',label:'💬 Discussion'}].map(t=>(
                      <button key={t.key} className={`cp-tab${tab===t.key?' active':''}`} onClick={()=>setTab(t.key)}>{t.label}</button>
                    ))}
                  </div>
                  {tab==='content'&&(
                    <div className="fade-up">
                      <h2 className="cp-lesson-h">{currentLesson.title}</h2>
                      {currentLesson.content_type==='article'&&<div style={{ fontSize:15, lineHeight:1.85, color:C.slate, marginBottom:28 }} dangerouslySetInnerHTML={{ __html:(currentLesson.content_text||'').replace(/\n/g,'<br/>') }}/>}
                      {currentLesson.content_type==='video'&&currentLesson.description&&<p style={{ fontSize:14.5, lineHeight:1.8, color:C.slate, marginBottom:28 }}>{currentLesson.description}</p>}
                      {currentLesson.content_type==='quiz'&&user&&<QuizEngine lesson={currentLesson} userId={user.id} courseId={course.id} onPassed={markComplete}/>}
                      {currentLesson.content_type==='assignment'&&user&&<AssignmentSubmit lesson={currentLesson} userId={user.id} onSubmitted={markComplete} showToast={showToast}/>}
                      {currentLesson.content_type!=='quiz'&&(
                        <button onClick={markComplete} disabled={isComplete||marking} className="cp-mark-btn" style={{ background:isComplete?C.successBg:marking?C.border:C.blue, color:isComplete?C.success:marking?C.muted:'#fff', cursor:isComplete||marking?'not-allowed':'pointer', boxShadow:!isComplete&&!marking?'0 4px 16px rgba(0,86,210,.22)':'none' }}>
                          {isComplete?<><span>✓</span> Completed</>:marking?<><span style={{ animation:'spin .75s linear infinite',display:'inline-block' }}>⏳</span> Saving…</>:<>Mark Complete &amp; Continue →</>}
                        </button>
                      )}
                    </div>
                  )}
                  {tab==='notes'&&user&&<NotesPanel lessonId={currentLesson.id} userId={user.id}/>}
                  {tab==='discuss'&&user&&<DiscussionForum lessonId={currentLesson.id} userId={user.id} userName={userName}/>}
                </div>
              </>
            ) : (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14, padding:40, textAlign:'center' }}>
                <div style={{ width:72, height:72, borderRadius:20, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>👈</div>
                <div>
                  <p style={{ fontFamily:"'Fraunces',serif", fontWeight:300, fontSize:20, color:C.slate, marginBottom:5 }}>Select a lesson</p>
                  <p style={{ fontSize:13, color:C.muted }}>to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}