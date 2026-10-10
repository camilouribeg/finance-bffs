#!/usr/bin/env bash
# Aplica las migraciones pendientes a PRODUCCION y vuelve a vincular a staging.
# Uso (desde la raiz de este worktree):   bash scripts/aplicar-migraciones-prod.sh
set -euo pipefail

PROD_REF="djwcpxanrzaabopkcydp"
STAGING_REF="ducygjcfdiykcveqfpun"

cd "$(dirname "$0")/.."

restaurar_staging() {
  echo ""
  echo "Volviendo a vincular a STAGING ($STAGING_REF)..."
  npx supabase link --project-ref "$STAGING_REF" >/dev/null
  echo "Listo: vinculado a staging."
}
trap restaurar_staging EXIT

echo "== 1. Vinculando a PRODUCCION ($PROD_REF)"
npx supabase link --project-ref "$PROD_REF" >/dev/null

echo ""
echo "== 2. Migraciones que se aplicarian (dry-run, no cambia nada):"
npx supabase db push --dry-run

echo ""
read -r -p "Aplicar estas migraciones en PRODUCCION? Escribe SI para continuar: " respuesta
if [ "$respuesta" != "SI" ]; then
  echo "Cancelado. No se aplico nada."
  exit 0
fi

echo ""
echo "== 3. Aplicando en PRODUCCION"
npx supabase db push

echo ""
echo "== 4. Aplicado."
