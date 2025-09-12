def generate_team_id(index):
    """Generate a unique team ID based on index"""
    return f"TEAM{str(index + 1).zfill(4)}"  # e.g., TEAM0001, TEAM0002
