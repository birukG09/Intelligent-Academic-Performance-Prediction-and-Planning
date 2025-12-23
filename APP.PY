# student_performance_predictor_simple.py
import pandas as pd
import numpy as np
import gradio as gr
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
import io
import sys
from datetime import datetime
warnings.filterwarnings('ignore')

# ============================================================================
# 1. DATA LOADING AND PREPROCESSING
# ============================================================================
class StudentDataProcessor:
    def __init__(self):
        self.df = None
        self.rf_model = None
        self.lr_model = None
        self.scaler = None
        self.label_encoders = {}
        self.rf_r2 = 0
        self.lr_r2 = 0
        self.best_model = ""
        
    def load_and_preprocess_data(self):
        """Load and preprocess student performance data"""
        np.random.seed(42)
        n_students = 1000
        
        # Create comprehensive synthetic student data
        data = {
            'student_id': [f'STU{i:04d}' for i in range(n_students)],
            'gender': np.random.choice(['male', 'female'], n_students),
            'parent_education': np.random.choice(['high school', 'some college', "associate's", "bachelor's", "master's"], n_students),
            'parent_income': np.random.choice(['low', 'middle', 'high'], n_students),
            'lunch': np.random.choice(['standard', 'free/reduced'], n_students),
            'test_prep': np.random.choice(['none', 'completed'], n_students),
            'math_score': np.random.randint(40, 100, n_students),
            'reading_score': np.random.randint(40, 100, n_students),
            'writing_score': np.random.randint(40, 100, n_students),
            'attendance': np.random.randint(70, 100, n_students),
            'hours_studied': np.random.randint(5, 40, n_students),
            'sleep_hours': np.random.randint(4, 10, n_students),
            'extracurricular': np.random.choice(['none', 'sports', 'arts', 'both'], n_students),
            'previous_performance': np.random.choice(['poor', 'average', 'good', 'excellent'], n_students),
            'study_group': np.random.choice([0, 1], n_students, p=[0.7, 0.3])
        }
        
        self.df = pd.DataFrame(data)
        
        # Calculate derived metrics
        self.df['total_score'] = self.df['math_score'] + self.df['reading_score'] + self.df['writing_score']
        self.df['average_score'] = self.df['total_score'] / 3
        
        return self.df
    
    def prepare_features(self):
        """Prepare features for regression models"""
        # Features to use
        categorical_cols = ['gender', 'parent_education', 'parent_income', 'lunch', 
                          'test_prep', 'extracurricular', 'previous_performance']
        numeric_cols = ['attendance', 'hours_studied', 'sleep_hours', 'study_group']
        
        # Encode categorical variables
        X_encoded = pd.DataFrame()
        for col in categorical_cols:
            le = LabelEncoder()
            X_encoded[col] = le.fit_transform(self.df[col])
            self.label_encoders[col] = le
        
        # Add numeric columns
        for col in numeric_cols:
            X_encoded[col] = self.df[col]
        
        # Target variable: average score
        y = self.df['average_score']
        
        return X_encoded, y

# ============================================================================
# 2. REGRESSION MODEL COMPARISON
# ============================================================================
class ModelComparisonSystem:
    def __init__(self, processor):
        self.processor = processor
        self.results = {}
        
    def train_linear_regression(self):
        """Train Linear Regression model"""
        X, y = self.processor.prepare_features()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        self.processor.scaler = StandardScaler()
        X_train_scaled = self.processor.scaler.fit_transform(X_train)
        X_test_scaled = self.processor.scaler.transform(X_test)
        
        # Train Linear Regression
        self.processor.lr_model = LinearRegression()
        
        # Cross-validation
        cv_scores = cross_val_score(self.processor.lr_model, X_train_scaled, y_train, 
                                   cv=5, scoring='r2')
        
        # Final training
        self.processor.lr_model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred = self.processor.lr_model.predict(X_test_scaled)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        self.results['linear_regression'] = {
            'model': self.processor.lr_model,
            'mae': mae,
            'mse': mse,
            'rmse': rmse,
            'r2': r2,
            'cv_scores': cv_scores,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'y_test': y_test,
            'y_pred': y_pred
        }
        
        self.processor.lr_r2 = r2
        return self.results['linear_regression']
    
    def train_random_forest(self):
        """Train Random Forest Regressor"""
        X, y = self.processor.prepare_features()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.processor.scaler.transform(X_train)
        X_test_scaled = self.processor.scaler.transform(X_test)
        
        # Train Random Forest
        self.processor.rf_model = RandomForestRegressor(
            n_estimators=100, 
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        # Cross-validation
        cv_scores = cross_val_score(self.processor.rf_model, X_train_scaled, y_train, 
                                   cv=5, scoring='r2')
        
        # Final training
        self.processor.rf_model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred = self.processor.rf_model.predict(X_test_scaled)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': self.processor.rf_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        self.results['random_forest'] = {
            'model': self.processor.rf_model,
            'mae': mae,
            'mse': mse,
            'rmse': rmse,
            'r2': r2,
            'cv_scores': cv_scores,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'feature_importance': feature_importance,
            'y_test': y_test,
            'y_pred': y_pred
        }
        
        self.processor.rf_r2 = r2
        return self.results['random_forest']
    
    def compare_models(self):
        """Compare both models and determine best performer"""
        # Train both models
        lr_results = self.train_linear_regression()
        rf_results = self.train_random_forest()
        
        # Compare R² scores
        r2_scores = {
            'Linear Regression': lr_results['r2'],
            'Random Forest': rf_results['r2']
        }
        
        # Compare RMSE scores
        rmse_scores = {
            'Linear Regression': lr_results['rmse'],
            'Random Forest': rf_results['rmse']
        }
        
        # Determine best model
        best_model_name = max(r2_scores, key=r2_scores.get)
        self.processor.best_model = best_model_name
        
        print("\n" + "="*60)
        print("MODEL COMPARISON: LINEAR REGRESSION vs RANDOM FOREST")
        print("="*60)
        print(f"Linear Regression:")
        print(f"  R² Score: {lr_results['r2']:.4f}")
        print(f"  RMSE: {lr_results['rmse']:.2f}")
        print(f"  MAE: {lr_results['mae']:.2f}")
        print(f"  CV R²: {lr_results['cv_mean']:.4f} (±{lr_results['cv_std']:.4f})")
        print()
        print(f"Random Forest:")
        print(f"  R² Score: {rf_results['r2']:.4f}")
        print(f"  RMSE: {rf_results['rmse']:.2f}")
        print(f"  MAE: {rf_results['mae']:.2f}")
        print(f"  CV R²: {rf_results['cv_mean']:.4f} (±{rf_results['cv_std']:.4f})")
        print()
        print(f"🏆 Best Model: {best_model_name} (Higher R² is better)")
        print("="*60)
        
        return {
            'r2_scores': r2_scores,
            'rmse_scores': rmse_scores,
            'best_model': best_model_name,
            'lr_results': lr_results,
            'rf_results': rf_results
        }

# ============================================================================
# 3. PREDICTION SYSTEM
# ============================================================================
class PredictionSystem:
    def __init__(self, processor, comparison_system):
        self.processor = processor
        self.comparison_system = comparison_system
        self.comparison_results = None
        
    def predict_student_score(self, student_data):
        """Predict student average score using both models"""
        # Prepare input
        X_input = self._prepare_input(student_data)
        
        # Get predictions from both models
        predictions = {}
        
        # 1. Linear Regression Prediction
        if self.processor.lr_model:
            lr_pred = self.processor.lr_model.predict(X_input)[0]
            predictions['linear_regression'] = {
                'predicted_score': lr_pred,
                'grade': self._get_grade(lr_pred)
            }
        
        # 2. Random Forest Prediction
        if self.processor.rf_model:
            rf_pred = self.processor.rf_model.predict(X_input)[0]
            predictions['random_forest'] = {
                'predicted_score': rf_pred,
                'grade': self._get_grade(rf_pred)
            }
        
        # Calculate consensus prediction (average of both)
        consensus_score = (predictions['linear_regression']['predicted_score'] + 
                          predictions['random_forest']['predicted_score']) / 2
        
        return {
            'individual_predictions': predictions,
            'consensus_score': consensus_score,
            'consensus_grade': self._get_grade(consensus_score)
        }
    
    def _prepare_input(self, student_data):
        """Prepare input for regression models"""
        categorical_cols = ['gender', 'parent_education', 'parent_income', 'lunch', 
                          'test_prep', 'extracurricular', 'previous_performance']
        numeric_cols = ['attendance', 'hours_studied', 'sleep_hours', 'study_group']
        
        input_df = pd.DataFrame([student_data])
        input_encoded = pd.DataFrame()
        
        # Encode categorical variables
        for col in categorical_cols:
            if col in student_data:
                if student_data[col] in self.processor.label_encoders[col].classes_:
                    input_encoded[col] = self.processor.label_encoders[col].transform([student_data[col]])
                else:
                    input_encoded[col] = 0
        
        # Add numeric columns
        for col in numeric_cols:
            if col in student_data:
                input_encoded[col] = student_data[col]
        
        # Scale features
        X_input_scaled = self.processor.scaler.transform(input_encoded)
        return X_input_scaled
    
    def _get_grade(self, score):
        """Convert score to letter grade"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"

# ============================================================================
# 4. VISUALIZATION
# ============================================================================
class VisualizationSystem:
    @staticmethod
    def create_comparison_visualization(comparison_results):
        """Create visualization comparing both models"""
        fig = plt.figure(figsize=(14, 8))
        
        # 1. R² Score Comparison
        ax1 = plt.subplot(2, 3, 1)
        models = list(comparison_results['r2_scores'].keys())
        r2_scores = list(comparison_results['r2_scores'].values())
        colors = ['#2E86AB', '#A23B72']
        bars = ax1.bar(models, r2_scores, color=colors)
        ax1.set_ylabel('R² Score')
        ax1.set_title('Model Performance (R² Score)')
        ax1.set_ylim([0, 1])
        
        # Add R² values on bars
        for bar, score in zip(bars, r2_scores):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height + 0.02,
                    f'{score:.3f}', ha='center', va='bottom')
        
        # 2. RMSE Comparison
        ax2 = plt.subplot(2, 3, 2)
        rmse_scores = list(comparison_results['rmse_scores'].values())
        bars = ax2.bar(models, rmse_scores, color=colors)
        ax2.set_ylabel('RMSE')
        ax2.set_title('Model Error (RMSE)')
        ax2.set_ylim([0, max(rmse_scores) * 1.2])
        
        # Add RMSE values on bars
        for bar, score in zip(bars, rmse_scores):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                    f'{score:.2f}', ha='center', va='bottom')
        
        # 3. Feature Importance (Random Forest)
        ax3 = plt.subplot(2, 3, 3)
        feature_importance = comparison_results['rf_results']['feature_importance'].head(10)
        ax3.barh(feature_importance['feature'], feature_importance['importance'])
        ax3.set_xlabel('Importance')
        ax3.set_title('Top 10 Features - Random Forest')
        ax3.invert_yaxis()
        
        # 4. Actual vs Predicted (Linear Regression)
        ax4 = plt.subplot(2, 3, 4)
        y_test_lr = comparison_results['lr_results']['y_test']
        y_pred_lr = comparison_results['lr_results']['y_pred']
        ax4.scatter(y_test_lr, y_pred_lr, alpha=0.5, color='#2E86AB')
        ax4.plot([y_test_lr.min(), y_test_lr.max()], 
                [y_test_lr.min(), y_test_lr.max()], 
                'r--', lw=2)
        ax4.set_xlabel('Actual Scores')
        ax4.set_ylabel('Predicted Scores')
        ax4.set_title('Linear Regression: Actual vs Predicted')
        
        # 5. Actual vs Predicted (Random Forest)
        ax5 = plt.subplot(2, 3, 5)
        y_test_rf = comparison_results['rf_results']['y_test']
        y_pred_rf = comparison_results['rf_results']['y_pred']
        ax5.scatter(y_test_rf, y_pred_rf, alpha=0.5, color='#A23B72')
        ax5.plot([y_test_rf.min(), y_test_rf.max()], 
                [y_test_rf.min(), y_test_rf.max()], 
                'r--', lw=2)
        ax5.set_xlabel('Actual Scores')
        ax5.set_ylabel('Predicted Scores')
        ax5.set_title('Random Forest: Actual vs Predicted')
        
        # 6. Cross-Validation Scores
        ax6 = plt.subplot(2, 3, 6)
        cv_lr = comparison_results['lr_results']['cv_scores']
        cv_rf = comparison_results['rf_results']['cv_scores']
        
        positions = [1, 2]
        box_data = [cv_lr, cv_rf]
        box = ax6.boxplot(box_data, positions=positions, patch_artist=True,
                         labels=['Linear\nRegression', 'Random\nForest'])
        
        # Set colors
        for patch, color in zip(box['boxes'], colors):
            patch.set_facecolor(color)
        
        ax6.set_ylabel('Cross-Validation R² Score')
        ax6.set_title('Cross-Validation Performance')
        ax6.set_ylim([0, 1])
        
        plt.tight_layout()
        
        # Save to bytes
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        plt.close()
        
        return buf
    
    @staticmethod
    def create_prediction_visualization(predictions, student_data):
        """Create visualization for student prediction"""
        fig = plt.figure(figsize=(12, 8))
        
        # 1. Model Predictions Comparison
        ax1 = plt.subplot(2, 2, 1)
        models = ['Linear Regression', 'Random Forest', 'Consensus']
        scores = [predictions['individual_predictions']['linear_regression']['predicted_score'],
                 predictions['individual_predictions']['random_forest']['predicted_score'],
                 predictions['consensus_score']]
        colors = ['#2E86AB', '#A23B72', '#4ECDC4']
        
        bars = ax1.bar(models, scores, color=colors)
        ax1.set_ylabel('Predicted Average Score')
        ax1.set_title('Model Predictions Comparison')
        ax1.set_ylim([0, 100])
        ax1.axhline(y=60, color='r', linestyle='--', alpha=0.5, label='Passing Threshold')
        ax1.legend()
        
        # Add score values on bars
        for bar, score in zip(bars, scores):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height + 2,
                    f'{score:.1f}', ha='center', va='bottom')
        
        # 2. Input Features Radar Chart (simplified)
        ax2 = plt.subplot(2, 2, 2)
        features = ['Attendance', 'Study Hours', 'Sleep Hours']
        values = [student_data.get('attendance', 0),
                 student_data.get('hours_studied', 0),
                 student_data.get('sleep_hours', 0)]
        
        # Normalize values for radar chart
        max_values = [100, 40, 10]
        normalized = [v/m for v, m in zip(values, max_values)]
        
        # Complete the circle
        angles = np.linspace(0, 2 * np.pi, len(features), endpoint=False).tolist()
        normalized += [normalized[0]]
        angles += [angles[0]]
        features_radar = features + [features[0]]
        
        ax2 = plt.subplot(2, 2, 2, polar=True)
        ax2.plot(angles, normalized, 'o-', linewidth=2)
        ax2.fill(angles, normalized, alpha=0.25)
        ax2.set_xticks(angles[:-1])
        ax2.set_xticklabels(features_radar[:-1])
        ax2.set_ylim([0, 1])
        ax2.set_title('Student Metrics (Normalized)', size=14, y=1.1)
        
        # 3. Score Distribution
        ax3 = plt.subplot(2, 2, 3)
        subject_scores = [student_data.get('math_score', 0),
                         student_data.get('reading_score', 0),
                         student_data.get('writing_score', 0)]
        subjects = ['Math', 'Reading', 'Writing']
        
        bars = ax3.bar(subjects, subject_scores, color=['#FF6B6B', '#4ECDC4', '#45B7D1'])
        ax3.set_ylabel('Score')
        ax3.set_title('Subject Scores')
        ax3.set_ylim([0, 100])
        ax3.axhline(y=60, color='r', linestyle='--', alpha=0.5)
        
        # Add score values on bars
        for bar, score in zip(bars, subject_scores):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height + 2,
                    f'{score}', ha='center', va='bottom')
        
        # 4. Grade Comparison
        ax4 = plt.subplot(2, 2, 4)
        grades = ['Linear\nRegression', 'Random\nForest', 'Consensus']
        grade_values = [predictions['individual_predictions']['linear_regression']['grade'],
                       predictions['individual_predictions']['random_forest']['grade'],
                       predictions['consensus_grade']]
        
        # Color mapping for grades
        grade_colors = {'A': '#4CAF50', 'B': '#8BC34A', 'C': '#FFC107', 
                       'D': '#FF9800', 'F': '#F44336'}
        
        colors = [grade_colors.get(g, '#999999') for g in grade_values]
        
        bars = ax4.bar(grades, [1, 1, 1], color=colors)
        ax4.set_ylim([0, 1.2])
        ax4.set_title('Predicted Grades')
        ax4.set_ylabel('Grade Level')
        
        # Add grade labels
        for bar, grade in zip(bars, grade_values):
            ax4.text(bar.get_x() + bar.get_width()/2., 0.5,
                    grade, ha='center', va='center', fontsize=20, fontweight='bold',
                    color='white')
        
        plt.tight_layout()
        
        # Save to bytes
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        plt.close()
        
        return buf

# ============================================================================
# 5. GRADIO INTERFACE - SIMPLIFIED
# ============================================================================
class GradioApp:
    def __init__(self):
        self.processor = StudentDataProcessor()
        self.comparison_system = ModelComparisonSystem(self.processor)
        self.prediction_system = None
        self.visualizer = VisualizationSystem()
        self.comparison_results = None
        
    def initialize_system(self):
        """Initialize the learning system"""
        print("="*70)
        print("📊 STUDENT SCORE PREDICTION SYSTEM")
        print("="*70)
        print("\n📈 Loading and preprocessing data...")
        
        # Load data
        self.processor.load_and_preprocess_data()
        
        print("🤖 Training regression models...")
        print("  • Linear Regression")
        print("  • Random Forest")
        
        # Train and compare models
        self.comparison_results = self.comparison_system.compare_models()
        
        # Initialize prediction system
        self.prediction_system = PredictionSystem(self.processor, self.comparison_system)
        
        print("\n✅ System initialization complete!")
        print(f"🏆 Best performing model: {self.processor.best_model}")
        print("="*70)
        
        return f"✅ System initialized! Best model: {self.processor.best_model}"
    
    def predict_student(self, gender, parent_education, parent_income, lunch, test_prep, 
                       extracurricular, previous_performance, study_group,
                       math_score, reading_score, writing_score, 
                       attendance, hours_studied, sleep_hours):
        """Predict student average score"""
        
        # Prepare student data
        student_data = {
            'gender': gender,
            'parent_education': parent_education,
            'parent_income': parent_income,
            'lunch': lunch,
            'test_prep': test_prep,
            'extracurricular': extracurricular,
            'previous_performance': previous_performance,
            'study_group': int(study_group),
            'attendance': attendance,
            'hours_studied': hours_studied,
            'sleep_hours': sleep_hours
        }
        
        # Get predictions
        predictions = self.prediction_system.predict_student_score(student_data)
        consensus = predictions['consensus_score']
        consensus_grade = predictions['consensus_grade']
        
        # Generate visualization
        viz_image = self.visualizer.create_prediction_visualization(predictions, student_data)
        
        # Create HTML report
        html_report = self._create_html_report(student_data, predictions, math_score, 
                                              reading_score, writing_score)
        
        return html_report, viz_image
    
    def _create_html_report(self, student_data, predictions, math, reading, writing):
        """Create HTML report for display"""
        
        lr_pred = predictions['individual_predictions']['linear_regression']['predicted_score']
        rf_pred = predictions['individual_predictions']['random_forest']['predicted_score']
        consensus = predictions['consensus_score']
        consensus_grade = predictions['consensus_grade']
        
        lr_grade = predictions['individual_predictions']['linear_regression']['grade']
        rf_grade = predictions['individual_predictions']['random_forest']['grade']
        
        avg_subject = (math + reading + writing) / 3
        avg_diff = consensus - avg_subject
        
        # Determine performance trend
        if avg_diff > 5:
            trend = "📈 Likely to improve"
            trend_color = "#4CAF50"
        elif avg_diff < -5:
            trend = "📉 Likely to decline"
            trend_color = "#F44336"
        else:
            trend = "➡️ Likely to stay similar"
            trend_color = "#FF9800"
        
        # Create HTML
        html = f"""
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; border: 2px solid #2E86AB; margin-bottom: 20px;">
                <h2 style="color: #2E86AB; margin-top: 0;">📊 Student Performance Prediction</h2>
                
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
                    <div style="flex: 1; min-width: 250px; background: white; padding: 15px; border-radius: 5px;">
                        <h3 style="margin-top: 0; color: #2E86AB;">🎯 Consensus Prediction</h3>
                        <p style="font-size: 28px; font-weight: bold; color: {'#4CAF50' if consensus >= 70 else '#F44336'};">
                            {consensus:.1f}/100
                        </p>
                        <p style="font-size: 20px; font-weight: bold; color: {'#4CAF50' if consensus >= 70 else '#F44336'};">
                            Grade: {consensus_grade}
                        </p>
                        <p><strong>Performance Trend:</strong> <span style="color: {trend_color};">{trend}</span></p>
                        <p><em>Compared to current average: {avg_subject:.1f}/100 ({avg_diff:+.1f})</em></p>
                    </div>
                    
                    <div style="flex: 1; min-width: 250px; background: white; padding: 15px; border-radius: 5px;">
                        <h3 style="margin-top: 0; color: #2E86AB;">🤖 Model Predictions</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="background: #e8f4f8; padding: 10px; border-radius: 5px;">
                                <strong>Linear Regression</strong><br>
                                {lr_pred:.1f}/100<br>
                                <strong>Grade: {lr_grade}</strong>
                            </div>
                            <div style="background: #e8f4f8; padding: 10px; border-radius: 5px;">
                                <strong>Random Forest</strong><br>
                                {rf_pred:.1f}/100<br>
                                <strong>Grade: {rf_grade}</strong>
                            </div>
                        </div>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                            <em>Consensus: Average of both models</em>
                        </p>
                    </div>
                </div>
            </div>
            
            <div style="background: #fff8e1; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #2E86AB; margin-top: 0;">📚 Current Subject Performance</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="background: {'#ffebee' if math < 60 else '#e8f5e9'}; padding: 15px; border-radius: 5px; text-align: center;">
                        <strong>Math</strong><br>
                        <span style="font-size: 24px; font-weight: bold;">{math}/100</span><br>
                        <span style="color: {'#c62828' if math < 60 else '#2e7d32'};">
                            {'⚠️ Needs Improvement' if math < 60 else '✅ Good'}
                        </span>
                    </div>
                    <div style="background: {'#ffebee' if reading < 60 else '#e8f5e9'}; padding: 15px; border-radius: 5px; text-align: center;">
                        <strong>Reading</strong><br>
                        <span style="font-size: 24px; font-weight: bold;">{reading}/100</span><br>
                        <span style="color: {'#c62828' if reading < 60 else '#2e7d32'};">
                            {'⚠️ Needs Improvement' if reading < 60 else '✅ Good'}
                        </span>
                    </div>
                    <div style="background: {'#ffebee' if writing < 60 else '#e8f5e9'}; padding: 15px; border-radius: 5px; text-align: center;">
                        <strong>Writing</strong><br>
                        <span style="font-size: 24px; font-weight: bold;">{writing}/100</span><br>
                        <span style="color: {'#c62828' if writing < 60 else '#2e7d32'};">
                            {'⚠️ Needs Improvement' if writing < 60 else '✅ Good'}
                        </span>
                    </div>
                </div>
                <p style="margin-top: 10px; text-align: center;">
                    <strong>Current Average: {avg_subject:.1f}/100</strong>
                </p>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #2E86AB; margin-top: 0;">🎯 Recommendations</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
        """
        
        recommendations = []
        if consensus < 70:
            recommendations.append("📚 <strong>Academic Support:</strong> Consider tutoring or study groups")
            if student_data['hours_studied'] < 15:
                recommendations.append("⏰ <strong>Study Time:</strong> Increase to 15-20 hours per week")
            if student_data['attendance'] < 80:
                recommendations.append("✅ <strong>Attendance:</strong> Aim for 90%+ attendance")
        else:
            recommendations.append("🌟 <strong>Maintain Performance:</strong> Current study habits are effective")
            if consensus >= 85:
                recommendations.append("💡 <strong>Advanced Work:</strong> Consider honors or advanced courses")
        
        if student_data['sleep_hours'] < 7:
            recommendations.append("😴 <strong>Sleep:</strong> Aim for 7-8 hours for optimal performance")
        
        for rec in recommendations:
            html += f"""
                    <div style="background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #2E86AB;">
                        {rec}
                    </div>
            """
        
        html += f"""
                </div>
            </div>
            
            <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; font-size: 0.9em; color: #666;">
                <p><strong>📊 System Information:</strong></p>
                <p>• Models: Linear Regression & Random Forest Regressor</p>
                <p>• Best Model: {self.processor.best_model}</p>
                <p>• Linear Regression R²: {self.processor.lr_r2:.3f}</p>
                <p>• Random Forest R²: {self.processor.rf_r2:.3f}</p>
                <p>• Prediction Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
        </div>
        """
        
        return html
    
    def get_model_comparison(self):
        """Get model comparison visualization"""
        if self.comparison_results:
            viz_image = self.visualizer.create_comparison_visualization(self.comparison_results)
            
            # Create comparison summary
            summary_html = f"""
            <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h3 style="margin-top: 0; color: #2E86AB;">🏆 Model Performance Summary</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6;">
                        <h4 style="margin-top: 0; color: #2E86AB;">Linear Regression</h4>
                        <p><strong>R² Score:</strong> {self.comparison_results['lr_results']['r2']:.3f}</p>
                        <p><strong>RMSE:</strong> {self.comparison_results['lr_results']['rmse']:.2f}</p>
                        <p><strong>MAE:</strong> {self.comparison_results['lr_results']['mae']:.2f}</p>
                       