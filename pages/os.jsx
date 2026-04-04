// pages/index.jsx
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import 'tailwindcss/tailwind.css';

// ====== Supabase Setup ======
const supabaseUrl = 'https://YOUR_SUPABASE_PROJECT.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// ====== Blueprint: 8 Pillars ======
const PILLARS = [
  { id: 1, name: 'Risk Taxonomy', how: 'Define “High Risk” for this fintech.', why: 'Ensures targeted monitoring and audit-readiness.', outcome: 'Analyst can flag cases accurately.', guidance: 'Ask: What makes this client high-risk? Consider geography, industry, and transaction volume.' },
  { id: 2, name: 'Customer Identity Profile (CIP)', how: 'Collect IDs and corporate documents.', why: 'Baseline verification required by regulators.', outcome: 'Verified client identity stored.', guidance: 'Check all documents for authenticity; cross-verify with official registries.' },
  { id: 3, name: 'Enhanced Due Diligence (EDD)', how: 'Deep-dive into Source of Wealth (SoW) for high-value clients.', why: 'High-risk cases require additional validation.', outcome: 'Analyst reports validated SoW.', guidance: 'Document all sources of income, assets, and recent transactions.' },
  { id: 4, name: 'Screening & Triage', how: 'Check Sanctions, PEP, and Adverse Media in real-time.', why: 'Automated detection reduces regulatory risk.', outcome: 'High-risk clients flagged automatically.', guidance: 'Use multiple sources for screening; flag any hits for escalation.' },
  { id: 5, name: 'The Evidence Chain', how: 'Generate PDF + timestamp for each step.', why: 'Golden thread ensures audit compliance.', outcome: 'Traceable records for regulator review.', guidance: 'Ensure all actions are time-stamped and saved; do not skip steps.' },
  { id: 6, name: 'Adjudication Logic', how: 'Apply binary rules: Approve / Reject.', why: 'Consistency in decision-making.', outcome: 'Analyst guided to a clear decision.', guidance: 'Use scores and risk flags to make unbiased decisions.' },
  { id: 7, name: 'Quality Assurance (QA)', how: 'Architect reviews Analyst work.', why: 'Maintain quality and compliance.', outcome: 'Errors caught before final submission.', guidance: 'Check completeness, logic, and documentation.' },
  { id: 8, name: 'Board Reporting', how: 'Summarize outcomes for CEO & regulators.', why: 'High-level insight drives accountability.', outcome: 'Management sees real-time compliance status.', guidance: 'Highlight key risks and remediation plans.' }
];

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
export default function Home() {
  const [pillarScores, setPillarScores] = useState(PILLARS.map(() => 0));
  const [decision, setDecision] = useState('');
  const [tenant, setTenant] = useState('default');

  const handleScoreChange = (index, value) => {
    const newScores = [...pillarScores];
    newScores[index] = value;
    setPillarScores(newScores);
  };

  const handleSubmit = async () => {
    const finalDecision = calculateScore(pillarScores.map((s, i) => ({ score: s })));
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
    console.log(data, error);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-10 font-sans">
      
      {/* ===== HEADER WITH LOGO ===== */}
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-white p-2 rounded shadow-xl flex items-center justify-center">
          {/* MC Monogram SVG from your brand identity */}
          <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none">
            <rect x="12" y="30" width="16" height="40" fill="#0B1F3F"/>
            <path d="M12 30H50V40H32V70H12V30Z" fill="#0B1F3F"/>
            <rect x="34" y="30" width="16" height="40" fill="#0B1F3F"/>
            <path d="M56 42H88V50H72V58H88V66H56V42Z" fill="#0B1F3F"/>
            <rect x="56" y="42" width="12" height="24" fill="#0B1F3F"/>
          </svg>
        </div>
        <h1 className="ml-4 font-montserrat font-black text-3xl text-[#0B1F3F]">MC™ Compliance Blueprint</h1>
      </div>

      {/* Tenant Selector */}
      <div className="mb-6">
        <label className="mr-2 font-bold text-[#0B1F3F]">Tenant:</label>
        <select value={tenant} onChange={(e) => setTenant(e.target.value)} className="border rounded p-1">
          <option value="default">Default</option>
          <option value="tenant_a">Tenant A</option>
          <option value="tenant_b">Tenant B</option>
        </select>
      </div>

      {/* Pillars */}
      {PILLARS.map((pillar, i) => (
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
