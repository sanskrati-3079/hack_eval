def generate_team_id(index: int) -> str:
    return f"T-{str(index + 1).zfill(3)}"
