from nlp_parser import aggregate_by_sector, classify_sector, extract_amount


def test_extract_amount_converts_lakh_to_crore():
    assert extract_amount("Rural clinic grant Rs 250 lakh") == 2.5


def test_extract_amount_reads_crore_values():
    assert extract_amount("Ministry allocation Rs 12,345.5 crore") == 12345.5


def test_classify_sector_uses_keyword_mapping():
    assert classify_sector("National highway bridge expansion") == "infrastructure"
    assert classify_sector("AIIMS hospital upgrade") == "healthcare"
    assert classify_sector("Unmatched fiscal transfer") == "others"


def test_aggregate_by_sector_sums_allocations():
    items = [
        {"sector": "healthcare", "amount_crore": 10},
        {"sector": "healthcare", "amount_crore": 5.5},
        {"sector": "education", "amount_crore": 2},
    ]

    assert aggregate_by_sector(items) == {"healthcare": 15.5, "education": 2}
