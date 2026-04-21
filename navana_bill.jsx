import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_LABELS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const INITIAL_EMPLOYEES = [
  { id: 1, name: "Mohammad Asaduzzaman", empId: "20136", designation: "Depot Manager", joinMonth: 0, leaveMonth: null },
  { id: 2, name: "Rajib Kumar Mondol", empId: "22868", designation: "Depot Accountant", joinMonth: 0, leaveMonth: null },
  { id: 3, name: "Md. Abdul Aziz", empId: "24548", designation: "Sr. Store In-Charge", joinMonth: 0, leaveMonth: null },
  { id: 4, name: "Md. Samirul Islam", empId: "18509", designation: "Store In-Charge", joinMonth: 0, leaveMonth: null },
  { id: 5, name: "Mehedi Hasan Rasel", empId: "17924", designation: "Sr. Officer", joinMonth: 0, leaveMonth: null },
  { id: 6, name: "Tajin Kazi", empId: "20926", designation: "Officer", joinMonth: 0, leaveMonth: null },
  { id: 7, name: "Md. Shojib Sardar", empId: "23737", designation: "Packer", joinMonth: 0, leaveMonth: null },
  { id: 8, name: "Md. Rony Molla", empId: "23738", designation: "Packer", joinMonth: 0, leaveMonth: null },
  { id: 9, name: "Md. Sujan", empId: "24882", designation: "Packer", joinMonth: 0, leaveMonth: null },
  { id: 10, name: "Md. Robin Mia", empId: "26031", designation: "Packer", joinMonth: 0, leaveMonth: null },
  { id: 11, name: "Naim Islam Rafi", empId: "91198", designation: "Packer", joinMonth: 0, leaveMonth: null },
  { id: 12, name: "Shuvo Chandr Singha", empId: "91223", designation: "Packer", joinMonth: 0, leaveMonth: null },
];

const INITIAL_BILLS = {
  0: { 1:2620,2:8840,3:6840,4:7190,5:6250,6:7040,7:5925,8:5670,9:5375,10:6090,11:4950,12:4515 },
  1: { 1:3740,2:6020,3:5920,4:0,5:4170,6:5370,7:4355,8:4770,9:4770,10:4770,11:4920,12:4845 },
  2: { 1:2920,2:6190,3:6490,4:0,5:4540,6:5740,7:4415,8:4690,9:4415,10:4740,11:4515,12:4940 },
};

const STORAGE_KEY_EMP = "navana_employees";
const STORAGE_KEY_BILLS = "navana_bills";
const STORAGE_KEY_NEXT_ID = "navana_next_id";

function getInitialData() {
  try {
    const emp = localStorage.getItem(STORAGE_KEY_EMP);
    const bills = localStorage.getItem(STORAGE_KEY_BILLS);
    const nextId = localStorage.getItem(STORAGE_KEY_NEXT_ID);
    return {
      employees: emp ? JSON.parse(emp) : INITIAL_EMPLOYEES,
      bills: bills ? JSON.parse(bills) : INITIAL_BILLS,
      nextId: nextId ? parseInt(nextId) : 13,
    };
  } catch { return { employees: INITIAL_EMPLOYEES, bills: INITIAL_BILLS, nextId: 13 }; }
}

function saveData(employees, bills, nextId) {
  try {
    localStorage.setItem(STORAGE_KEY_EMP, JSON.stringify(employees));
    localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(bills));
    localStorage.setItem(STORAGE_KEY_NEXT_ID, String(nextId));
  } catch {}
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "summary", label: "Yearly Summary", icon: "≡" },
  { id: "entry", label: "Monthly Entry", icon: "✎" },
  { id: "employees", label: "Employees", icon: "❖" },
];

export default function App() {
  const init = getInitialData();
  const [employees, setEmployees] = useState(init.employees);
  const [bills, setBills] = useState(init.bills);
  const [nextId, setNextId] = useState(init.nextId);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  useEffect(() => { saveData(employees, bills, nextId); }, [employees, bills, nextId]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

  function getActiveEmployees(monthIdx) {
    return employees.filter(e => e.joinMonth <= monthIdx && (e.leaveMonth === null || e.leaveMonth > monthIdx));
  }

  function getMonthTotal(monthIdx) {
    const active = getActiveEmployees(monthIdx);
    const monthBills = bills[monthIdx] || {};
    return active.reduce((s, e) => s + (monthBills[e.id] || 0), 0);
  }

  function getEmpTotal(empId) {
    return MONTHS.reduce((s, _, i) => {
      const active = getActiveEmployees(i);
      if (!active.find(e => e.id === empId)) return s;
      return s + ((bills[i] || {})[empId] || 0);
    }, 0);
  }

  function getYearTotal() {
    return MONTHS.reduce((s, _, i) => s + getMonthTotal(i), 0);
  }

  function saveBillEntry(monthIdx, empId, value) {
    setBills(prev => ({
      ...prev,
      [monthIdx]: { ...(prev[monthIdx] || {}), [empId]: value }
    }));
  }

  function addEmployee(name, empId, designation, joinMonthIdx) {
    const id = nextId;
    const newEmp = { id, name, empId, designation, joinMonth: joinMonthIdx, leaveMonth: null };
    setEmployees(prev => [...prev, newEmp]);
    setNextId(n => n + 1);
    showToast(`${name} সফলভাবে যোগ করা হয়েছে`);
  }

  function editEmployee(id, name, empId, designation) {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, name, empId, designation } : e));
    showToast("তথ্য সফলভাবে আপডেট হয়েছে");
  }

  function deleteEmployee(id, leaveMonthIdx) {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, leaveMonth: leaveMonthIdx } : e));
    showToast("কর্মী সফলভাবে বাদ দেওয়া হয়েছে");
  }

  const monthChartData = MONTHS.map((m, i) => ({ month: m, total: getMonthTotal(i) }));
  const yearTotal = getYearTotal();
  const activeNow = getActiveEmployees(new Date().getMonth());
  const topEmp = employees.map(e => ({ ...e, total: getEmpTotal(e.id) })).sort((a,b) => b.total - a.total)[0];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--color-background-tertiary)", fontFamily:"'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 60, transition:"width 0.25s ease",
        background:"var(--color-background-primary)", borderRight:"0.5px solid var(--color-border-tertiary)",
        display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden"
      }}>
        <div style={{ padding:"1.25rem 1rem", borderBottom:"0.5px solid var(--color-border-tertiary)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#1a3a5c", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ color:"#e8c97a", fontSize:14, fontWeight:600 }}>N</span>
          </div>
          {sidebarOpen && <div>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--color-text-primary)", letterSpacing:"0.04em", lineHeight:1.2 }}>NAVANA</div>
            <div style={{ fontSize:10, color:"var(--color-text-secondary)", lineHeight:1.2 }}>Bill Manager</div>
          </div>}
          <button onClick={() => setSidebarOpen(o=>!o)} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"var(--color-text-secondary)", fontSize:16, flexShrink:0 }}>☰</button>
        </div>
        <nav style={{ padding:"0.75rem 0.5rem", flex:1 }}>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              width:"100%", padding:"10px 12px", border:"none", borderRadius:8, cursor:"pointer",
              background: page===n.id ? "#1a3a5c" : "none",
              color: page===n.id ? "#e8c97a" : "var(--color-text-secondary)",
              display:"flex", alignItems:"center", gap:10, fontSize:13, fontWeight: page===n.id ? 500 : 400,
              marginBottom:2, textAlign:"left", transition:"all 0.15s"
            }}>
              <span style={{ fontSize:15, flexShrink:0 }}>{n.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace:"nowrap" }}>{n.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && <div style={{ padding:"1rem", fontSize:11, color:"var(--color-text-tertiary)", borderTop:"0.5px solid var(--color-border-tertiary)" }}>
          Narayangonj Depot · 2026
        </div>}
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"auto" }}>
        {/* Header */}
        <div style={{ padding:"1rem 1.5rem", borderBottom:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-primary)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:500, color:"var(--color-text-primary)" }}>
              {NAV_ITEMS.find(n=>n.id===page)?.label}
            </div>
            <div style={{ fontSize:12, color:"var(--color-text-secondary)" }}>Navana Pharmaceuticals PLC · Narayangonj Depot · 2026</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {(page==="summary"||page==="entry") && (
              <button onClick={() => window.print()} style={{
                padding:"6px 14px", borderRadius:6, border:"0.5px solid var(--color-border-secondary)",
                background:"none", cursor:"pointer", fontSize:12, color:"var(--color-text-primary)", fontWeight:500
              }}>⎙ Print / PDF</button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, padding:"1.5rem", overflowY:"auto" }}>
          {page==="dashboard" && <Dashboard monthChartData={monthChartData} yearTotal={yearTotal} activeNow={activeNow} topEmp={topEmp} bills={bills} employees={employees} getMonthTotal={getMonthTotal} getActiveEmployees={getActiveEmployees} setPage={setPage} setSelectedMonth={setSelectedMonth} />}
          {page==="summary" && <YearlySummary employees={employees} bills={bills} getActiveEmployees={getActiveEmployees} getEmpTotal={getEmpTotal} getMonthTotal={getMonthTotal} />}
          {page==="entry" && <MonthlyEntry employees={employees} bills={bills} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} saveBillEntry={saveBillEntry} getActiveEmployees={getActiveEmployees} getMonthTotal={getMonthTotal} showToast={showToast} />}
          {page==="employees" && <EmployeeManager employees={employees} getEmpTotal={getEmpTotal} setModal={setModal} setSelectedEmpId={setSelectedEmpId} selectedEmpId={selectedEmpId} bills={bills} getActiveEmployees={getActiveEmployees} />}
        </div>
      </div>

      {/* Modals */}
      {modal==="add" && <AddEmployeeModal onClose={()=>setModal(null)} onAdd={addEmployee} />}
      {modal==="edit" && <EditEmployeeModal emp={employees.find(e=>e.id===selectedEmpId)} onClose={()=>setModal(null)} onEdit={editEmployee} />}
      {modal==="delete" && <DeleteEmployeeModal emp={employees.find(e=>e.id===selectedEmpId)} onClose={()=>setModal(null)} onDelete={deleteEmployee} />}

      {/* Toast */}
      {toast && <div style={{
        position:"fixed", bottom:24, right:24, background: toast.type==="success" ? "#1a3a5c" : "#c0392b",
        color:"white", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:500,
        boxShadow:"0 4px 20px rgba(0,0,0,0.15)", zIndex:9999, animation:"fadeIn 0.2s ease"
      }}>{toast.msg}</div>}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        input:focus, select:focus { outline: 2px solid #1a3a5c; outline-offset: 1px; }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"1rem 1.25rem", borderTop: `3px solid ${accent||"#1a3a5c"}` }}>
      <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:600, color:"var(--color-text-primary)", lineHeight:1.2 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function Dashboard({ monthChartData, yearTotal, activeNow, topEmp, bills, employees, getMonthTotal, getActiveEmployees, setPage, setSelectedMonth }) {
  const currentMonthIdx = new Date().getMonth();
  const currentTotal = getMonthTotal(Math.min(currentMonthIdx, 11));
  const filledMonths = MONTHS.filter((_, i) => getMonthTotal(i) > 0).length;

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:12, marginBottom:24 }}>
        <StatCard label="বার্ষিক মোট বিল" value={`৳ ${yearTotal.toLocaleString()}`} sub={`${filledMonths} মাসের ডেটা`} accent="#1a3a5c" />
        <StatCard label="চলতি মাস (এপ্রিল)" value={`৳ ${getMonthTotal(3).toLocaleString()}`} sub="April 2026" accent="#e8c97a" />
        <StatCard label="মোট সক্রিয় কর্মী" value={activeNow.length} sub="বর্তমানে কর্মরত" accent="#2ecc71" />
        <StatCard label="সর্বোচ্চ বিল প্রাপক" value={topEmp?.name?.split(" ")[0] || "—"} sub={topEmp ? `৳ ${topEmp.total.toLocaleString()}` : ""} accent="#e74c3c" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:24 }}>
        <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"1.25rem" }}>
          <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", marginBottom:16 }}>মাসওয়ারি বিল তুলনা (২০২৬)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthChartData} margin={{ top:0, right:8, left:0, bottom:0 }}>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:"var(--color-text-secondary)" }} axisLine={false} tickLine={false} tickFormatter={v => v>0?`${(v/1000).toFixed(0)}k`:""} />
              <Tooltip formatter={v => [`৳ ${v.toLocaleString()}`, "মোট বিল"]} contentStyle={{ fontSize:12, borderRadius:8 }} />
              <Bar dataKey="total" fill="#1a3a5c" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"1.25rem" }}>
          <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", marginBottom:12 }}>মাসিক সারসংক্ষেপ</div>
          {MONTHS.map((m, i) => {
            const t = getMonthTotal(i);
            const max = Math.max(...MONTHS.map((_,j)=>getMonthTotal(j)),1);
            return (
              <div key={m} onClick={() => { setSelectedMonth(i); setPage("entry"); }} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, cursor:"pointer", padding:"3px 6px", borderRadius:6, transition:"background 0.1s" }}
                onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{ width:28, fontSize:11, color:"var(--color-text-secondary)", flexShrink:0 }}>{m}</div>
                <div style={{ flex:1, height:6, background:"var(--color-background-secondary)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ width:`${(t/max)*100}%`, height:"100%", background: t>0?"#1a3a5c":"transparent", borderRadius:3, transition:"width 0.3s" }} />
                </div>
                <div style={{ width:60, fontSize:11, color: t>0?"var(--color-text-primary)":"var(--color-text-tertiary)", textAlign:"right" }}>
                  {t > 0 ? `৳${(t/1000).toFixed(1)}k` : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"1.25rem" }}>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", marginBottom:12 }}>শীর্ষ কর্মীরা (বার্ষিক বিল অনুযায়ী)</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:10 }}>
          {employees.map(e => ({ ...e, total: MONTHS.reduce((s,_,i) => {
            const active = getActiveEmployees(i);
            if (!active.find(a=>a.id===e.id)) return s;
            return s + ((bills[i]||{})[e.id]||0);
          },0)})).sort((a,b)=>b.total-a.total).slice(0,6).map((e,idx) => (
            <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background: idx===0?"#e8c97a":idx===1?"#c0c0c0":idx===2?"#cd7f32":"var(--color-background-secondary)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color: idx<3?"#1a3a5c":"var(--color-text-secondary)", flexShrink:0 }}>
                {idx+1}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:500, color:"var(--color-text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</div>
                <div style={{ fontSize:11, color:"var(--color-text-secondary)" }}>৳ {e.total.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function YearlySummary({ employees, bills, getActiveEmployees, getEmpTotal, getMonthTotal }) {
  const empWithTotals = employees.map(e => ({
    ...e,
    monthAmounts: MONTHS.map((_, i) => {
      const active = getActiveEmployees(i);
      if (!active.find(a => a.id === e.id)) return null;
      return (bills[i] || {})[e.id] || 0;
    }),
    total: getEmpTotal(e.id)
  })).sort((a, b) => b.total - a.total);

  const ranked = empWithTotals.map((e, i) => ({ ...e, rank: e.total > 0 ? i + 1 : "—" }));

  return (
    <div>
      <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"1rem 1.25rem", borderBottom:"0.5px solid var(--color-border-tertiary)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--color-text-primary)" }}>Navana Pharmaceuticals PLC</div>
            <div style={{ fontSize:12, color:"var(--color-text-secondary)" }}>Yearly Bill Summary 2026 · Narayangonj Depot</div>
          </div>
          <div style={{ fontSize:13, fontWeight:500, color:"#1a3a5c" }}>Year: 2026</div>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"#1a3a5c" }}>
                <th style={{ padding:"10px 12px", color:"#e8c97a", fontWeight:500, textAlign:"center", whiteSpace:"nowrap" }}>SL</th>
                <th style={{ padding:"10px 12px", color:"#e8c97a", fontWeight:500, textAlign:"left", whiteSpace:"nowrap" }}>নাম</th>
                <th style={{ padding:"10px 12px", color:"#e8c97a", fontWeight:500, textAlign:"center", whiteSpace:"nowrap" }}>ID</th>
                <th style={{ padding:"10px 12px", color:"#e8c97a", fontWeight:500, textAlign:"left", whiteSpace:"nowrap" }}>পদবী</th>
                {MONTHS.map(m => <th key={m} style={{ padding:"10px 8px", color:"#e8c97a", fontWeight:500, textAlign:"right", whiteSpace:"nowrap" }}>{m}</th>)}
                <th style={{ padding:"10px 12px", color:"#e8c97a", fontWeight:500, textAlign:"right", whiteSpace:"nowrap" }}>মোট</th>
                <th style={{ padding:"10px 12px", color:"#e8c97a", fontWeight:500, textAlign:"center", whiteSpace:"nowrap" }}>Rank</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((e, idx) => (
                <tr key={e.id} style={{ background: idx%2===0?"var(--color-background-primary)":"var(--color-background-secondary)", borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
                  <td style={{ padding:"9px 12px", textAlign:"center", color:"var(--color-text-secondary)" }}>{idx+1}</td>
                  <td style={{ padding:"9px 12px", fontWeight:500, color:"var(--color-text-primary)", whiteSpace:"nowrap" }}>{e.name}</td>
                  <td style={{ padding:"9px 12px", textAlign:"center", color:"var(--color-text-secondary)", fontFamily:"monospace" }}>{e.empId}</td>
                  <td style={{ padding:"9px 12px", color:"var(--color-text-secondary)", whiteSpace:"nowrap" }}>{e.designation}</td>
                  {e.monthAmounts.map((amt, i) => (
                    <td key={i} style={{ padding:"9px 8px", textAlign:"right", color: amt===null?"var(--color-text-tertiary)":amt>0?"var(--color-text-primary)":"var(--color-text-tertiary)" }}>
                      {amt === null ? "—" : amt > 0 ? amt.toLocaleString() : "0"}
                    </td>
                  ))}
                  <td style={{ padding:"9px 12px", textAlign:"right", fontWeight:600, color:"#1a3a5c" }}>{e.total > 0 ? e.total.toLocaleString() : "0"}</td>
                  <td style={{ padding:"9px 12px", textAlign:"center" }}>
                    <span style={{ background: e.rank===1?"#e8c97a":e.rank===2?"#e0e0e0":e.rank===3?"#f0c070":"var(--color-background-secondary)", color:"#1a3a5c", padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600 }}>
                      {e.rank}
                    </span>
                  </td>
                </tr>
              ))}
              <tr style={{ background:"#1a3a5c", fontWeight:600 }}>
                <td colSpan={4} style={{ padding:"10px 12px", color:"#e8c97a" }}>মাসিক মোট</td>
                {MONTHS.map((_, i) => (
                  <td key={i} style={{ padding:"10px 8px", textAlign:"right", color:"#e8c97a" }}>{getMonthTotal(i).toLocaleString()}</td>
                ))}
                <td style={{ padding:"10px 12px", textAlign:"right", color:"#e8c97a" }}>{ranked.reduce((s,e)=>s+e.total,0).toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MonthlyEntry({ employees, bills, selectedMonth, setSelectedMonth, saveBillEntry, getActiveEmployees, getMonthTotal, showToast }) {
  const activeEmps = getActiveEmployees(selectedMonth);
  const monthBills = bills[selectedMonth] || {};
  const [entries, setEntries] = useState({});

  useEffect(() => {
    const init = {};
    activeEmps.forEach(e => { init[e.id] = monthBills[e.id] !== undefined ? String(monthBills[e.id]) : ""; });
    setEntries(init);
  }, [selectedMonth, bills]);

  const liveTotal = activeEmps.reduce((s, e) => s + (parseInt(entries[e.id]) || 0), 0);

  function handleSave() {
    activeEmps.forEach(e => saveBillEntry(selectedMonth, e.id, parseInt(entries[e.id]) || 0));
    showToast(`${MONTH_LABELS[selectedMonth]} মাসের বিল সংরক্ষিত হয়েছে`);
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <select value={selectedMonth} onChange={e=>setSelectedMonth(parseInt(e.target.value))} style={{ padding:"8px 12px", borderRadius:8, border:"0.5px solid var(--color-border-secondary)", background:"var(--color-background-primary)", color:"var(--color-text-primary)", fontSize:13, cursor:"pointer" }}>
          {MONTHS.map((m, i) => <option key={m} value={i}>{MONTH_LABELS[i]} 2026</option>)}
        </select>
        <div style={{ fontSize:13, color:"var(--color-text-secondary)" }}>{activeEmps.length} জন কর্মী সক্রিয়</div>
      </div>

      <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"1rem 1.25rem", borderBottom:"0.5px solid var(--color-border-tertiary)", background:"#1a3a5c", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:"#e8c97a", fontWeight:500, fontSize:13 }}>{MONTH_LABELS[selectedMonth]} 2026 · বিল এন্ট্রি</div>
          <div style={{ color:"#e8c97a", fontSize:13 }}>মোট: ৳ {liveTotal.toLocaleString()}</div>
        </div>

        {activeEmps.length === 0 ? (
          <div style={{ padding:"2rem", textAlign:"center", color:"var(--color-text-secondary)", fontSize:13 }}>এই মাসে কোনো সক্রিয় কর্মী নেই</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"var(--color-background-secondary)" }}>
                <th style={{ padding:"10px 16px", fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", textAlign:"left" }}>SL</th>
                <th style={{ padding:"10px 16px", fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", textAlign:"left" }}>নাম</th>
                <th style={{ padding:"10px 16px", fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", textAlign:"left" }}>ID</th>
                <th style={{ padding:"10px 16px", fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", textAlign:"left" }}>পদবী</th>
                <th style={{ padding:"10px 16px", fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", textAlign:"right" }}>টাকা (৳)</th>
              </tr>
            </thead>
            <tbody>
              {activeEmps.map((e, idx) => (
                <tr key={e.id} style={{ borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
                  <td style={{ padding:"10px 16px", fontSize:12, color:"var(--color-text-secondary)" }}>{idx+1}</td>
                  <td style={{ padding:"10px 16px", fontSize:13, fontWeight:500, color:"var(--color-text-primary)" }}>{e.name}</td>
                  <td style={{ padding:"10px 16px", fontSize:12, color:"var(--color-text-secondary)", fontFamily:"monospace" }}>{e.empId}</td>
                  <td style={{ padding:"10px 16px", fontSize:12, color:"var(--color-text-secondary)" }}>{e.designation}</td>
                  <td style={{ padding:"8px 16px", textAlign:"right" }}>
                    <input
                      type="number" min="0"
                      value={entries[e.id] || ""}
                      onChange={ev => setEntries(prev => ({ ...prev, [e.id]: ev.target.value }))}
                      placeholder="0"
                      style={{ width:100, padding:"6px 10px", borderRadius:6, border:"0.5px solid var(--color-border-secondary)", background:"var(--color-background-primary)", color:"var(--color-text-primary)", fontSize:13, textAlign:"right" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background:"var(--color-background-secondary)" }}>
                <td colSpan={4} style={{ padding:"10px 16px", fontSize:13, fontWeight:600, color:"var(--color-text-primary)" }}>মোট</td>
                <td style={{ padding:"10px 16px", textAlign:"right", fontSize:14, fontWeight:600, color:"#1a3a5c" }}>৳ {liveTotal.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        )}

        <div style={{ padding:"1rem 1.25rem", borderTop:"0.5px solid var(--color-border-tertiary)", display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button onClick={handleSave} style={{
            padding:"8px 20px", borderRadius:8, border:"none", background:"#1a3a5c", color:"#e8c97a",
            fontSize:13, fontWeight:500, cursor:"pointer"
          }}>✓ সংরক্ষণ করুন</button>
        </div>
      </div>
    </div>
  );
}

function EmployeeManager({ employees, getEmpTotal, setModal, setSelectedEmpId, selectedEmpId, bills, getActiveEmployees }) {
  const [detailEmp, setDetailEmp] = useState(null);

  const empData = employees.map(e => ({
    ...e,
    total: getEmpTotal(e.id),
    isActive: e.leaveMonth === null,
  }));

  if (detailEmp) {
    const emp = employees.find(e => e.id === detailEmp);
    const chartData = MONTHS.map((m, i) => {
      const active = getActiveEmployees(i);
      const isActive = active.find(a => a.id === emp.id);
      return { month: m, amount: isActive ? ((bills[i] || {})[emp.id] || 0) : null };
    });
    return (
      <div>
        <button onClick={() => setDetailEmp(null)} style={{ marginBottom:16, padding:"6px 14px", borderRadius:6, border:"0.5px solid var(--color-border-secondary)", background:"none", cursor:"pointer", fontSize:12, color:"var(--color-text-secondary)" }}>← ফিরে যান</button>
        <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"1.5rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"#1a3a5c", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#e8c97a", fontWeight:600 }}>
              {emp.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--color-text-primary)" }}>{emp.name}</div>
              <div style={{ fontSize:12, color:"var(--color-text-secondary)" }}>{emp.designation} · ID: {emp.empId}</div>
            </div>
            <div style={{ marginLeft:"auto", textAlign:"right" }}>
              <div style={{ fontSize:11, color:"var(--color-text-secondary)" }}>বার্ষিক মোট</div>
              <div style={{ fontSize:20, fontWeight:600, color:"#1a3a5c" }}>৳ {getEmpTotal(emp.id).toLocaleString()}</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} tickFormatter={v => v>0?`${(v/1000).toFixed(1)}k`:""} />
              <Tooltip formatter={v => v!==null?[`৳ ${(v||0).toLocaleString()}`, "বিল"]:[["—","বিল"]]} />
              <Line type="monotone" dataKey="amount" stroke="#1a3a5c" strokeWidth={2} dot={{ r:4, fill:"#e8c97a", stroke:"#1a3a5c" }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button onClick={() => setModal("add")} style={{
          padding:"8px 18px", borderRadius:8, border:"none", background:"#1a3a5c", color:"#e8c97a",
          fontSize:13, fontWeight:500, cursor:"pointer"
        }}>+ নতুন কর্মী যোগ</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
        {empData.map((e, idx) => (
          <div key={e.id} onClick={() => setDetailEmp(e.id)} style={{
            background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12,
            padding:"1rem 1.25rem", cursor:"pointer", transition:"border-color 0.15s",
            opacity: e.isActive ? 1 : 0.6
          }}
          onMouseEnter={ev => ev.currentTarget.style.borderColor="var(--color-border-primary)"}
          onMouseLeave={ev => ev.currentTarget.style.borderColor="var(--color-border-tertiary)"}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background: e.isActive?"#1a3a5c":"var(--color-background-secondary)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color: e.isActive?"#e8c97a":"var(--color-text-secondary)", fontWeight:600, flexShrink:0 }}>
                {e.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</div>
                <div style={{ fontSize:11, color:"var(--color-text-secondary)" }}>{e.designation}</div>
              </div>
              {!e.isActive && <span style={{ fontSize:10, background:"#fde8e8", color:"#c0392b", padding:"2px 8px", borderRadius:20 }}>বাদ দেওয়া</span>}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:10, color:"var(--color-text-tertiary)" }}>ID: {e.empId}</div>
                <div style={{ fontSize:12, fontWeight:600, color:"#1a3a5c", marginTop:2 }}>৳ {e.total.toLocaleString()}</div>
              </div>
              <div style={{ display:"flex", gap:6 }} onClick={ev => ev.stopPropagation()}>
                <button onClick={() => { setSelectedEmpId(e.id); setModal("edit"); }} style={{ padding:"4px 10px", borderRadius:6, border:"0.5px solid var(--color-border-secondary)", background:"none", cursor:"pointer", fontSize:11, color:"var(--color-text-secondary)" }}>✎</button>
                {e.isActive && <button onClick={() => { setSelectedEmpId(e.id); setModal("delete"); }} style={{ padding:"4px 10px", borderRadius:6, border:"0.5px solid #f5c6c6", background:"none", cursor:"pointer", fontSize:11, color:"#c0392b" }}>✕</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModalWrap({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:"var(--color-background-primary)", borderRadius:14, width:"100%", maxWidth:440, border:"0.5px solid var(--color-border-secondary)" }}>
        <div style={{ padding:"1rem 1.25rem", borderBottom:"0.5px solid var(--color-border-tertiary)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:14, fontWeight:500, color:"var(--color-text-primary)" }}>{title}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--color-text-secondary)", lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:"1.25rem" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}

function InputStyle({ ...props }) {
  return <input {...props} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"0.5px solid var(--color-border-secondary)", background:"var(--color-background-primary)", color:"var(--color-text-primary)", fontSize:13 }} />;
}

function AddEmployeeModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [desig, setDesig] = useState("");
  const [joinMonth, setJoinMonth] = useState(new Date().getMonth());

  function handle() {
    if (!name.trim()) return;
    onAdd(name.trim(), empId.trim(), desig.trim(), joinMonth);
    onClose();
  }

  return (
    <ModalWrap title="নতুন কর্মী যোগ করুন" onClose={onClose}>
      <Field label="নাম *"><InputStyle value={name} onChange={e=>setName(e.target.value)} placeholder="কর্মীর পূর্ণ নাম" /></Field>
      <Field label="ID নম্বর"><InputStyle value={empId} onChange={e=>setEmpId(e.target.value)} placeholder="Employee ID" /></Field>
      <Field label="পদবী"><InputStyle value={desig} onChange={e=>setDesig(e.target.value)} placeholder="Designation" /></Field>
      <Field label="যোগদানের মাস">
        <select value={joinMonth} onChange={e=>setJoinMonth(parseInt(e.target.value))} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"0.5px solid var(--color-border-secondary)", background:"var(--color-background-primary)", color:"var(--color-text-primary)", fontSize:13 }}>
          {MONTHS.map((m,i) => <option key={m} value={i}>{MONTH_LABELS[i]} 2026 থেকে</option>)}
        </select>
      </Field>
      <button onClick={handle} disabled={!name.trim()} style={{ width:"100%", padding:"10px", borderRadius:8, border:"none", background: name.trim()?"#1a3a5c":"var(--color-background-secondary)", color: name.trim()?"#e8c97a":"var(--color-text-tertiary)", fontSize:13, fontWeight:500, cursor: name.trim()?"pointer":"not-allowed", marginTop:4 }}>
        + যোগ করুন
      </button>
    </ModalWrap>
  );
}

function EditEmployeeModal({ emp, onClose, onEdit }) {
  const [name, setName] = useState(emp?.name || "");
  const [empId, setEmpId] = useState(emp?.empId || "");
  const [desig, setDesig] = useState(emp?.designation || "");

  function handle() {
    if (!name.trim()) return;
    onEdit(emp.id, name.trim(), empId.trim(), desig.trim());
    onClose();
  }

  return (
    <ModalWrap title="কর্মীর তথ্য সম্পাদনা" onClose={onClose}>
      <Field label="নাম *"><InputStyle value={name} onChange={e=>setName(e.target.value)} /></Field>
      <Field label="ID নম্বর"><InputStyle value={empId} onChange={e=>setEmpId(e.target.value)} /></Field>
      <Field label="পদবী"><InputStyle value={desig} onChange={e=>setDesig(e.target.value)} /></Field>
      <button onClick={handle} style={{ width:"100%", padding:"10px", borderRadius:8, border:"none", background:"#1a3a5c", color:"#e8c97a", fontSize:13, fontWeight:500, cursor:"pointer", marginTop:4 }}>
        ✓ আপডেট করুন
      </button>
    </ModalWrap>
  );
}

function DeleteEmployeeModal({ emp, onClose, onDelete }) {
  const [leaveMonth, setLeaveMonth] = useState(new Date().getMonth());

  function handle() {
    onDelete(emp.id, leaveMonth);
    onClose();
  }

  return (
    <ModalWrap title="কর্মী বাদ দিন" onClose={onClose}>
      <div style={{ padding:"10px 14px", background:"#fde8e8", borderRadius:8, fontSize:13, color:"#c0392b", marginBottom:16 }}>
        <strong>{emp?.name}</strong> কে বাদ দেওয়া হবে। পূর্বের সকল ডেটা সংরক্ষিত থাকবে।
      </div>
      <Field label="কোন মাস থেকে বাদ দেবেন?">
        <select value={leaveMonth} onChange={e=>setLeaveMonth(parseInt(e.target.value))} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"0.5px solid var(--color-border-secondary)", background:"var(--color-background-primary)", color:"var(--color-text-primary)", fontSize:13 }}>
          {MONTHS.map((m,i) => <option key={m} value={i}>{MONTH_LABELS[i]} 2026 থেকে</option>)}
        </select>
      </Field>
      <button onClick={handle} style={{ width:"100%", padding:"10px", borderRadius:8, border:"none", background:"#c0392b", color:"white", fontSize:13, fontWeight:500, cursor:"pointer" }}>
        বাদ দিন
      </button>
    </ModalWrap>
  );
}
