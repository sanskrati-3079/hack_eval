import pandas as pd
import os
from orchestrator import evaluate_file_for_main
def main():
    ppt_dir = 'ppt'
    results = []
    for file_filename in os.listdir(ppt_dir):
        file_path = os.path.join(ppt_dir, file_filename)
        actual_ext = os.path.splitext(file_filename)[1].lower()
        if actual_ext not in ['.pdf', '.ppt', '.pptx']:
            print(f"Skipping unsupported file type: {file_filename}")
            continue
        eval_result = evaluate_file_for_main(file_path)
        results.append({
            'File': file_filename,
            'Evaluation Status': eval_result['status'],
            'Number of Images': eval_result.get('num_images', 0),
            'Total Raw Score': eval_result.get('total_raw', 0),
            'Total Weighted Score': eval_result.get('total_weighted', 0),
            'Scores': str(eval_result.get('scores', {})),
            'Number of Slides': eval_result.get('num_slides', ''),
            'Summary': eval_result.get('summary', ''),
            'Feedback': str(eval_result.get('feedback', {})),
        })
    if results:
        df = pd.DataFrame(results)
        df.to_excel('evaluation_results.xlsx', index=False)
        print("Results saved to evaluation_results.xlsx")

        # Create leaderboard: sort by Total Weighted Score descending, add Rank
        leaderboard = df.copy()
        leaderboard = leaderboard.sort_values(by='Total Weighted Score', ascending=False)
        leaderboard.insert(0, 'Rank', range(1, len(leaderboard) + 1))
        leaderboard.to_excel('leaderboard.xlsx', index=False)
        print("Leaderboard saved to leaderboard.xlsx")
    else:
        print("No valid files found in ppt directory.")

if __name__ == "__main__":
    main()