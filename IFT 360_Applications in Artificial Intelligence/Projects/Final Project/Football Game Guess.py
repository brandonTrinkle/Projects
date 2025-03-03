# -*- coding: utf-8 -*-
"""
Author: Brandon Trinkle
Class: IFT 360
Professor Durgesh Sharma
"""

import pandas as pd
import re
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
import optuna

# Load the dataset
file_path = 'C://Users//Btrin//OneDrive//Desktop//IFT 360//Final Project//pbp-2023.csv'
data = pd.read_csv(file_path)

# Define team abbreviations map
team_abbreviations = {
    'ARI': 'Arizona Cardinals',
    'ATL': 'Atlanta Falcons',
    'BAL': 'Baltimore Ravens',
    'BUF': 'Buffalo Bills',
    'CAR': 'Carolina Panthers',
    'CHI': 'Chicago Bears',
    'CIN': 'Cincinnati Bengals',
    'CLE': 'Cleveland Browns',
    'DAL': 'Dallas Cowboys',
    'DEN': 'Denver Broncos',
    'DET': 'Detroit Lions',
    'GB': 'Green Bay Packers',
    'HOU': 'Houston Texans',
    'IND': 'Indianapolis Colts',
    'JAX': 'Jacksonville Jaguars',
    'KC': 'Kansas City Chiefs',
    'LV': 'Las Vegas Raiders',
    'LAC': 'Los Angeles Chargers',
    'LAR': 'Los Angeles Rams',
    'MIA': 'Miami Dolphins',
    'MIN': 'Minnesota Vikings',
    'NE': 'New England Patriots',
    'NO': 'New Orleans Saints',
    'NYG': 'New York Giants',
    'NYJ': 'New York Jets',
    'PHI': 'Philadelphia Eagles',
    'PIT': 'Pittsburgh Steelers',
    'SF': 'San Francisco 49ers',
    'SEA': 'Seattle Seahawks',
    'TB': 'Tampa Bay Buccaneers',
    'TEN': 'Tennessee Titans',
    'WAS': 'Washington Commanders'
}

# Extract new features from the 'Description' column
def extract_play_features(description):
    is_pass_completed = 0
    rush_direction = None
    yards_gained = 0
    passer = None
    receiver = None
    rusher = None
    is_intercepted = 0
    is_fumble = 0
    kicker = None

    # Check if the pass was completed and extract passer and receiver
    pass_match = re.search(r"(\d{1,2}-[A-Z]\.[A-Za-z]+) PASS .*? TO (\d{1,2}-[A-Z]\.[A-Za-z]+)", description)
    if pass_match:
        passer = pass_match.group(1)
        receiver = pass_match.group(2)
        if "COMPLETE" in description:
            is_pass_completed = 1
        if "INTERCEPTED" in description:
            is_intercepted = 1

    # Extract rusher if it's a rush play
    rush_match = re.search(r"(\d{1,2}-[A-Z]\.[A-Za-z]+) .*?(UP THE MIDDLE|LEFT|RIGHT)", description)
    if rush_match:
        rusher = rush_match.group(1)
        rush_direction = rush_match.group(2)

    # Extract yards gained
    yards_match = re.search(r"(\d+)\s+YARD", description)
    if yards_match:
        yards_gained = int(yards_match.group(1))

    # Extract kicker if it's a field goal
    kicker_match = re.search(r"(\d{1,2}-[A-Z]\.[A-Za-z]+) .*?FIELD GOAL", description)
    if kicker_match:
        kicker = kicker_match.group(1)
    
    # Extract fumble information
    if "FUMBLE" in description:
        is_fumble = 1
    
    return is_pass_completed, rush_direction, yards_gained, passer, receiver, rusher, is_intercepted, is_fumble, kicker

# Apply the function
data[['IsPassCompleted', 'RushDirection', 'YardsGained', 'Passer', 'Receiver', 'Rusher', 'IsIntercepted', 'IsFumble', 'Kicker']] = data['Description'].apply(lambda x: pd.Series(extract_play_features(str(x))))

# Score differential feature
if 'ScoreDifferential' not in data.columns:
    data['ScoreDifferential'] = data.get('OffenseScore', 0) - data.get('DefenseScore', 0)  # Placeholder feature, calculate difference if scores available  # Placeholder feature
# Field position feature representing the distance to the end zone
if 'FieldPosition' not in data.columns:
    if 'YardLine' in data.columns:
        data['FieldPosition'] = data['YardLine']
    else:
        data['FieldPosition'] = 50  # Default value for field position if not available  
        
# Remaining time as a feature calculated from minute and second columns
if 'RemainingTime' not in data.columns:
    if 'Minute' in data.columns and 'Second' in data.columns:
        data['RemainingTime'] = data['Minute'] * 60 + data['Second']  # Calculate remaining time in seconds
    else:
        data['RemainingTime'] = 0  # Default value for remaining time if not available  # Calculate remaining time in seconds

# Prepare features and target variable
rush_direction_dummies = pd.get_dummies(data['RushDirection'], prefix='RushDirection')
passer_dummies = pd.get_dummies(data['Passer'], prefix='Passer')
receiver_dummies = pd.get_dummies(data['Receiver'], prefix='Receiver')
rusher_dummies = pd.get_dummies(data['Rusher'], prefix='Rusher')
kicker_dummies = pd.get_dummies(data['Kicker'], prefix='Kicker')

# Add score differential
data = pd.concat([data, rush_direction_dummies, passer_dummies, receiver_dummies, rusher_dummies, kicker_dummies], axis=1)

# Drop unnecessary columns for model training
X = data.drop(columns=['Description', 'RushDirection', 'PlayType', 'GameId', 'GameDate', 'Passer', 'Receiver', 'Rusher', 'Kicker', 'Minute', 'Second'])
y = data['PlayType'].apply(lambda x: 0 if x == 'RUSH' else (1 if x == 'PASS' else (2 if x == 'PUNT' else 3)))

# Convert boolean columns to integers and handle non-numeric values
X = X.apply(pd.to_numeric, errors='coerce').fillna(0)

# Ensure target variable has no NaN values
y = y.fillna(0).astype(int)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize the numerical features
scaler = StandardScaler()
X_train[['Down', 'ToGo', 'YardsGained', 'ScoreDifferential', 'FieldPosition', 'RemainingTime']] = scaler.fit_transform(X_train[['Down', 'ToGo', 'YardsGained', 'ScoreDifferential', 'FieldPosition', 'RemainingTime']])
X_test[['Down', 'ToGo', 'YardsGained', 'ScoreDifferential', 'FieldPosition', 'RemainingTime']] = scaler.transform(X_test[['Down', 'ToGo', 'YardsGained', 'ScoreDifferential', 'FieldPosition', 'RemainingTime']])

# Hyperparameter Tuning for XGBoost Model
def objective(trial):
    param = {
        'objective': 'multi:softmax',
        'num_class': 5,
        'n_estimators': trial.suggest_int('n_estimators', 100, 1500),
        'max_depth': trial.suggest_int('max_depth', 5, 30),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.1, log=True),
        'subsample': trial.suggest_float('subsample', 0.5, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.5, 1.0)
    }
    model = XGBClassifier(**param)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    return accuracy_score(y_test, y_pred)

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=1)

best_params = study.best_params
best_model = XGBClassifier(**best_params)
best_model.fit(X_train, y_train)

# Test the model's accuracy with the best parameters
y_pred = best_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Display classification report
classification_rep = classification_report(y_test, y_pred)
print(classification_rep)

# Function to make predictions based on user input
def predict_play_scenario():
    while True:
        offense_team = input("Enter the offensive team (e.g., BUF, KC, SF, etc.): ").upper()
        if offense_team in team_abbreviations:
            break
        else:
            print("Invalid team abbreviation. Please try again.")

    while True:
        defense_team = input("Enter the defensive team (e.g., BUF, KC, SF, etc.): ").upper()
        if defense_team in team_abbreviations:
            break
        else:
            print("Invalid team abbreviation. Please try again.")

    quarter = int(input("Enter the quarter (1-4): "))
    minute = int(input("Enter the minute left in the quarter (0-15): "))
    second = int(input("Enter the seconds left in the minute (0-59): "))
    down = int(input("Enter the current down (1-4): "))
    to_go = int(input("Enter yards to go for a first down: "))
    yard_line = int(input("Enter the distance to the opposing team's end zone (in yards): "))
    score_differential = int(input("Enter the score differential (positive if leading, negative if trailing): "))

    # Create a DataFrame for the input data
    user_data = {
        'Down': [down],
        'ToGo': [to_go],
        'YardsGained': [0],  # Start with 0 expected yards gained
        'ScoreDifferential': [score_differential],
        'FieldPosition': [yard_line],
        'RemainingTime': [minute * 60 + second],
        'RushDirection_LEFT': [0],
        'RushDirection_RIGHT': [0],
        'RushDirection_UP THE MIDDLE': [0]
    }

    # Add passer, receiver, rusher, kicker, and defense team columns dynamically
    for col in X.columns:
        if col.startswith('Passer_') or col.startswith('Receiver_') or col.startswith('Rusher_') or col.startswith('Kicker_') or col.startswith('DefenseTeam_'):
            user_data[col] = [1 if col == f'Passer_{offense_team}' or col == f'Receiver_{offense_team}' or col == f'Rusher_{offense_team}' or col == f'Kicker_{offense_team}' or col == f'DefenseTeam_{defense_team}' else 0]

    user_df = pd.DataFrame(user_data)

    for col in X.columns:
        if col not in user_df.columns:
            user_df[col] = 0

    # Reorder columns to match training data
    user_df = user_df[X.columns]

    # Ensure numerical features are standardized
    user_df[['Down', 'ToGo', 'YardsGained', 'ScoreDifferential', 'FieldPosition', 'RemainingTime']] = scaler.transform(user_df[['Down', 'ToGo', 'YardsGained', 'ScoreDifferential', 'FieldPosition', 'RemainingTime']])

    # Make prediction
    prediction = best_model.predict(user_df)[0]

    # Preventing unrealistic predictions
    if prediction == 3 and (down < 4 or quarter < 4):
        # If it's not 4th down or not late in the game, do not kick a field goal
        prediction = 1 if to_go <= 10 else 0  # Prefer a pass if short distance, otherwise a rush
    play_types = {0: 'RUSH', 1: 'PASS', 2: 'PUNT', 3: 'FIELD GOAL'}
    if prediction == 0:
        rusher = data.loc[data['Rusher'].notna() & (data['OffenseTeam'] == offense_team), 'Rusher'].sample().values[0] if offense_team in data['OffenseTeam'].values else 'Unknown Rusher'
        conversion_chance = 0.4  # Average 3rd down conversion rate is around 40%
        yards_gained = to_go if np.random.rand() < conversion_chance else int(to_go * np.random.rand() * 0.5)  # 40% chance to get the first down, otherwise gain between 0-50% of to_go
        outcome = f"{team_abbreviations[offense_team]}'s running back {rusher} runs for {yards_gained} yards."
    elif prediction == 1:
        passer = data.loc[data['Passer'].notna() & (data['OffenseTeam'] == offense_team), 'Passer'].sample().values[0] if offense_team in data['OffenseTeam'].values else 'Unknown Quarterback'
        receiver = data.loc[data['Receiver'].notna() & (data['OffenseTeam'] == offense_team), 'Receiver'].sample().values[0] if offense_team in data['OffenseTeam'].values else 'Unknown Receiver'
        yards_gained = int(max(1, to_go * 0.5 + (to_go * 0.5 * np.random.rand())))  # Randomly predict between 50% to 100% of yards to go
        outcome = f"{team_abbreviations[offense_team]}'s quarterback {passer} passes to {receiver} for {yards_gained} yards."
    else:
        outcome = f"Predicted play type: {play_types[prediction]}"

    print(f"Outcome: {outcome}")

while True:
    predict_play_scenario()
    repeat = input("Would you like to run another play simulation? (yes/no): ").strip().lower()
    if repeat != 'yes':
        break