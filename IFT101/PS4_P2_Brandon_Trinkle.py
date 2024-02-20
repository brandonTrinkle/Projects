'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS4
Problem: P2
Date: 11/3/2023
'''

user_input = input("Please enter integers separated by commas: ")

int_list = [int(i) for i in user_input.split(',')]

i = 0
sum_while = 0
while i < len(int_list):
    sum_while += int_list[i]
    i += 1

print('Sum using while loop: ', sum_while)

sum_for = 0
for num in int_list:
    sum_for += num

print('Sum using for loop: ', sum_for)