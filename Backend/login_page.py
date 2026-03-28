from flask import Flask, request, jsonify, send_from_directory, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os

app=Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev_key")

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


###############################################

if __name__ == "__main__":
    init_db()
    app.run()
