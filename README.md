![](https://github.com/birukG09/Intelligent-Academic-Performance-Prediction-and-Planning/blob/c8edd974ffd806f88f97ec54c281447d378d2bc0/FireShot%20Capture%20006%20-%20%20-%20%5B0e87806e-1106-4ed3-af81-540e24a6e09e.riker.prod.repl.run%5D.png)📊 GPA Tracker – Machine Learning–Based GPA Prediction System
📌 Project Overview
GPA Tracker is a data-driven academic performance analysis system that predicts and tracks student GPA using machine learning (Random Forest Regression). The project combines a Python backend, a modern web frontend, and a real student performance dataset to demonstrate how data science can support academic decision-making.
![Description of Image](https://github.com/birukG09/Intelligent-Academic-Performance-Prediction-and-Planning/blob/ed405667a06ee0361fc097ac18ef16f20154fc6e/FireShot%20Capture%20015%20-%20GPA%20Tracker%20-%20BiTS%20Connect%20-%20%5B%5D.png)
The system analyzes student-related factors such as scores, performance metrics, and historical data to generate accurate GPA predictions.
![](https://github.com/birukG09/Intelligent-Academic-Performance-Prediction-and-Planning/blob/4f9c2323b532aaf39bcb4194bc0d062d92e8287b/FireShot%20Capture%20016%20-%20Teacher%20Dashboard%20-%20BiTS%20Connect%20-%20%5B%5D.png)
🧠 Core Features
📈 GPA Prediction using Random Forest Algorithm

🧑‍🎓 Student performance analysis from CSV data

🌐 Web-based interface for interaction and visualization

⚙️ Modular full-stack project structure (client, server, shared)

📊 Supports large datasets (1000+ student records)

🏗️ Project Structure
perl
Copy code
GPA-Tracker/
│
├── APP.PY                         # Main Python backend (ML model & logic)
├── gpa-tracker.html               # Frontend HTML interface
├── student_performance_updated_1000.csv  # Dataset used for training/testing
│
├── GPA-Tracker/
│   ├── client/                    # Frontend (UI logic)
│   ├── server/                    # Backend services / APIs
│   ├── script/                    # Automation or helper scripts
│   ├── shared/                    # Shared utilities & types
│   │
│   ├── package.json               # Project dependencies
│   ├── package-lock.json          # Dependency lock file
│   ├── vite.config.ts             # Vite configuration
│   ├── tailwind.config.ts         # Tailwind CSS configuration
│   ├── postcss.config.js          # PostCSS setup
│   ├── tsconfig.json              # TypeScript configuration
│   ├── drizzle.config.ts          # Database/ORM configuration
│   └── components.json            # UI component definitions
⚙️ Technologies Used
Python – Machine learning & data processing

Random Forest Regressions – GPA prediction model

HTML / Tailwind CSS – Frontend UI

TypeScript & Vite – Modern frontend tooling

CSV Dataset – Student academic data

Node.js – Project dependency management

🚀 How It Works
Student data is loaded from the CSV file.

The Random Forest model is trained on historical performance data.

The model predicts GPA based on academic features.

Results are displayed through a web interface.

🎯 Use Cases
Academic performance monitoring

GPA prediction and trend analysis

Educational data science projects

Machine learning demonstrations for students

📌 Future Improvements
User authentication.

Real-time GPA updates

Visualization dashboards

Database integration

Model accuracy optimization

👨‍💻 DEVLOPER

Biruk Gebre
Software Engineering Student
Focus: AI, Machine Learning, and Full-Stack Development
