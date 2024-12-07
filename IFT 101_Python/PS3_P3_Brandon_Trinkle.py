'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS3
Problem: P3
Date: 10/27/2023
'''
continue_program = 'y'

while continue_program.lower() == 'y':
    num = int(input("\nEnter a number: "))
    if num % 3 == 0 and num % 5 == 0:
        print("BingoDingo\n")
    elif num % 3 == 0:
        print("Bingo\n")
    elif num % 5 == 0:
        print("Dingo\n")
    else:
        print(num, "\n")
    continue_program = input("Do you want to continue? (y/n) ")

