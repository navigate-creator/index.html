// pages/dashboard.jsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import 'tailwindcss/tailwind.css';

// ====== Supabase Setup ======
const supabaseUrl = 'https://YOUR_SUPABASE_PROJECT.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// ====== Main Component ======
export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [tenant, setTenant] = useState('default');
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('tenant_id', tenant)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching cases:', error);
    else setCases(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, [tenant]);

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-10 font-sans">
      {/* HEADER */}
      <header className="flex items-center gap-6 mb-8">
        <h1 className="font-montserrat font-black text-3xl text-[#0B1F3F]">
          MC™ Compliance Dashboard
        </h1>
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

      {loading && <p className="text-[#0B1F3F] font-bold">Loading cases...</p>}

      {!loading && cases.length === 0 && <p className="text-[#0B1F3F] font-bold">No cases found for this tenant.</p>}

      {!loading && cases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded shadow-md border-l-4 border-[#F5C518]">
              <h3 className="font-bold text-lg text-[#0B1F3F]">{c.entity_name}</h3>
              <p className="text-slate-600 text-sm mb-2">Submitted: {new Date(c.created_at).toLocaleString()}</p>
              <div className="text-sm mb-2">
                {c.pillar_scores.map((score, i) => (
                  <p key={i}>Pillar {i + 1}: {score}</p>
                ))}
              </div>
              <p className="font-bold text-[#0B1F3F]">Final Score: {c.final_score}</p>
              <p className={`font-bold mt-1 ${
                c.status === 'APPROVE' ? 'text-green-600' :
                c.status === 'REVIEW' ? 'text-yellow-600' :
                c.status === 'ESCALATE' ? 'text-orange-600' :
                'text-red-600'
              }`}>Decision: {c.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
