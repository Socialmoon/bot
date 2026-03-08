// Leads API — disabled until dashboard feature is ready
// Uncomment when re-enabling

import { NextResponse } from "next/server";

const disabled = () =>
  NextResponse.json({ error: "This feature is not yet enabled." }, { status: 503 });

export async function POST() { return disabled(); }
export async function GET()  { return disabled(); }

// Full implementation preserved below:
// import { NextRequest } from "next/server";
// import { createClient } from "@/lib/supabase/server";
//
// export async function POST(req: NextRequest) {
//   const { name, email, phone, query } = await req.json();
//   if (!name || (!email && !phone)) {
//     return NextResponse.json({ error: "Name and phone/email required" }, { status: 400 });
//   }
//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("leads")
//     .insert({ name, email: email ?? null, phone: phone ?? null, query: query ?? null })
//     .select().single();
//   if (error) return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
//   return NextResponse.json({ lead: data });
// }
//
// export async function GET() {
//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("leads").select("id, name, email, phone, query, created_at")
//     .order("created_at", { ascending: false }).limit(100);
//   if (error) return NextResponse.json({ error: error.message }, { status: 500 });
//   return NextResponse.json({ leads: data });
// }
