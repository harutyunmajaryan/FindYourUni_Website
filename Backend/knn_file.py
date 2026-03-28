import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.impute import SimpleImputer


def csv_scores_processor():
    """If need be, will make every score in csv file from 1-100"""
    pass

def ratings_processor(raw_ratings):
    user_ratings = {'NSS_OVERALL': raw_ratings[0], 'OVERALL_SUCCESS_RATE': raw_ratings[1], 'Research_Quality': raw_ratings[2], "Affordability_Score": raw_ratings[3]}
    return user_ratings

def course_ranker(user_importance, filtered_df, num_results = 10, csv_path="master_dataset_v2.4.csv"):
    df = filtered_df.copy()

    if len(df) == 0:
        return []
    
    original_df = pd.read_csv(csv_path)
    factors = list(user_importance.keys())

    imputer = SimpleImputer(strategy='median')
    imputer.fit(original_df[factors])
    
    df[factors] = imputer.transform(df[factors])

    stretcher = np.sqrt([user_importance[f] for f in factors])
    target_pin = np.array([100 for f in factors])
    stretched_pin = target_pin * stretcher
    
    worst_pin = np.array([0 for f in factors]) * stretcher
    max_possible_distance = np.linalg.norm(stretched_pin - worst_pin)
    
    print(f"\n=== DISTANCE CALIBRATION ===")
    print(f"Perfect course (all 100s): distance = 0 → 100%")
    print(f"Worst possible (all 0s): distance = {max_possible_distance:.2f} → 0%")

    if not num_results or len(df) <= num_results or num_results < 10 or num_results > 100:
        num_results = min(10, len(df))

    stretched_data = df[factors].values * stretcher
    knn = NearestNeighbors(n_neighbors=num_results, metric='euclidean', algorithm='brute')
    knn.fit(stretched_data)
    distances, indices = knn.kneighbors([stretched_pin])

    top_10_ids = df.iloc[indices[0]][['UNIVERSITY_NAME', 
                                      'COURSE_NAME', 
                                      'COURSE_URL',
                                      'NSS_OVERALL',
                                      'OVERALL_SUCCESS_RATE',
                                      'Research_Quality',
                                      'Affordability_Score',
                                      'CITY',
                                      'Region',
                                      'DEGREE_TYPE'
                                      ]].replace({np.nan: None}).to_dict(orient='records')
    
    for i, course in enumerate(top_10_ids):
        course_distance = distances[0][i]
        
        decay_rate = 0.005  # higher value means greater spread in percentages within typical range
        score_ratio = np.exp(-decay_rate * course_distance)
        match_percentage = round(score_ratio * 100, 1)
        
        print(f"\nRank {i+1}: {course['COURSE_NAME'][:40]:<40}")
        print(f"  Distance: {course_distance:.2f}")
        print(f"  e^(-{decay_rate} × {course_distance:.2f}) = {score_ratio:.4f}")
        print(f"  Match: {match_percentage}%")
        
        course["Match_Percentage"] = match_percentage
        course['rank'] = i + 1

    return top_10_ids

if __name__ == '__main__':
    raw_user_ratings = [10, 0, 0, 0]
    ratings = ratings_processor(raw_user_ratings)
    df = pd.read_csv("master_dataset_v2.4.csv")
    top_courses = course_ranker(ratings, df)
    print(top_courses)
