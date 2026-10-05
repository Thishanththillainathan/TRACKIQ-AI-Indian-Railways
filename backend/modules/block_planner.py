"""
TRACKIQ AI — Gemini Block Planner Module
==========================================
Accepts a maintenance goal and current world state, calls Gemini with
generate_structured() to produce a validated maintenance block plan.

Entry point
-----------
    plan = generate_block_plan(goal, world_state, supabase_client=None)

Plan schema (validated before returning)
-----------------------------------------
    {
      "plan_id": "<str>",
      "station": "<str>",
      "department": "<str>",
      "planning_date": "<YYYY-MM-DD>",
      "start_time": "<HH:MM>",
      "end_time": "<HH:MM>",
      "duration_minutes": <int>,
      "priority": "<HIGH|MEDIUM|LOW>",
      "actions": [
        {
          "sequence": <int>,
          "task": "<str>",
          "department": "<str>",
          "duration_minutes": <int>,
          "resources": "<str>"
        }
      ],
      "conflicts_noted": ["<str>", ...],
      "reasoning": "<str>"
    }
"""

import json
import logging
import os
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional

from services.gemini_client import generate_structured, GeminiAuthError, GeminiQuotaError, GeminiResponseError

logger = logging.getLogger(__name__)

# ── JSON schema for the block plan ────────────────────────────────────────────
BLOCK_PLAN_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "required": [
        "plan_id", "station", "department",
        "planning_date", "start_time", "end_time",
        "duration_minutes", "priority", "actions", "reasoning"
    ],
    "properties": {
        "plan_id":          {"type": "string",  "description": "Unique plan identifier, e.g. PLN-CBE-001"},
        "station":          {"type": "string",  "description": "Station name"},
        "department":       {"type": "string",  "description": "Primary department (TRACK | S&T | TRD | Multi-Department)"},
        "planning_date":    {"type": "string",  "description": "YYYY-MM-DD"},
        "start_time":       {"type": "string",  "description": "HH:MM (24-hour)"},
        "end_time":         {"type": "string",  "description": "HH:MM (24-hour)"},
        "duration_minutes": {"type": "integer", "description": "Total block duration in minutes"},
        "priority":         {"type": "string",  "enum": ["HIGH", "MEDIUM", "LOW"]},
        "actions": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["sequence", "task", "department", "duration_minutes"],
                "properties": {
                    "sequence":          {"type": "integer"},
                    "task":              {"type": "string"},
                    "department":        {"type": "string"},
                    "duration_minutes":  {"type": "integer"},
                    "resources":         {"type": "string"},
                }
            }
        },
        "conflicts_noted":  {"type": "array",  "items": {"type": "string"}},
        "reasoning":        {"type": "string",  "description": "Brief explanation of the plan"},
    }
}

_PLANNER_SYSTEM_PROMPT = """\
You are TRACKIQ AI, an expert Indian Railways maintenance block scheduling engine.

Given a maintenance goal and the current operational state, generate a detailed
maintenance block plan that:
  - Minimises passenger train disruption
  - Satisfies safety requirements for each department
  - Merges compatible jobs into a single block window where possible
  - Uses realistic Indian Railways time windows (typically 02:00–06:00 for high-traffic)

CRITICAL: respond with ONLY a valid JSON object matching the provided schema.
Do NOT wrap in markdown. Do NOT add any prose outside the JSON.
"""


def _validate_plan(plan: Dict[str, Any]) -> List[str]:
    """
    Additional semantic validation beyond required-key checking.
    Returns a list of validation errors (empty = valid).
    """
    errors: List[str] = []

    # Time format check
    for field in ("start_time", "end_time"):
        val = plan.get(field, "")
        parts = str(val).split(":")
        if len(parts) < 2 or not all(p.isdigit() for p in parts[:2]):
            errors.append(f"{field} must be HH:MM, got '{val}'")

    # Duration sanity
    dur = plan.get("duration_minutes", 0)
    if not isinstance(dur, int) or dur <= 0 or dur > 1440:
        errors.append(f"duration_minutes must be 1–1440, got {dur}")

    # Actions list
    actions = plan.get("actions", [])
    if not isinstance(actions, list) or len(actions) == 0:
        errors.append("actions must be a non-empty list")

    return errors


def generate_block_plan(
    goal: str,
    world_state: Dict[str, Any],
    supabase_client=None,
) -> Dict[str, Any]:
    """
    Generate a structured maintenance block plan using Gemini.

    Parameters
    ----------
    goal         : Natural language description of the maintenance task/goal.
    world_state  : Dict with operational context:
                     station, department, planning_date, active_blocks, 
                     pending_requests, available_resources, constraints, ...
    supabase_client : Optional — if provided, stores the plan in optimized_blocks.

    Returns
    -------
    dict — Validated block plan conforming to BLOCK_PLAN_SCHEMA.

    Raises
    ------
    GeminiResponseError : If the model cannot produce a valid plan after retries.
    GeminiAuthError     : Invalid API key.
    GeminiQuotaError    : Rate limit exceeded.
    ValueError          : Semantic validation failed (start/end time, duration).
    """
    # Build the prompt from goal + world state
    today = date.today().isoformat()
    station  = world_state.get("station", "Unknown Station")
    dept     = world_state.get("department", "Multi-Department")
    plan_date = world_state.get("planning_date", today)

    prompt = (
        f"Maintenance Goal: {goal}\n\n"
        f"Operational Context:\n"
        f"  Station: {station}\n"
        f"  Department: {dept}\n"
        f"  Planning Date: {plan_date}\n"
        f"  Active Blocks: {json.dumps(world_state.get('active_blocks', []), default=str)}\n"
        f"  Pending Requests: {json.dumps(world_state.get('pending_requests', []), default=str)}\n"
        f"  Known Constraints: {json.dumps(world_state.get('constraints', []), default=str)}\n"
        f"  Available Resources: {world_state.get('available_resources', 'Standard team')}\n\n"
        f"Generate a complete block plan using the schema below."
    )

    logger.info("block_planner: generating plan for station=%s dept=%s date=%s", station, dept, plan_date)

    plan = generate_structured(
        prompt=prompt,
        schema=BLOCK_PLAN_SCHEMA,
        system_instruction=_PLANNER_SYSTEM_PROMPT,
        temperature=0.15,
        max_output_tokens=1024,
    )

    # Semantic validation
    errors = _validate_plan(plan)
    if errors:
        raise ValueError(
            f"Block plan failed semantic validation: {'; '.join(errors)}. "
            f"Plan keys: {list(plan.keys())}"
        )

    logger.info(
        "block_planner: plan generated | id=%s start=%s end=%s dur=%d actions=%d",
        plan.get("plan_id"), plan.get("start_time"), plan.get("end_time"),
        plan.get("duration_minutes", 0), len(plan.get("actions", [])),
    )

    # Optionally store in Supabase optimized_blocks
    if supabase_client:
        try:
            block_row = {
                "block_id":         plan.get("plan_id"),
                "station":          plan.get("station"),
                "department":       plan.get("department"),
                "planning_date":    plan.get("planning_date"),
                "start_time":       plan.get("start_time"),
                "end_time":         plan.get("end_time"),
                "duration_minutes": plan.get("duration_minutes"),
                "status":           "Scheduled",
                "train_impact":     plan.get("priority", "MEDIUM"),
                "merged_jobs":      plan.get("actions", []),
                "schedule_details": plan,
            }
            supabase_client.table("optimized_blocks").insert([block_row]).execute()
            logger.info("block_planner: plan stored in Supabase block_id=%s", plan.get("plan_id"))
        except Exception as exc:
            logger.warning("block_planner: Supabase store failed (non-fatal): %s", exc)

    return plan
