# -*- coding: utf-8 -*-
"""
Created on Sun Sep 22 10:19:33 2024

@author: Btrin
"""

from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_svmlight_file
from sklearn import metrics 

print("Loading Dataset...")
X_train,y_train = load_svmlight_file("colon_cancer_train_1.libsvm")
X_test,y_test = load_svmlight_file("colon_cancer_all.libsvm")

print("Creating a Decision Tree Object... ")
classifier = DecisionTreeClassifier()

print("Building the Decision Tree (DT)... ")
classifier = classifier.fit(X_train, y_train)

print("Using the DT Classifier to Diagnose Some Patients...")
y_pred = classifier.predict(X_test)

print("Accuracy of patient classification:")
print( "%.2f" %(metrics.accuracy_score(y_test, y_pred)*100),"%" )