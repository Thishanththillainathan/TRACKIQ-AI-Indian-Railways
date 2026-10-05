"""
TRACKIQ AI — Block Planner Unit Tests
========================================
Tests schema validation and the generate_block_plan function
with the actual Gemini API mocked — no network calls needed.

Run with pytest:
    cd backend
    python -m pytest tests/test_block_planner.py -v
"""

import sys
from pathlib import Path
import json
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent))


# ── Helpers ────────────────────────────────────────────────────────────────────

def _valid_plan(**overrides):
    """Return a minimal valid plan dict."""
    base = {
        "plan_id":          "PLN-TEST-001",
        "station":          "Coimbatore Junction",
        "department":       "TRACK",
        "planning_date":    "2026-09-05",
        "start_time":       "02:30",
        "end_time":         "04:00",
        "duration_minutes": 90,
        "priority":         "HIGH",
        "actions": [
            {
                "sequence":         1,
                "task":             "Rail Tamping",
                "department":       "TRACK",
                "duration_minutes": 90,
                "resources":        "Tamping Machine #TX-04",
            }
        ],
        "conflicts_noted":  [],
        "reasoning":        "Low-traffic window selected to minimise disruption.",
    }
    base.update(overrides)
    return base


# ── Schema validation tests ────────────────────────────────────────────────────

class TestBlockPlanValidation:
    """Tests for _validate_plan() — no API calls."""

    def setup_method(self):
        from modules.block_planner import _validate_plan
        self._validate = _validate_plan

    def test_valid_plan_has_no_errors(self):
        errors = self._validate(_valid_plan())
        assert errors == [], f"Expected no errors, got: {errors}"

    def test_missing_start_time_reports_error(self):
        plan = _valid_plan(start_time="not-a-time")
        errors = self._validate(plan)
        assert any("start_time" in e for e in errors)

    def test_missing_end_time_reports_error(self):
        plan = _valid_plan(end_time="bad")
        errors = self._validate(plan)
        assert any("end_time" in e for e in errors)

    def test_zero_duration_reports_error(self):
        plan = _valid_plan(duration_minutes=0)
        errors = self._validate(plan)
        assert any("duration_minutes" in e for e in errors)

    def test_negative_duration_reports_error(self):
        plan = _valid_plan(duration_minutes=-30)
        errors = self._validate(plan)
        assert any("duration_minutes" in e for e in errors)

    def test_over_1440_duration_reports_error(self):
        plan = _valid_plan(duration_minutes=1441)
        errors = self._validate(plan)
        assert any("duration_minutes" in e for e in errors)

    def test_empty_actions_reports_error(self):
        plan = _valid_plan(actions=[])
        errors = self._validate(plan)
        assert any("actions" in e for e in errors)


# ── generate_block_plan mocked tests ──────────────────────────────────────────

class TestGenerateBlockPlan:
    """Tests for generate_block_plan() with the Gemini API mocked."""

    def _run(self, mocked_plan: dict, goal="Test tamping", world_state=None):
        from modules.block_planner import generate_block_plan
        if world_state is None:
            world_state = {"station": "CBE", "department": "TRACK", "planning_date": "2026-09-05"}

        with patch("modules.block_planner.generate_structured", return_value=mocked_plan):
            return generate_block_plan(goal, world_state)

    def test_returns_valid_plan(self):
        plan = self._run(_valid_plan())
        assert plan["plan_id"] == "PLN-TEST-001"
        assert plan["duration_minutes"] == 90
        assert len(plan["actions"]) == 1

    def test_invalid_time_raises_value_error(self):
        bad_plan = _valid_plan(start_time="XX:YY")
        with pytest.raises(ValueError, match="start_time"):
            self._run(bad_plan)

    def test_zero_duration_raises_value_error(self):
        bad_plan = _valid_plan(duration_minutes=0)
        with pytest.raises(ValueError, match="duration_minutes"):
            self._run(bad_plan)

    def test_empty_actions_raises_value_error(self):
        bad_plan = _valid_plan(actions=[])
        with pytest.raises(ValueError, match="actions"):
            self._run(bad_plan)

    def test_gemini_response_error_propagates(self):
        from services.gemini_client import GeminiResponseError
        from modules.block_planner import generate_block_plan
        with patch("modules.block_planner.generate_structured", side_effect=GeminiResponseError("mock")):
            with pytest.raises(GeminiResponseError):
                generate_block_plan("goal", {"station": "CBE"})

    def test_supabase_store_called_when_client_provided(self):
        mock_supabase = MagicMock()
        mock_supabase.table.return_value.insert.return_value.execute.return_value = None

        from modules.block_planner import generate_block_plan
        with patch("modules.block_planner.generate_structured", return_value=_valid_plan()):
            generate_block_plan("goal", {"station": "CBE"}, supabase_client=mock_supabase)

        mock_supabase.table.assert_called_with("optimized_blocks")

    def test_supabase_failure_is_non_fatal(self):
        mock_supabase = MagicMock()
        mock_supabase.table.return_value.insert.return_value.execute.side_effect = RuntimeError("DB down")

        from modules.block_planner import generate_block_plan
        with patch("modules.block_planner.generate_structured", return_value=_valid_plan()):
            # Should NOT raise even if Supabase insert fails
            result = generate_block_plan("goal", {"station": "CBE"}, supabase_client=mock_supabase)
        assert result["plan_id"] == "PLN-TEST-001"
