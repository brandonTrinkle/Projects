'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS5
Problem: P3
Date: 11/9/2023
'''
import csv

# Age input
def validate_age(age):
    try:
        if int(age) > 0:
            return True
        else:
            return False
    except ValueError:
        return False

# User input
name = input("Please enter your name: ")
age = input("Please enter your age: ")
while not validate_age(age):
    print("Invalid age. Please enter a positive integer.")
    age = input("Enter your age: ")
email = input("Enter your email: ")

# Write to CSV file
try:
    with open('user_info.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([name, age, email])
except IOError:
    print("IOError: Unable to write to file.")

# Read data back
try:
    with open('user_info.csv', 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            print(row)
except FileNotFoundError:
    print("FileNotFoundError: Unable to find file.")
except IOError:
    print("IOError: Unable to read from file.")