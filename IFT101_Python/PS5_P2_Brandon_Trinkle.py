'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS5
Problem: P2
Date: 11/9/2023
'''

# Import os since we are working with files
import os

# Ask user for the name of a file to append to
file_name = input("Enter the name of a file to append to: ")

# Check if the file exists in the directory
if not os.path.isfile(file_name):
    print("The file does not exist. Creating a new file.")
    
# Ask user to enter a sentence
user_sentence = input("Enter a sentence: ")

# Open the file in append mode
with open(file_name, 'a') as file:
    # Write the user's sentence to the file
    file.write(user_sentence + "\n")

# Open the file in read mode
with open(file_name, 'r') as file:
    # Read the contents of the file line by line
    file_contents = file.readlines()

# Print the complete file contents to the console
print("The contents of the file is now: \n")
for line in file_contents:
    print(line, end='')