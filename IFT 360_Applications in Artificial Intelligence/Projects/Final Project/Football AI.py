# -*- coding: utf-8 -*-
"""
Created on Sun Oct  6 14:32:56 2024

@author: Btrin
"""

import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier, plot_importance
import matplotlib.pyplot as plt

# Load the cleaned data
data = pd.read_csv('C://Users//Btrin//OneDrive//Desktop//IFT 360//Final Project//cleaned_football_data.csv')

# Add interaction feature and game context
data['Down_ToGo'] = data['Down'] * data['ToGo']
data['TimeLeft_Percent'] = data['Minute'] / 15  # Percent of the quarter remaining

# Prepare features and target variable
X = data.drop(columns='PlayType')
y = data['PlayType']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Hyperparameter tuning with Grid Search
param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [3, 5, 7],
    'learning_rate': [0.01, 0.1]
}
grid_search = GridSearchCV(XGBClassifier(random_state=42, eval_metric='logloss'), param_grid, cv=5)
grid_search.fit(X_train, y_train)

# Use the best model from grid search
best_model = grid_search.best_estimator_

# Test the best model's accuracy
y_pred = best_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"XGBoost Model Accuracy after Tuning: {accuracy * 100:.2f}%")

# Cross-validation accuracy
cv_scores = cross_val_score(best_model, X, y, cv=5)
print(f"Cross-Validation Accuracy: {cv_scores.mean() * 100:.2f}%")

# Plot feature importance to visualize the impact of different features
plot_importance(best_model)
plt.show()

# Function to take user input and make predictions using XGBoost
def predict_play():
    # Get available team names from the training data
    offense_teams = [col for col in X.columns if 'OffenseTeam_' in col]
    defense_teams = [col for col in X.columns if 'DefenseTeam_' in col]
    
    # Prepare valid team names for user input
    valid_offense_teams = [team.split('_')[1] for team in offense_teams]
    valid_defense_teams = [team.split('_')[1] for team in defense_teams]
    
    # Get user inputs for the situation
    print(f"Available Offensive Teams: {valid_offense_teams}")
    offense_team = input("Enter the offensive team: ")
    
    while offense_team not in valid_offense_teams:
        offense_team = input(f"Invalid team! Enter one of these teams: {valid_offense_teams}: ")
    
    print(f"Available Defensive Teams: {valid_defense_teams}")
    defense_team = input("Enter the defensive team: ")
    
    while defense_team not in valid_defense_teams:
        defense_team = input(f"Invalid team! Enter one of these teams: {valid_defense_teams}: ")
    
    down = int(input("Enter the current down (1-4): "))
    to_go = int(input("Enter yards to go: "))
    quarter = int(input("Enter the quarter (1-4): "))
    
    # Handle time input as MM:SS
    time_left = input("Enter the minute left in the quarter (MM:SS): ")
    minutes, seconds = map(int, time_left.split(':'))
    total_minutes = minutes + seconds / 60  # Convert to total minutes
    time_left_percent = total_minutes / 15  # Percentage of quarter left
    
    yard_line = int(input("Enter the yard line (distance from the opponent's goal): "))
    
    # Add custom rule handling: Field Goal or Punt decision
    if down == 4:
        if yard_line <= 40 and to_go <= 5:  # Close to the goal and manageable distance
            print("The AI predicts the play will be a FIELD GOAL.")
            return
        elif yard_line > 40 and to_go > 5:  # Far from the goal with long yardage
            print("The AI predicts the play will be a PUNT.")
            return
    
    # Add custom rule handling: Passing on 3rd and long late in the game
    if down == 3 and to_go >= 5 and quarter == 4 and time_left_percent <= 0.2:
        print("The AI predicts the play will be a PASS based on the situation (3rd and long, 4th quarter).")
        return
    
    # Extreme cases handling: 4th and long situations
    if down == 4 and to_go >= 20:
        print("The AI predicts the play will be a PUNT.")
        return
    
    # Convert user input into a DataFrame
    user_data = {
        'Down': [down],
        'ToGo': [to_go],
        'Quarter': [quarter],
        'Minute': [total_minutes],
        'TimeLeft_Percent': [time_left_percent],  # Add percentage of time left in quarter
        f'OffenseTeam_{offense_team}': [1],
        f'DefenseTeam_{defense_team}': [1]
    }
    
    # Ensure all other teams not selected by the user are set to 0
    for col in X.columns:
        if col not in user_data:
            user_data[col] = [0]
    
    # Convert to DataFrame and ensure columns match training data order
    user_df = pd.DataFrame(user_data)
    user_df = user_df[X.columns]  # Reorder columns to match training features

    # Make prediction using the improved XGBoost model
    prediction = best_model.predict(user_df)[0]
    
    if prediction == 1:
        print("The AI predicts the play will be a RUSH.")
    else:
        print("The AI predicts the play will be a PASS.")

# Call the prediction function
predict_play()