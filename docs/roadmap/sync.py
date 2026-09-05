#!/usr/bin/env python3
"""Regenera docs/roadmap/roadmap.md como espejo fiel del Excel del roadmap.

Uso:  python3 docs/roadmap/sync.py
Requiere: openpyxl  (pip install openpyxl)
"""
from datetime import date
from pathlib import Path

import openpyxl

HERE = Path(__file__).parent
XLSX = HERE / "Finance-BFF-Experience-Roadmap.xlsx"
OUT = HERE / "roadmap.md"

FIELDS = [
    ("Estado actual", "Estado Actual"),
    ("Experiencia deseada", "Experiencia Deseada"),
    ("Historia de usuario", "Historia de Usuario"),
    ("Lineamientos de implementación", "Lineamientos de Implementación"),
    ("Consideraciones de UX", "Consideraciones de UX"),
    ("Objetivo de negocio", "Objetivo de Negocio"),
    ("Resultado esperado", "Resultado Esperado"),
    ("Criterio de éxito", "Criterio de Éxito"),
]


def main() -> None:
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb.active
    rows = [r for r in ws.iter_rows(values_only=True) if any(r)]
    headers, data = rows[0], rows[1:]

    out = [
        "# Finance BFF — Experience Roadmap (espejo del Excel)",
        "",
        f"> Fuente de verdad: [`{XLSX.name}`](./{XLSX.name}), generado con el socio del proyecto.",
        "> Este `.md` es un espejo fiel y legible/diff-eable. Regenerar con `python3 docs/roadmap/sync.py`.",
        "",
        f"Última sincronización del espejo: {date.today().isoformat()}",
        "",
        "## Tablero de estado",
        "",
        "| ID | User Story | Epic | Prioridad | Estado |",
        "|----|------------|------|-----------|--------|",
    ]
    for r in data:
        d = dict(zip(headers, r))
        out.append(
            f"| {d['ID']} | {d['Nombre de la User Story']} | {d['Epic']} "
            f"| {d['Prioridad']} | {d['Estado']} |"
        )
    out += ["", "## Detalle por User Story", ""]
    for r in data:
        d = dict(zip(headers, r))
        out.append(f"### {d['ID']} · {d['Nombre de la User Story']}")
        out.append(
            f"**Epic:** {d['Epic']}  ·  **Prioridad:** {d['Prioridad']}  "
            f"·  **Estado:** {d['Estado']}"
        )
        out.append("")
        for label, key in FIELDS:
            val = d.get(key)
            if val:
                out.append(f"- **{label}:** {val}")
        out.append("")

    OUT.write_text("\n".join(out))
    print(f"escrito {OUT.relative_to(HERE.parent.parent)}  ({len(data)} stories)")


if __name__ == "__main__":
    main()
