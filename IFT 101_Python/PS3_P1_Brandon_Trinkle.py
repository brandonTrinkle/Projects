'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS3
Problem: P1
Date: 10/27/2023
'''

#need to input an integer 
n = int(input("Please enter a positive integer: "))
#range does not include the input numer, add 1 to include the input number
for i in range(1, (n + 1)):
    #invalid syntax - need to rewrite the statement to have solution first - also needs two equal signs 
    if 0 == i % 2:
        print(i, "is even.")
    else:
        print(i, "is odd.")