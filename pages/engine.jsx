import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import 'tailwindcss/tailwind.css';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [pillars, setPillars] = useState([]);
  const [pillarScores, setPillarScores] = useState([]);
  const [pillarFiles, setPillarFiles] = useState([]);
  const [tenant, setTenant] = useState('6b3755d5-015b-4669-91fd-a934161172c0');
  const [decision, setDecision] = useState('');

  const fetchPillars = async () => {
    const { data, error } = await supabase.from('pillars').select('*').order('id');
    if (error) console.error('Error:', error);
    else {
      setPillars(data);
      setPillarScores(new Array(data.length).fill(0));
      setPillarFiles(new Array(data.length).fill(null));
    }
  };

  useEffect(() => { fetchPillars(); }, []);

  const calculateAverage = () => {
    if (!pillarScores.length) return 0;
    return Math.round(pillarScores.reduce((acc, s) => acc + s, 0) / pillarScores.length);
  };

  const liveDecision = (avg) => {
    if (avg >= 85) return 'APPROVE';
    if (avg >= 70) return 'REVIEW';
    if (avg >= 50) return 'ESCALATE';
    return 'FAIL';
  };

  const avg = calculateAverage();
  const currentDecision = liveDecision(avg);

  const handleSubmit = async () => {
    // Format scores as JSON for the dashboard
    const scoresObj = {};
    pillars.forEach((p, i) => { scoresObj[p.id] = pillarScores[i]; });

    const { data, error } = await supabase.from('cases').insert([{
      tenant_id: tenant,
      entity_name: 'Sample Client',
      pillar_scores: scoresObj,
      final_score: avg,
      status: currentDecision,
      evidence_chain: pillars.map((p, i) => ({ id: p.id, url: pillarFiles[i], time: new Date() }))
    }]);

    if (error) alert("Error: " + error.message);
    else {
      alert("Success! Case sent to MC™ Dashboard");
      setDecision(currentDecision);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-10 font-sans text-[#0B1F3F]">
      <h1 className="font-black text-3xl mb-8">MC™ Compliance Blueprint</h1>
      
      <div className="mb-6 p-4 bg-white border rounded shadow-sm">
        <p className="font-bold">Active Tenant ID:</p>
        <code className="text-xs text-blue-600">{tenant}</code>
      </div>

      <div className="mb-6">
        <div className="flex justify-between font-bold mb-2">
          <span>Score: {avg}%</span>
          <span>Decision: {currentDecision}</span>
        </div>
        <div className="w-full bg-gray-200 h-4 rounded">
          <div className="bg-yellow-500 h-4 rounded" style={{ width: `${avg}%` }} />
        </div>
      </div>

      {pillars.map((p, i) => (
        <div key={p.id} className="border-l-4 border-[#F5C518] p-6 mb-4 bg-white shadow-sm">
          <h3 className="font-black text-lg">{p.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{p.how}</p>
          <input 
            type="number" 
            className="border p-2 w-24" 
            value={pillarScores[i]} 
            onChange={(e) => {
              const newS = [...pillarScores];
              newS[i] = Number(e.target.value);
              setPillarScores(newS);
            }}
          />
        </div>
      ))}

      <button onClick={handleSubmit} className="bg-[#0B1F3F] text-white font-bold px-8 py-4 rounded">
        Submit to Dashboard
      </button>
    </div>
  );
}
