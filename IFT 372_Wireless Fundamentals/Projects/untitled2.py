# -*- coding: utf-8 -*-
"""
Created on Sun Oct  6 15:21:31 2024

@author: Btrin
"""
import pandas as pd

# Load the original dataset
file_path = 'C://Users//Btrin//OneDrive//Desktop//IFT 360//Final Project//pbp-2023.csv'  # Replace with the actual path to your CSV file
df = pd.read_csv(file_path)

# Filter relevant columns for predicting rush vs pass
df_filtered = df[['OffenseTeam', 'DefenseTeam', 'Down', 'ToGo', 'Quarter', 'Minute', 'PlayType']]

# Convert PlayType to binary values for Rush (1) and Pass (0)
df_filtered['PlayType'] = df_filtered['PlayType'].apply(lambda x: 1 if x == 'RUSH' else 0)

# Drop any rows with missing values
df_filtered = df_filtered.dropna()

# Convert categorical columns (OffenseTeam, DefenseTeam) to numerical values using one-hot encoding
df_encoded = pd.get_dummies(df_filtered, columns=['OffenseTeam', 'DefenseTeam'])

# Save the cleaned data to a new CSV file
df_encoded.to_csv('C://Users//Btrin//OneDrive//Desktop//IFT 360//Final Project//cleaned_football_data.csv', index=False)

print("Data cleaning complete. Cleaned data saved to 'cleaned_football_data.csv'.")