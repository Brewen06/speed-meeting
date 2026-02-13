import io
import os
from typing import Any, Dict, List, Optional, Tuple

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _project_root() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def _logo_path(filename: str) -> Optional[str]:
    candidate = os.path.join(_project_root(), "frontend", "public", filename)
    return candidate if os.path.exists(candidate) else None


def _collect_participants(rounds_data: List[Dict[str, Any]]) -> List[str]:
    if not rounds_data:
        return []
    participants: List[str] = []
    seen = set()
    for table in rounds_data[0].get("tables", []):
        for member in table.get("members", []):
            if member not in seen:
                seen.add(member)
                participants.append(str(member))
    return participants


def _round_map(rounds_data: List[Dict[str, Any]]) -> Dict[str, Dict[int, int]]:
    mapping: Dict[str, Dict[int, int]] = {}
    for round_item in rounds_data:
        round_number = int(round_item.get("round", 0))
        for table in round_item.get("tables", []):
            table_id = int(table.get("table_id", 0))
            for member in table.get("members", []):
                key = str(member)
                if key not in mapping:
                    mapping[key] = {}
                mapping[key][round_number] = table_id
    return mapping


def _table_participants(rounds_data: List[Dict[str, Any]]) -> Dict[int, Dict[int, List[str]]]:
    mapping: Dict[int, Dict[int, List[str]]] = {}
    for round_item in rounds_data:
        round_number = int(round_item.get("round", 0))
        for table in round_item.get("tables", []):
            table_id = int(table.get("table_id", 0))
            mapping.setdefault(table_id, {})
            mapping[table_id][round_number] = [str(m) for m in table.get("members", [])]
    return mapping


def _chunk_rounds(round_numbers: List[int], chunk_size: int = 6) -> List[List[int]]:
    return [round_numbers[i:i + chunk_size] for i in range(0, len(round_numbers), chunk_size)]


def build_rotation_pdf(
    rounds_data: List[Dict[str, Any]],
    event_company: Optional[str] = None,
    event_location: Optional[str] = None,
    event_date: Optional[str] = None,
    include_logos: bool = False,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=24,
        rightMargin=24,
        topMargin=24,
        bottomMargin=24,
    )

    styles = getSampleStyleSheet()
    style_title = styles["Title"]
    style_subtitle = styles["Normal"]
    style_subtitle.fontSize = 10

    story: List[Any] = []

    title = "Plan de rotation"
    subtitle = "Speed Meeting Business"
    if event_date or event_company or event_location:
        details = []
        if event_date:
            details.append(event_date)
        if event_company:
            details.append(f"organise par {event_company}")
        if event_location:
            details.append(event_location)
        subtitle = f"{subtitle} - {' | '.join(details)}"

    if include_logos:
        logo_left = _logo_path("FFI.jpg")
        logo_right = _logo_path("LIF-bleu.jpg")
        header_cells: List[Any] = []
        if logo_left:
            header_cells.append(Image(logo_left, width=60, height=40))
        header_cells.append(Paragraph(title, style_title))
        if logo_right:
            header_cells.append(Image(logo_right, width=60, height=40))

        header_table = Table([header_cells], colWidths=[80, 380, 80])
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ]))
        story.append(header_table)
    else:
        story.append(Paragraph(title, style_title))

    story.append(Paragraph(subtitle, style_subtitle))
    story.append(Spacer(1, 12))

    participants = _collect_participants(rounds_data)
    round_numbers = [int(r.get("round", 0)) for r in rounds_data]
    round_numbers = [r for r in round_numbers if r > 0]
    if not round_numbers:
        round_numbers = list(range(1, 2))

    round_chunks = _chunk_rounds(round_numbers)
    participant_map = _round_map(rounds_data)
    table_map = _table_participants(rounds_data)
    table_ids = sorted({t.get("table_id", 0) for r in rounds_data for t in r.get("tables", []) if t.get("table_id")})

    for chunk_index, round_chunk in enumerate(round_chunks):
        story.append(Paragraph("Speed Meeting : N° de table d'affectation par participant", styles["Heading3"]))
        header = ["N° du participant"] + [f"N° de table\nrotation {r}" for r in round_chunk]
        table_rows: List[List[Any]] = [header]

        for participant in participants:
            row = [participant]
            for r in round_chunk:
                row.append(participant_map.get(participant, {}).get(r, ""))
            table_rows.append(row)

        table = Table(table_rows, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
        ]))
        story.append(table)
        story.append(Spacer(1, 14))

        story.append(Paragraph("Speed Meeting : N° des participants par table", styles["Heading3"]))
        header_tables = ["N° de table"] + [f"Participants\nrotation {r}" for r in round_chunk]
        table_rows = [header_tables]

        for table_id in table_ids:
            row = [str(table_id)]
            for r in round_chunk:
                members = table_map.get(table_id, {}).get(r, [])
                row.append(", ".join(members))
            table_rows.append(row)

        table = Table(table_rows, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
        ]))
        story.append(table)

        if chunk_index < len(round_chunks) - 1:
            story.append(PageBreak())

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
