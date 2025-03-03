# -*- coding: utf-8 -*-
"""
Author: Brandon Trinkle
Class: IFT: 360
Professor: Durgesh Sharma
Date: 9/29/24

"""

import pandas as pd
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

df = pd.read_csv("C:\\Users\\Btrin\\OneDrive\\Desktop\\IFT 360\\Lab 8\\diabetes.csv")  # Adjust the path if necessary
print("Dataset columns:", df.columns.tolist())

x_columns = df.columns.tolist()
x_columns.pop()  # Remove the 'Outcome' column
df[x_columns] = df[x_columns] / df[x_columns].max()  # Normalize features
X = df[x_columns].values

y_column = ['Outcome']
y = df[y_column].values.ravel()  # Flatten the array for use with scikit-learn

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=40)

# Initialize a list to store the results
results = []

mlp = MLPClassifier(hidden_layer_sizes=(3,4,5,6,7,8,9), activation='relu', solver='adam', max_iter=500)
mlp.fit(X_train,y_train)

predict_test = mlp.predict(X_test)
test_accuracy = accuracy_score(y_test, predict_test)*100
print("Accuracy on training data = %.2f" %test_accuracy)