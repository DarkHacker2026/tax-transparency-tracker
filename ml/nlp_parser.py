"""
Budget Parser Agent
===================
Converts raw government budget PDFs into structured JSON spend data.

Usage:
  python nlp_parser.py --input budget.pdf
  python nlp_parser.py --input budget.pdf --output output.json
  python nlp_parser.py --demo   # Run with sample text
"""

import argparse
import json
import re
import sys
from pathlib import Path

try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

# ─── Sector keyword mapping ────────────────────────────────────────────────────
SECTOR_KEYWORDS = {
    "infrastructure": [
        "road", "highway", "bridge", "metro", "railway", "rail", "airport",
        "port", "national highway", "nh-", "ministry of road", "pmgsy",
    ],
    "defence": [
        "defence", "army", "navy", "air force", "border", "military",
        "ministry of defence", "capf", "drdo",
    ],
    "healthcare": [
        "health", "medical", "hospital", "aiims", "ayushman", "nhm",
        "ministry of health", "drug", "pharmacy", "sanitation",
    ],
    "education": [
        "education", "school", "college", "university", "iit", "iim",
        "scholarship", "midday meal", "pm poshan", "samagra shiksha",
    ],
    "social_welfare": [
        "social", "welfare", "pm kisan", "mgnrega", "subsidy", "ration",
        "food security", "pension", "nfsa", "pm-kisan",
    ],
    "rural_dev": [
        "rural", "village", "gram", "jal jeevan", "pmay-g", "sanitation",
        "swachh bharat", "ministry of rural",
    ],
    "admin": [
        "salary", "administration", "judiciary", "court", "parliament",
        "secretariat", "ias", "interest payment", "debt", "finance commission",
    ],
    "others": [
        "space", "isro", "environment", "sports", "culture", "tourism",
        "science", "technology", "atomic energy",
    ],
}

# Compiled regex for rupee amounts (₹ or Rs, crore or lakh)
AMOUNT_RE = re.compile(
    r'(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr\.?|lakh|L)?',
    re.IGNORECASE,
)

MINISTRY_RE = re.compile(
    r'Ministry\s+of\s+[\w\s]+|Department\s+of\s+[\w\s]+',
    re.IGNORECASE,
)


def classify_sector(text: str) -> str:
    """Classify a line of budget text to a sector."""
    text_lower = text.lower()
    scores = {sector: 0 for sector in SECTOR_KEYWORDS}
    for sector, keywords in SECTOR_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[sector] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "others"


def extract_amount(text: str) -> float | None:
    """Extract rupee amount (in crore) from a line of text."""
    m = AMOUNT_RE.search(text)
    if not m:
        return None
    raw = float(m.group(1).replace(",", ""))
    lower = text.lower()
    if "lakh" in lower or " l " in lower:
        raw /= 100  # Convert lakh to crore
    return round(raw, 2)


def parse_pdf(pdf_path: str) -> list[dict]:
    """Extract and structure budget line items from a PDF."""
    if not PDF_AVAILABLE:
        raise ImportError("pdfplumber not installed. Run: pip install pdfplumber")

    results = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ""
            for line in text.split("\n"):
                line = line.strip()
                if len(line) < 15:
                    continue

                amount = extract_amount(line)
                if amount is None or amount < 10:  # Skip very small amounts
                    continue

                ministry_match = MINISTRY_RE.search(line)
                ministry = ministry_match.group(0).strip() if ministry_match else "General"

                sector = classify_sector(line)

                results.append({
                    "page": page_num,
                    "ministry": ministry,
                    "description": line[:200],
                    "amount_crore": amount,
                    "sector": sector,
                    "fiscal_year": "2024-25",
                })

    return results


def aggregate_by_sector(items: list[dict]) -> dict:
    """Aggregate total allocations by sector."""
    totals = {}
    for item in items:
        s = item["sector"]
        totals[s] = totals.get(s, 0) + item["amount_crore"]
    return {k: round(v, 2) for k, v in sorted(totals.items(), key=lambda x: -x[1])}


def demo_parse():
    """Demo using sample budget text lines."""
    SAMPLE_LINES = [
        "Ministry of Road Transport: ₹2,78,000 crore for National Highway development",
        "Ministry of Defence allocation: ₹6,21,540 crore for armed forces",
        "Ministry of Health and Family Welfare: Ayushman Bharat ₹7,500 crore",
        "MGNREGA social welfare scheme: ₹86,000 crore allocation",
        "Jal Jeevan Mission – Rural Development: ₹70,163 crore",
        "Ministry of Education — IITs and central universities: ₹44,094 crore",
        "ISRO and Space Department: ₹13,042 crore",
        "Interest payments on government debt: ₹11,90,440 crore",
        "PM Kisan scheme — farmer direct benefit transfer: ₹20,000 crore",
    ]

    print("\n=== Budget Parser Agent — Demo Run ===\n")
    items = []
    for line in SAMPLE_LINES:
        amount = extract_amount(line)
        sector = classify_sector(line)
        ministry_m = MINISTRY_RE.search(line)
        ministry = ministry_m.group(0) if ministry_m else "General"
        item = {"ministry": ministry, "description": line[:100], "amount_crore": amount, "sector": sector}
        items.append(item)
        print(f"  [{sector:<16}] ₹{amount:>12,.0f} Cr | {line[:60]}")

    print("\n--- Sector Totals ---")
    totals = aggregate_by_sector(items)
    for sector, total in totals.items():
        print(f"  {sector:<20}: ₹{total:>12,.0f} Cr")
    return items


def main():
    parser = argparse.ArgumentParser(description="Budget Parser Agent")
    parser.add_argument("--input", type=str, help="Path to budget PDF")
    parser.add_argument("--output", type=str, help="Output JSON file path")
    parser.add_argument("--demo", action="store_true", help="Run with sample data")
    args = parser.parse_args()

    if args.demo or not args.input:
        items = demo_parse()
    else:
        if not Path(args.input).exists():
            print(f"Error: File not found: {args.input}", file=sys.stderr)
            sys.exit(1)
        print(f"Parsing: {args.input}")
        items = parse_pdf(args.input)
        print(f"Extracted {len(items)} budget line items")

    result = {
        "items": items,
        "sector_totals": aggregate_by_sector(items),
        "total_items": len(items),
    }

    if args.output:
        with open(args.output, "w") as f:
            json.dump(result, f, indent=2)
        print(f"Saved to {args.output}")
    else:
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
