// Leads dashboard — disabled until feature is ready
// Full implementation is preserved below, commented out.

import { redirect } from "next/navigation";

export default function LeadsPage() {
  redirect("/");
}

/* --- Full implementation ---

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, email, phone, query, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">← Back</Link>
            <h1 className="font-semibold text-white">Leads</h1>
          </div>
          <Link
            href="/leads/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Lead
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!leads || leads.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg text-gray-300 mb-2">No leads yet</p>
            <p className="text-sm mb-6">Capture your first lead to get started</p>
            <Link
              href="/leads/new"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Add First Lead
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                  <th className="pb-3 pr-6">Name</th>
                  <th className="pb-3 pr-6">Company</th>
                  <th className="pb-3 pr-6">Score</th>
                  <th className="pb-3 pr-6">Tier</th>
                  <th className="pb-3 pr-6">Status</th>
                  <th className="pb-3">Added</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-900 hover:bg-gray-900/40 transition-colors">
                    <td className="py-4 pr-6">
                      <div className="text-white font-medium">{lead.name}</div>
                      <div className="text-gray-500 text-xs">{lead.email}</div>
                    </td>
                    <td className="py-4 pr-6 text-gray-300">{lead.company ?? "—"}</td>
                    <td className="py-4 pr-6">
                      <span className="text-white font-semibold">{lead.score}</span>
                      <span className="text-gray-600">/100</span>
                    </td>
                    <td className="py-4 pr-6">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.tier === "hot"
                            ? "bg-red-900/40 text-red-400"
                            : lead.tier === "warm"
                            ? "bg-yellow-900/40 text-yellow-400"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {lead.tier}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-gray-400 capitalize">{lead.status}</td>
                    <td className="py-4 text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

*/
