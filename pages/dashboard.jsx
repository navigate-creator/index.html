import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import 'tailwindcss/tailwind.css';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [tenant] = useState('6b3755d5-015b-4669-91fd-a934161172c0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('tenant_id', tenant)
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setCases(data);
      setLoading(false);
    };
    fetchCases();
  }, [tenant]);

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-10 text-[#0B1F3F]">
      <h1 className="font-black text-3xl mb-8 text-[#0B1F3F]">MC™ Dashboard</h1>
      
      {loading ? <p>Syncing with Database...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded shadow-md border-l-4 border-[#F5C518]">
              <h3 className="font-bold text-xl">{c.entity_name}</h3>
              <p className="text-xs text-gray-400 mb-4">{new Date(c.created_at).toLocaleString()}</p>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                {Object.entries(c.pillar_scores || {}).map(([id, score]) => (
                  <div key={id} className="bg-gray-50 p-2 border">Pillar {id}: <span className="font-bold">{score}</span></div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <span className="font-black">FINAL: {c.final_score}%</span>
                <span className={`px-3 py-1 rounded text-white text-xs font-bold ${
                  c.status === 'APPROVE' ? 'bg-green-600' : 'bg-red-600'
                }`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
