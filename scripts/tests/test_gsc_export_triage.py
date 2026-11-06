"""Offline-only regression checks; all numbers are synthetic fixtures."""

import importlib.util
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

MODULE = Path(__file__).resolve().parents[1] / "gsc-export-triage.py"
spec = importlib.util.spec_from_file_location("petclub_gsc_export_triage", MODULE)
triage = importlib.util.module_from_spec(spec)
import sys
sys.modules[spec.name] = triage
spec.loader.exec_module(triage)


class ExportTriageTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.queries = self.root / "Queries.csv"
        self.pages = self.root / "Pages.csv"
        self.queries.write_text("\ufeffTop queries,Clicks,Impressions,CTR,Position\ncatit digger vs wave,3,300,1%,8.5\npuppy care canada,2,60,3.33%,12.4\n", encoding="utf-8")
        self.pages.write_text("Top pages,Clicks,Impressions,CTR,Position\nhttps://thepetclub.ca/compare/catit-digger-vs-wave-circuit,3,300,1%,8.5\n", encoding="utf-8")

    def args(self, **kwargs):
        values = {
            "queries": self.queries, "pages": self.pages, "start_date": "2026-09-25",
            "end_date": "2026-10-22", "settled_through": None,
            "previous_queries": None, "previous_pages": None,
            "previous_start": None, "previous_end": None,
            "indexed_pages": None, "not_indexed_pages": None,
            "indexing_report_date": None, "top": 10,
        }
        values.update(kwargs)
        return SimpleNamespace(**values)

    def test_perf_rows_and_opportunities_not_property_totals(self):
        report = triage.build_report(self.args())
        self.assertEqual(report["queries"]["rows_in_export"], 2)
        self.assertEqual(report["queries"]["opportunities"]["near_first_page_heuristic"][0]["key"], "catit digger vs wave")
        self.assertIsNone(report["sitewide_performance_totals"])
        self.assertIsNone(report["indexing"]["indexed_pages"])

    def test_maturity_unverified_even_when_cutoff_supplied(self):
        report = triage.build_report(self.args(settled_through="2026-10-21"))
        self.assertEqual(report["data_maturity"]["state"], "contains_dates_after_operator_supplied_settled_through")
        report = triage.build_report(self.args(settled_through="2026-10-22"))
        self.assertEqual(report["data_maturity"]["state"], "operator_supplied_cutoff_not_api_verified")

    def test_requires_complete_index_overview_provenance(self):
        with self.assertRaises(triage.ExportError):
            triage.build_report(self.args(indexed_pages=40))
        report = triage.build_report(self.args(indexed_pages=40, not_indexed_pages=9, indexing_report_date="2026-10-24"))
        self.assertEqual(report["indexing"]["indexed_pages"], 40)
        self.assertEqual(report["indexing"]["source"], "operator_transcribed_official_gsc_page_indexing_overview")

    def test_optional_previous_period_deltas_are_limited_to_matching_rows(self):
        old_q = self.root / "QueriesPrevious.csv"
        old_p = self.root / "PagesPrevious.csv"
        old_q.write_text("Top queries,Clicks,Impressions,CTR,Position\ncatit digger vs wave,1,200,0.5%,11\n", encoding="utf-8")
        old_p.write_text("Top pages,Clicks,Impressions,CTR,Position\nhttps://thepetclub.ca/compare/catit-digger-vs-wave-circuit,1,200,0.5%,11\n", encoding="utf-8")
        report = triage.build_report(self.args(previous_queries=old_q, previous_pages=old_p, previous_start="2026-08-28", previous_end="2026-09-24"))
        self.assertEqual(report["queries"]["same_query_row_deltas"][0]["row_impression_change"], 100)
        self.assertEqual(report["pages"]["same_page_row_deltas"][0]["row_click_change"], 2)

    def test_prevents_mixed_properties_and_invalid_rows(self):
        self.pages.write_text("Top pages,Clicks,Impressions,CTR,Position\nhttps://another-site.ca/,3,300,1%,8.5\n", encoding="utf-8")
        with self.assertRaisesRegex(triage.ExportError, "outside ThePetClub.ca"):
            triage.build_report(self.args())
        self.queries.write_text("Top queries,Clicks,Impressions,CTR,Position\nhello,11,10,110%,3\n", encoding="utf-8")
        with self.assertRaises(triage.ExportError):
            triage.read_export(self.queries, "query")

    def test_rejects_overlapping_or_different_length_comparison(self):
        with self.assertRaises(triage.ExportError):
            triage.build_report(self.args(previous_queries=self.queries))
        with self.assertRaises(triage.ExportError):
            triage.interval("2026-10-23", "2026-10-22", "test")

if __name__ == "__main__":
    unittest.main()
