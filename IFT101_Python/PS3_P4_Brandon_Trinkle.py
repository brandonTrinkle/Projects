'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS3
Problem: P4
Date: 10/27/2023
'''
print("Lets find prime numbers!\n")

upper_limit = int(input("Enter upper limit: "))

for num in range(2, upper_limit + 1):
    is_prime = True

    for i in range(2, num):
        if (num % i) == 0:
            is_prime = False
            break

    if is_prime:
        print(num)