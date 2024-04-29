'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS5
Problem: P1
Date: 11/9/2023
'''

# Function to perform safe division
def safe_division(num1, num2):
    try:
        result = num1 / num2
        return result
    except ValueError:
        return "Invalid input. Please enter valid numbers."
    except ZeroDivisionError:
        return "Division by zero is not allowed."

# Main program
while True:
    try:
        # Prompt the user to enter two numbers
        num1 = input("\nEnter the first number: ")
        num2 = input("Enter the second number: ")

        # Try to convert the input to float
        num1 = float(num1)
        num2 = float(num2)

        # Call the safe_division function
        result = safe_division(num1, num2)

        # Print the result
        print(f"Result of division: {result}\n")

        # Ask the user if they want to continue
        choice = input("Do you want to continue? (y/n): ").lower()
        if choice != "y":
            print("Program terminated.")
            break
    except ValueError:
        print("Invalid input. Please enter valid numbers.")
    except ZeroDivisionError:
        print("Division by zero is not allowed.")
    except KeyboardInterrupt:
        # Handle Ctrl+C to exit the program
        print("Program terminated.")
        break