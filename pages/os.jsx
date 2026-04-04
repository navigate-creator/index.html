// pages/os.jsx
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import 'tailwindcss/tailwind.css';

// ====== Supabase Setup ======
const supabaseUrl = 'https://YOUR_SUPABASE_PROJECT.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// ====== Scoring Engine ======
const calculateScore = (pillarScores) => {
  const total = pillarScores.reduce((acc, s) => acc + s.score, 0);
  const average = total / pillarScores.length;
  if (average >= 85) return 'APPROVE';
  if (average >= 70) return 'REVIEW';
  if (average >= 50) return 'ESCALATE';
  return 'FAIL';
};

// ====== Pillar Card Component ======
const PillarCard = ({ pillar, score, setScore }) => {
  const [showGuidance, setShowGuidance] = useState(false);
  return (
    <div className="border-l-4 border-[#F5C518] p-6 mb-4 bg-white rounded shadow-sm">
      <h3 className="font-montserrat font-black text-lg">{pillar.name}</h3>
      <p><b>HOW:</b> {pillar.how}</p>
      <p><b>WHY:</b> {pillar.why}</p>
      <p><b>OUTCOME:</b> {pillar.outcome}</p>
      <button
        onClick={() => setShowGuidance(!showGuidance)}
        className="mt-2 text-xs font-bold text-[#0B1F3F] underline"
      >
        {showGuidance ? 'Hide Guidance' : 'Show Guidance'}
      </button>
      {showGuidance && (
        <p className="text-slate-500 mt-1 text-xs">{pillar.guidance}</p>
      )}
      <input
        type="number"
        min="0" max="100"
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="mt-2 border border-slate-300 p-2 rounded w-24"
        placeholder="Score 0-100"
      />
    </div>
  )
};

// ====== Main Component ======
export default function OS() {
  const [pillars, setPillars] = useState([]);
  const [pillarScores, setPillarScores] = useState([]);
  const [decision, setDecision] = useState('');
  const [tenant, setTenant] = useState('default');
  const [loading, setLoading] = useState(true);

  // Fetch pillars from Supabase for the selected tenant
  const fetchPillars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pillars')
      .select('*')
      .order('id', { ascending: true });
    if (error) console.error('Error fetching pillars:', error);
    else {
      setPillars(data);
      setPillarScores(data.map(() => 0));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPillars();
  }, [tenant]);

  const handleScoreChange = (index, value) => {
    const newScores = [...pillarScores];
    newScores[index] = value;
    setPillarScores(newScores);
  };

  const handleSubmit = async () => {
    const finalDecision = calculateScore(pillarScores.map((s) => ({ score: s })));
    setDecision(finalDecision);

    const { data, error } = await supabase.from('cases').insert([
      {
        tenant_id: tenant,
        entity_name: 'Sample Client',
        pillar_scores: pillarScores,
        final_score: pillarScores.reduce((a, b) => a + b, 0) / pillarScores.length,
        status: finalDecision
      }
    ]);
    if (error) console.error('Supabase Insert Error:', error);
    else console.log('Case Saved:', data);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-10 font-sans">
      {/* HEADER WITH LOGO */}
      <header className="flex items-center gap-6 mb-8">
        <div className="bg-white p-2 rounded shadow-xl">
          {/* SVG Logo from Brand Identity */}
          <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none">
            <rect x="12" y="30" width="16" height="40" fill="#0B1F3F"/>
            <path d="M12 30H50V40H32V70H12V30Z" fill="#0B1F3F"/>
            <rect x="34" y="30" width="16" height="40" fill="#0B1F3F"/>
            <path d="M56 42H88V50H72V58H88V66H56V42Z" fill="#0B1F3F"/>
            <rect x="56" y="42" width="12" height="24" fill="#0B1F3F"/>
          </svg>
        </div>
        <div>
          <h1 className="font-montserrat font-black text-3xl text-[#0B1F3F]">MC™ Compliance Blueprint</h1>
          <p className="text-[#F5C518] font-bold text-xs uppercase tracking-[0.4em] mt-1">Brand Identity Integrated</p>
        </div>
      </header>

      {/* Tenant Selector */}
      <div className="mb-6">
        <label className="mr-2 font-bold text-[#0B1F3F]">Tenant:</label>
        <select value={tenant} onChange={(e) => setTenant(e.target.value)} className="border rounded p-1">
          <option value="default">Default</option>
          <option value="tenant_a">Tenant A</option>
          <option value="tenant_b">Tenant B</option>
        </select>
      </div>

      {/* Loading Pillars */}
      {loading && <p className="text-[#0B1F3F] font-bold">Loading pillars...</p>}

      {/* Pillars */}
      {!loading && pillars.map((pillar, i) => (
        <PillarCard
          key={pillar.id}
          pillar={pillar}
          score={pillarScores[i]}
          setScore={(val) => handleScoreChange(i, val)}
        />
      ))}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="mt-6 bg-[#0B1F3F] text-white font-bold px-6 py-3 rounded hover:bg-[#081832]"
      >
        Submit & Calculate
      </button>

      {/* Decision Display */}
      {decision && (
        <div className="mt-6 p-6 bg-white border-l-4 border-[#F5C518] rounded shadow-sm text-xl font-bold text-[#0B1F3F]">
          Decision: {decision}
        </div>
      )}
    </div>
  );
}
