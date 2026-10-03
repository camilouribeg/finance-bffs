import { notFound } from "next/navigation";
import DemoClient from "./DemoClient";

export const dynamic = "force-dynamic";

// La demo sin cuenta (inicio de sesión anónimo de Supabase) solo existe fuera de
// producción. En prod, la ruta no existe.
export default function DemoPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <DemoClient />;
}
