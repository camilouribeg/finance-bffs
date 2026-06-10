import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const CATEGORIES = [
  "Vivienda", "Comida", "Transporte", "Salud", "Educación",
  "Entretenimiento", "Ropa", "Belleza", "Suscripciones",
  "Cafés", "Domicilios", "Compras impulsivas", "Otros",
];

async function parseText(groq: Groq, transcription: string) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    max_tokens: 120,
    messages: [
      {
        role: "system",
        content: `Eres Amy, asistente de finanzas. Extrae de texto en español el gasto registrado.

Categorías válidas: ${CATEGORIES.join(", ")}

Responde SOLO con JSON válido sin texto adicional:
{"categoria":"...","descripcion":"...","valor":0}

Reglas:
- categoria: la más apropiada de la lista
- descripcion: máximo 4 palabras, en español, qué fue el gasto
- valor: entero en pesos. "cinco mil"=5000, "treinta y dos mil"=32000, "cien mil"=100000, "un millón"=1000000. Sin puntos ni comas.
- Si no hay valor claro, usa 0`,
      },
      { role: "user", content: transcription },
    ],
  });
  const text = completion.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    const parsed = JSON.parse(text) as { categoria?: string; descripcion?: string; valor?: unknown };
    return {
      categoria: CATEGORIES.includes(parsed.categoria ?? "") ? (parsed.categoria ?? "Otros") : "Otros",
      descripcion: typeof parsed.descripcion === "string" ? parsed.descripcion : "",
      valor: typeof parsed.valor === "number" && parsed.valor > 0 ? Math.round(parsed.valor) : 0,
    };
  } catch {
    return { categoria: "Otros", descripcion: "", valor: 0 };
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      // Audio path — transcribe with Groq Whisper, then parse
      const formData = await request.formData();
      const audio = formData.get("audio") as File | null;
      if (!audio) return NextResponse.json({ error: "Sin audio" }, { status: 400 });

      const whisperResult = await groq.audio.transcriptions.create({
        file: audio,
        model: "whisper-large-v3-turbo",
        language: "es",
      });
      const transcription = whisperResult.text?.trim() ?? "";
      if (!transcription) return NextResponse.json({ categoria: "Otros", descripcion: "", valor: 0 });
      return NextResponse.json(await parseText(groq, transcription));
    } else {
      // JSON text path
      const body = await request.json().catch(() => ({}));
      const { transcription } = body as { transcription?: string };
      if (!transcription) return NextResponse.json({ error: "Sin transcripción" }, { status: 400 });
      return NextResponse.json(await parseText(groq, transcription));
    }
  } catch {
    return NextResponse.json({ categoria: "Otros", descripcion: "", valor: 0 });
  }
}
