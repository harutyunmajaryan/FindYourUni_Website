from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import pandas as pd
import json
import numpy as np
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os

from knn_file import course_ranker, ratings_processor
from filter import GetFuzzyCategoryNames, GetFuzzyLocationNames, GetFuzzyCourseNames, GetFuzzyUniversityNames, EntireFilter

app = Flask(__name__)
CORS(app)
app.secret_key = os.environ.get("SECRET_KEY", "dev_key")

#####
@app.route("/<path:filename>")
def serve_files(filename):
    return send_from_directory(".", filename)

database = "database.db"

def init_db():
    con = sqlite3.connect(database)
    con.execute("PRAGMA foreign_keys = ON")
    
    cur=con.cursor()

    cur.execute("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")

    cur.execute("CREATE TABLE IF NOT EXISTS shortlist(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, course_name TEXT NOT NULL, university_name TEXT NOT NULL, score INTEGER, city TEXT, region TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE(user_id, course_name, university_name))")
    
    con.commit()
    con.close()
    
def get_db():
    con=sqlite3.connect(database)
    con.row_factory = sqlite3.Row #To convert inputs to a dictionary type thing
    return con
#####

def find_matches(preferences, filtered_dataset, num_results):
    raw_ratings = [                     # orders raw_ratings in a way that knn ratings_processor() expects
        preferences['satisfaction'],
        preferences['outcomes'],
        preferences['research'],
        preferences['cost']
        ]
    
    user_importance = ratings_processor(raw_ratings)
    top_courses = course_ranker(user_importance, filtered_dataset, num_results)

    return top_courses

@app.route('/api/get-results', methods=['POST'])
def get_results():
    data = request.json
    print("Received preferences and filters:", data)

    filters_data = data.get('filters', {})
    location_list = filters_data.get('locations', [])
    category_list = filters_data.get('categories', [])
    name_list = filters_data.get('courseNames', [])
    degree_type_list = filters_data.get('degreeTypes', [])
    university_list = filters_data.get('universities', [])
    grades_list = filters_data.get('grades', [])
    grades_type = filters_data.get('gradesType', None)

    print("Processing filters!")

    filtered_dataset = EntireFilter(location_list, category_list, name_list, degree_type_list, university_list, grades_list, grades_type)

    preferences_data = data.get('preferences', {})
    preferences = {
            'outcomes': preferences_data.get('outcomes', 5),
            'satisfaction': preferences_data.get('satisfaction', 5),
            'research': preferences_data.get('research', 5),
            'cost': preferences_data.get('cost', 5),
        }

    num_results = data.get('num_results', 10)
    
    print("Processing preferences:", preferences)

    results = find_matches(preferences, filtered_dataset, num_results)

    results_cleaned = json.loads(
        json.dumps(results, default=lambda x: None if isinstance(x, float) and np.isnan(x) else x)
    )

    print(f"Returning {len(results_cleaned)} results")

    return jsonify({
            'success': True,
            'courses': results_cleaned
        })

@app.route('/api/fuzzy-search-degree-type', methods=['POST'])
def fuzzy_search_degree_type():
    data = request.json
    search_term = data.get("search_term", "")
    dataset = pd.read_csv('master_dataset_v2.4.csv')

    if not search_term or search_term.strip() == "":
        all_degree_types = dataset["DEGREE_TYPE"].dropna().unique().tolist()
        all_degree_types = sorted(all_degree_types)
        return jsonify({
            'success': True,
            'matches': all_degree_types,
            'search_term': search_term
        })
    
    matched_categories = GetFuzzyUniversityNames(search_term, dataset)
    matched_categories = matched_categories[:15]
    return jsonify({
            'success': True,
            'matches': matched_categories,
            'search_term': search_term
        })

@app.route('/api/fuzzy-search-categories', methods=['POST'])
def fuzzy_search_categories():
    data = request.json
    search_term = data.get("search_term", "")
    dataset = pd.read_csv('master_dataset_v2.4.csv')

    if not search_term or search_term.strip() == "":
        all_categories = dataset["BROAD_SUBJECT"].dropna().unique().tolist()
        all_categories = sorted(all_categories)[:20]
        return jsonify({
            'success': True,
            'matches': all_categories,
            'search_term': search_term
        })
    
    matched_categories = GetFuzzyCategoryNames(search_term, dataset)
    matched_categories = matched_categories[:15]
    return jsonify({
            'success': True,
            'matches': matched_categories,
            'search_term': search_term
        })

@app.route('/api/fuzzy-search-names', methods=['POST'])
def fuzzy_search_names():
    data = request.json
    search_term = data.get("search_term", "")
    dataset = pd.read_csv('master_dataset_v2.4.csv')
    matched_categories = GetFuzzyCourseNames(search_term, dataset)
    return jsonify({
            'success': True,
            'matches': matched_categories,
            'search_term': search_term
        })

@app.route('/api/fuzzy-search-locations', methods=['POST'])
def fuzzy_search_locations():
    data = request.json
    search_term = data.get("search_term", "")
    dataset = pd.read_csv('master_dataset_v2.4.csv')

    if not search_term or search_term.strip() == "":
        country_list = ["England", "Wales", "Northern Ireland", "Scotland"]
        regions = dataset['Region'].dropna().unique().tolist()
        cities = dataset["CITY"].dropna().unique().tolist()
        all_locations = regions + cities + country_list
        all_locations = sorted(list(set(all_locations)))
        all_locations = sorted(all_locations)
        return jsonify({
            'success': True,
            'matches': all_locations,
            'search_term': search_term
        })
    
    matched_categories = GetFuzzyLocationNames(search_term, dataset)
    matched_categories = matched_categories[:15]
    return jsonify({
            'success': True,
            'matches': matched_categories,
            'search_term': search_term
        })

@app.route('/api/fuzzy-search-universities', methods=['POST'])
def fuzzy_search_universities():
    data = request.json
    search_term = data.get("search_term", "")
    dataset = pd.read_csv('master_dataset_v2.4.csv')

    if not search_term or search_term.strip() == "":
        all_universities = dataset["UNIVERSITY_NAME"].dropna().unique().tolist()
        all_universities = sorted(all_universities)
        return jsonify({
            'success': True,
            'matches': all_universities,
            'search_term': search_term
        })
    
    matched_categories = GetFuzzyUniversityNames(search_term, dataset)
    matched_categories = matched_categories[:15]
    return jsonify({
            'success': True,
            'matches': matched_categories,
            'search_term': search_term
        })

#####
########## Register ##########

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status":"error", "message":"Email or password not entered"}), 400

    con = get_db()
    cur = con.cursor()

    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    user = cur.fetchone()

    if user:
        con.close()
        return jsonify({"status": "error", "message": "This email is already registered"}), 400

    hashed_password = generate_password_hash(password)

    cur.execute("INSERT INTO users (email, password) VALUES (?,?)", (email, hashed_password))

    con.commit()
    con.close()

    return jsonify({"status":"success", "message":"Account created"}), 200


########## Login ##########

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status":"error"}), 400

    con = get_db()
    cur = con.cursor()

    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cur.fetchone()

    con.close()

    if user and check_password_hash(user["password"], password):
        session["user_id"] = user["id"]
        session["email"] = user["email"]
        return jsonify({"status":"success"}), 200

    return jsonify({"status":"error"}), 401


########## Save to Shortlist ##########

@app.route("/shortlist/add", methods=["POST"])
def add_to_shortlist():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    data = request.get_json()
    course_name = data.get("course_name")
    university_name = data.get("university_name")
    score = data.get("score")
    city = data.get("city")
    region = data.get("region")

    if not course_name or not university_name:
        return jsonify({"status": "error", "message": "Missing course data"}), 400

    con = get_db()
    cur = con.cursor()

    cur.execute("""
        SELECT id FROM shortlist
        WHERE user_id = ? AND course_name = ? AND university_name = ?
    """, (session["user_id"], course_name, university_name))

    already_existing = cur.fetchone()
    if already_existing:
        con.close()
        return jsonify({"status": "error", "message": "Already saved"}), 400

    cur.execute("INSERT INTO shortlist (user_id, course_name, university_name, score, city, region) VALUES (?, ?, ?, ?, ?, ?)", (session["user_id"], course_name, university_name, score, city, region))

    con.commit()
    con.close()

    return jsonify({"status": "success", "message": "Saved"}), 200


########## Show Shortlist ##########

@app.route("/shortlist/list", methods=["GET"])
def show_shortlist():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    con = get_db()
    cur = con.cursor()

    cur.execute("SELECT course_name, university_name, score, city, region FROM shortlist WHERE user_id = ? ORDER BY created_at DESC", (session["user_id"],))

    items = cur.fetchall()
    con.close()

    return jsonify([dict(item) for item in items]), 200


########## Remove from Shortlist ##########

@app.route("/shortlist/remove", methods=["POST"])
def remove_from_shortlist():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    data = request.get_json()

    course_name = data.get("course_name")
    university_name = data.get("university_name")

    if not course_name or not university_name:
        return jsonify({"status": "error", "message": "Missing data"}), 400

    con = get_db()
    cur = con.cursor()

    cur.execute("DELETE FROM shortlist WHERE user_id = ? AND course_name = ? AND university_name = ?", (session["user_id"], course_name, university_name))

    con.commit()
    con.close()

    return jsonify({"status": "success"}), 200
#####


if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    print("Test the server at: http://localhost:5000/api/test")
    init_db()
    app.run(debug=True, port=5000)
