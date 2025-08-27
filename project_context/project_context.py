import os
from typing import Optional, Dict, Any, List

class ProjectAnalysisContext:
    """Per-project state: text, images, workflow summary, scores, feedback, errors."""
    def __init__(self, file_path: str):
        self.file_path: str = file_path
        self.team_name: str = os.path.splitext(os.path.basename(file_path))[0]
        self.raw_text: str = ""
        self.images_base64: List[str] = []   # quick evidence count (raw)
        self.images_meta: List[Dict[str, Any]] = []

        # Image/diagram summary injected into prompts
        self.workflow_report: Optional[Dict[str, Any]] = None
        self.workflow_report_text: str = ""

        self.scores: Dict[str, Any] = {}
        self.scoring_summary: str = ""
        self.workflow_analysis: Optional[Dict[str, Any]] = None
        self.feedback: Dict[str, Any] = {}
        self.evaluation_error: Optional[str] = None

    def update_workflow_report(self, report: Dict[str, Any]):
        """
        Build a compact evidence paragraph giving equal weight to diagrams.
        Only include items flagged as diagrams and not decorative/irrelevant.
        """
        self.workflow_report = report or None
        if not report:
            self.workflow_report_text = ""
            return

        analyses = report.get("image_analyses") or []
        lines: List[str] = []
        lines.append(f"Overall: {report.get('overall_summary','').strip()}")

        for a in analyses:
            is_diag = bool(a.get("is_diagram", False))
            importance = (a.get("importance") or "").lower()
            if not is_diag or importance in {"decorative", "irrelevant"}:
                continue

            tags = []
            if importance in {"critical", "supporting"}:
                tags.append(importance.upper())
            diagram_type = a.get("type", "Diagram")
            if diagram_type:
                tags.append(diagram_type)
            where_bits = []
            if a.get("slide_index") is not None:
                where_bits.append(f"slide {a['slide_index']+1}")
            if a.get("page_index") is not None:
                where_bits.append(f"page {a['page_index']+1}")
            where = f" ({', '.join(where_bits)})" if where_bits else ""
            tag_str = f"[{', '.join(tags)}]" if tags else ""
            desc = (a.get("description") or "").strip()
            lines.append(f"Image {a.get('image_index','?')} {tag_str}{where}: {desc}")

        self.workflow_report_text = "\n".join(lines).strip()

    def update_scoring_results(self, team_name: str, scores: Dict[str, Any],
                               summary: str, workflow_analysis: Optional[Dict[str, Any]]):
        if team_name:
            self.team_name = team_name
        self.scores = scores or {}
        self.scoring_summary = summary or ""
        self.workflow_analysis = workflow_analysis

    def update_workflow_results(self, workflow: Dict[str, Any]):
        self.workflow_analysis = workflow

    def update_feedback_results(self, feedback: Dict[str, Any]):
        self.feedback = feedback or {}

    def set_error(self, msg: str):
        self.evaluation_error = msg
