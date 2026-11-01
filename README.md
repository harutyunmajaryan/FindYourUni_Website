# 🎓 UniMatch: Find Your Best-Match University

> Stop opening dozens of university websites. Enter your grades and priorities, and get a ranked list of universities that fit **you**.

![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-orange?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-blue?logo=css3&logoColor=white)
![ML](https://img.shields.io/badge/Algorithm-KNN-green)

<!-- Replace with a screenshot or GIF of your app -->
<!-- ![UniMatch Demo](docs/demo.gif) -->

---

## 📖 About

Choosing a university means comparing entry requirements, student satisfaction, career outcomes and salaries across many different websites. **UniMatch** brings all of that into one place.

Students enter their **IB or A-Level grades**, preferred **location**, and what matters most to them (student satisfaction, career prospects, earning prospects). A **K-Nearest Neighbours (KNN)** algorithm then returns the universities that best match their profile.

## ✨ Features

- 🎯 **Personalised matching**: KNN-based recommendation engine ranks universities by how closely they fit your profile
- 📝 **IB & A-Level support**: enter your predicted or achieved grades in either system
- 😊 **Student satisfaction filter**: prioritise universities with happier students
- 💼 **Career prospects filter**: see how graduates fare in the job market
- 💷 **Earning prospects filter**: factor in graduate salary outcomes
- 📍 **Location preferences**: narrow results to where you want to live and study
- ⚡ **One search, one place**: no more juggling multiple university pages

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python |
| Algorithm | K-Nearest Neighbours (KNN) |
| Data | CSV |

## 🧠 How It Works

1. **Input**: the student provides their grades (IB / A-Level), desired location, and weightings for satisfaction, career prospects and earnings.
2. **Vectorisation**: each university is represented as a feature vector (entry requirements, satisfaction score, career score, earnings score, location).
3. **Normalisation**: features are scaled so no single metric dominates the distance calculation.
4. **KNN search**: the algorithm finds the *k* universities closest to the student's preference vector.
5. **Results**: the top matches are returned and displayed, ranked by closeness.

```
Student Profile ──► Normalise ──► KNN (distance to each university) ──► Top-K Matches
```

## 📁 Project Structure

```
unimatch/
├── backend/
│   ├── app.py              # Server & API routes
│   ├── knn_model.py        # KNN matching logic
│   └── data/
│       └── universities.csv
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── requirements.txt
└── README.md
```

> ⚠️ Update this tree to match your actual folder layout.

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- pip

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. (Optional) create a virtual environment
python -m venv venv
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the backend
python backend/app.py
```

Then open **http://localhost:5000** in your browser (adjust the port to match your setup).

## 💻 Usage

1. Select your qualification type (**IB** or **A-Level**) and enter your grades.
2. Choose your preferred location.
3. Set how much you care about **student satisfaction**, **career prospects** and **earning prospects**.
4. Click **Find Universities** to see your best matches.

## 📊 Data Sources

<!-- List where your data comes from, e.g. -->
- Student satisfaction: <!-- e.g. National Student Survey (NSS) -->
- Career & earnings outcomes: <!-- e.g. Graduate Outcomes survey / LEO data -->
- Entry requirements: <!-- e.g. UCAS / university websites -->

## 🔮 Future Improvements

- [ ] Add more countries and universities
- [ ] Course/subject-specific matching
- [ ] Save and compare shortlists
- [ ] User accounts
- [ ] Add tuition fees and cost of living filters
- [ ] Deploy online

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Authors

- **Your Name**: [@your-username](https://github.com/your-username)
- **Friend's Name**: [@friend-username](https://github.com/friend-username)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

⭐ If you found this project useful, please give it a star!
