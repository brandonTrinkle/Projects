'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS3
Problem: P2
Date: 10/27/2023
'''
try_again = "y"

while try_again.lower() == "y":
    word = input("\nEnter a word to check if it is a palindrome: ")
    reversed_word = word[::-1]

    if word == reversed_word:
        print("Yes," , word , "is a palindrome.\n")
    else:
        print("No," , word , "is not a palindrome.\n")

    try_again = input("Do you want to try again? (y/n): ")
    if try_again != "y":
        print("\nThank you for using my palindrome checker!")