import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";
 
const TEAM = ["Martin", "Mariana", "Antonella", "Matias", "Andrés", "Sergio", "Lucila"];
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const DAY_SHORT = ["L", "Ma", "Mi", "J", "V"];
const COLORS = [
  "#E8705A","#5A9BE8","#7EC88A","#E8C45A","#B45AE8",
  "#E87CAE","#5AE8D4","#E8955A"
];
 
const today = new Date();
const todayName = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][today.getDay()];
 
function getWeekLabel() {
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  return `${mon.getDate()}/${mon.getMonth()+1} – ${fri.getDate()}/${fri.getMonth()+1}/${fri.getFullYear()}`;
}
 
export default function App() {
  const [schedule, setSchedule] = useState({});
  const [selected, setSelected] = useState(null);
  const [myDays, setMyDays] = useState(Array(5).fill(false));
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState("week");
  const [activeDay, setActiveDay] = useState(DAYS.indexOf(todayName) >= 0 ? DAYS.indexOf(todayName) : 0);
  const [connected, setConnected] = useState(false);
 
  // Sync desde Firebase en tiempo real
  useEffect(() => {
    const scheduleRef = ref(db, "schedule");
    const unsub = onValue(scheduleRef, (snapshot) => {
      setSchedule(snapshot.val() || {});
      setConnected(true);
    });
    return () => unsub();
  }, []);
 
  useEffect(() => {
    if (selected) setMyDays(schedule[selected] || Array(5).fill(false));
  }, [selected, schedule]);
 
  const toggleDay = (i) => setMyDays(myDays.map((v, idx) => idx === i ? !v : v));
 
  const handleSave = async () => {
    if (!selected) return;
    await set(ref(db, `schedule/${selected}`), myDays);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
 
  const getPresentes = (di) => TEAM.filter(p => schedule[p] ? !schedule[p][di] : true);
  const getHO = (di) => TEAM.filter(p => schedule[p]?.[di]);
  const totalRegistered = TEAM.filter(p => schedule[p]).length;
 
  return (
    <div style={{ minHeight:"100vh", background:"#0F1117", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#F0EDE8", padding:0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#1A1D27;}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
        .person-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;transition:background 0.1s;}
        .person-row:hover{background:rgba(255,255,255,0.04);}
        .avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;}
        .toggle-btn{padding:7px 18px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.15);background:transparent;color:#aaa;cursor:pointer;font-size:13px;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .toggle-btn.active{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.35);color:#fff;}
        .save-btn{width:100%;padding:12px;border-radius:12px;border:none;background:#E8705A;color:#fff;font-size:15px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .save-btn:hover{background:#f07d69;}
        .save-btn:disabled{opacity:0.4;cursor:default;}
        .select-person{width:100%;padding:10px 14px;border-radius:10px;background:#1E2130;border:1.5px solid rgba(255,255,255,0.1);color:#F0EDE8;font-size:14px;font-family:'DM Sans',sans-serif;cursor:pointer;outline:none;appearance:none;}
        .select-person:focus{border-color:rgba(255,255,255,0.3);}
        .card{background:#161924;border-radius:16px;border:1px solid rgba(255,255,255,0.07);}
        .section-title{font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#666;margin-bottom:12px;}
        .day-chip{padding:6px 14px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:1.5px solid transparent;transition:all 0.15s;user-select:none;}
        @media(max-width:700px){.main-grid{grid-template-columns:1fr !important;}.week-grid{grid-template-columns:1fr 1fr !important;}}
      `}</style>
 
      {/* Header */}
      <div style={{ background:"#161924", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"#E8705A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏢</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, letterSpacing:"-0.01em" }}>Presencialidad</div>
            <div style={{ fontSize:12, color:"#666" }}>Semana {getWeekLabel()}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background: connected ? "#7EC88A" : "#666", boxShadow: connected ? "0 0 6px #7EC88A" : "none" }} title={connected ? "Conectado en tiempo real" : "Conectando..."} />
          <div style={{ display:"flex", gap:4 }}>
            <button className={`toggle-btn ${view==="week"?"active":""}`} onClick={()=>setView("week")}>Semana</button>
            <button className={`toggle-btn ${view==="day"?"active":""}`} onClick={()=>setView("day")}>Por día</button>
          </div>
        </div>
      </div>
 
      <div className="main-grid" style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px", display:"grid", gridTemplateColumns:"1fr 300px", gap:20 }}>
 
        {/* LEFT */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
 
          {view === "week" ? (
            <div className="card" style={{ padding:20 }}>
              <p className="section-title">Vista semanal — quién viene</p>
              <div className="week-grid" style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
                {DAYS.map((day, di) => {
                  const presentes = getPresentes(di);
                  const ho = getHO(di);
                  const pct = Math.round((presentes.length / TEAM.length) * 100);
                  const isToday = day === todayName;
                  return (
                    <div key={day} onClick={() => { setView("day"); setActiveDay(di); }}
                      style={{ borderRadius:12, background: isToday ? "rgba(232,112,90,0.08)" : "#1E2130", border:`1.5px solid ${isToday ? "rgba(232,112,90,0.4)" : "rgba(255,255,255,0.06)"}`, padding:"14px 12px", cursor:"pointer" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:11, color:"#666", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>{DAY_SHORT[di]}</div>
                          <div style={{ fontSize:15, fontWeight:700, marginTop:1 }}>{day}</div>
                        </div>
                        {isToday && <span style={{ fontSize:9, background:"#E8705A", color:"#fff", padding:"2px 7px", borderRadius:20, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase" }}>Hoy</span>}
                      </div>
                      <div style={{ height:4, borderRadius:4, background:"rgba(255,255,255,0.08)", marginBottom:10, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background: pct>60?"#7EC88A":pct>30?"#E8C45A":"#E8705A", borderRadius:4, transition:"width 0.4s" }} />
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
                        {presentes.length === 0
                          ? <span style={{ fontSize:11, color:"#555", fontStyle:"italic" }}>Nadie</span>
                          : presentes.map(p => (
                            <div key={p} className="avatar" style={{ width:26, height:26, fontSize:10, background:COLORS[TEAM.indexOf(p)%COLORS.length]+"33", color:COLORS[TEAM.indexOf(p)%COLORS.length], border:`1.5px solid ${COLORS[TEAM.indexOf(p)%COLORS.length]}55` }} title={p}>{p[0]}</div>
                          ))}
                      </div>
                      <div style={{ fontSize:11, color:"#555" }}>
                        <span style={{ color:"#7EC88A", fontWeight:600 }}>{presentes.length}</span> presentes · <span style={{ color:"#E8705A", fontWeight:600 }}>{ho.length}</span> HO
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding:20 }}>
              <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                {DAYS.map((day, di) => (
                  <button key={day} className="day-chip" onClick={() => setActiveDay(di)}
                    style={{ background:activeDay===di?"#E8705A":"#1E2130", color:activeDay===di?"#fff":"#888", borderColor:activeDay===di?"#E8705A":"rgba(255,255,255,0.08)" }}>
                    {DAY_SHORT[di]}
                  </button>
                ))}
              </div>
              <p className="section-title">{DAYS[activeDay]} — detalle</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ background:"#1E2130", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(126,200,138,0.2)" }}>
                  <div style={{ fontSize:11, color:"#7EC88A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>🏢 Oficina ({getPresentes(activeDay).length})</div>
                  {getPresentes(activeDay).length === 0
                    ? <div style={{ color:"#555", fontSize:13, fontStyle:"italic" }}>Nadie confirmado</div>
                    : getPresentes(activeDay).map(p => (
                      <div key={p} className="person-row">
                        <div className="avatar" style={{ background:COLORS[TEAM.indexOf(p)%COLORS.length]+"33", color:COLORS[TEAM.indexOf(p)%COLORS.length], border:`1.5px solid ${COLORS[TEAM.indexOf(p)%COLORS.length]}55` }}>{p[0]}</div>
                        <span style={{ fontSize:14, fontWeight:500 }}>{p}</span>
                      </div>
                    ))}
                </div>
                <div style={{ background:"#1E2130", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(232,112,90,0.2)" }}>
                  <div style={{ fontSize:11, color:"#E8705A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>🏠 Home Office ({getHO(activeDay).length})</div>
                  {getHO(activeDay).length === 0
                    ? <div style={{ color:"#555", fontSize:13, fontStyle:"italic" }}>Nadie</div>
                    : getHO(activeDay).map(p => (
                      <div key={p} className="person-row">
                        <div className="avatar" style={{ background:COLORS[TEAM.indexOf(p)%COLORS.length]+"22", color:COLORS[TEAM.indexOf(p)%COLORS.length]+"99", border:`1.5px solid ${COLORS[TEAM.indexOf(p)%COLORS.length]}33` }}>{p[0]}</div>
                        <span style={{ fontSize:14, color:"#777" }}>{p}</span>
                      </div>
                    ))}
                </div>
              </div>
              {(() => {
                const sin = TEAM.filter(p => !schedule[p]);
                if (sin.length === 0) return null;
                return (
                  <div style={{ marginTop:12, background:"#1E2130", borderRadius:10, padding:"10px 14px", border:"1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize:11, color:"#555", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>Sin completar ({sin.length}): </span>
                    <span style={{ fontSize:12, color:"#555" }}>{sin.join(", ")}</span>
                  </div>
                );
              })()}
            </div>
          )}
 
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { label:"Confirmaron", value:`${totalRegistered}/${TEAM.length}`, color:"#7EC88A" },
              { label:"Mejor día", value: (() => { let best=0,bestDay="—"; DAYS.forEach((d,i)=>{ if(getPresentes(i).length>best){best=getPresentes(i).length;bestDay=d;} }); return bestDay; })(), color:"#E8C45A" },
              { label:"Peor día", value: (() => { let worst=99,worstDay="—"; DAYS.forEach((d,i)=>{ if(getPresentes(i).length<worst){worst=getPresentes(i).length;worstDay=d;} }); return worstDay; })(), color:"#E8705A" },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding:"14px 16px" }}>
                <div style={{ fontSize:11, color:"#555", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:s.color, fontFamily:"'DM Mono',monospace" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* RIGHT */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="card" style={{ padding:20 }}>
            <p className="section-title">Mi semana</p>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#555", marginBottom:6 }}>Soy...</div>
              <div style={{ position:"relative" }}>
                <select className="select-person" value={selected||""} onChange={e=>setSelected(e.target.value||null)}>
                  <option value="">Seleccioná tu nombre</option>
                  {TEAM.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
                <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#666" }}>▾</div>
              </div>
            </div>
            {selected && (
              <>
                <div style={{ fontSize:12, color:"#555", marginBottom:10 }}>Marcá tus días de home office:</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                  {DAYS.map((day,i) => (
                    <div key={day} onClick={()=>toggleDay(i)}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:10, cursor:"pointer", background:myDays[i]?"rgba(232,112,90,0.12)":"rgba(126,200,138,0.08)", border:`1.5px solid ${myDays[i]?"rgba(232,112,90,0.3)":"rgba(126,200,138,0.2)"}`, transition:"all 0.15s" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:16 }}>{myDays[i]?"🏠":"🏢"}</span>
                        <span style={{ fontSize:14, fontWeight:500 }}>{day}</span>
                      </div>
                      <span style={{ fontSize:12, fontWeight:600, color:myDays[i]?"#E8705A":"#7EC88A" }}>{myDays[i]?"HO":"Oficina"}</span>
                    </div>
                  ))}
                </div>
                <button className="save-btn" onClick={handleSave}>{saved?"✓ Guardado":"Guardar mi semana"}</button>
              </>
            )}
            {!selected && <div style={{ textAlign:"center", padding:"24px 0", color:"#444", fontSize:13 }}>Seleccioná tu nombre para<br/>registrar tus días</div>}
          </div>
 
          <div className="card" style={{ padding:20 }}>
            <p className="section-title">Estado del equipo</p>
            {TEAM.map(p => {
              const hasData = !!schedule[p];
              const hoCount = hasData ? schedule[p].filter(Boolean).length : null;
              const ci = TEAM.indexOf(p) % COLORS.length;
              return (
                <div key={p} className="person-row" style={{ justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div className="avatar" style={{ background:COLORS[ci]+"33", color:COLORS[ci], border:`1.5px solid ${COLORS[ci]}55` }}>{p[0]}</div>
                    <span style={{ fontSize:14, fontWeight:500 }}>{p}</span>
                  </div>
                  {hasData
                    ? <span style={{ fontSize:11, color:"#666" }}>{5-hoCount}d of · {hoCount}d HO</span>
                    : <span style={{ fontSize:11, color:"#444", fontStyle:"italic" }}>Sin completar</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
