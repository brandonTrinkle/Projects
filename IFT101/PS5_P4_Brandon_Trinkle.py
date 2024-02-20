'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS5
Problem: P4
Date: 11/9/2023
'''

def calculate_backup_size(data_size, backup_frequency):
    return data_size * backup_frequency

def calculate_storage_cost(backup_size, cost_per_gb):
    return backup_size * cost_per_gb

def storage_info(data_size, backup_frequency, cost_per_gb, weeks):
    backup_size = calculate_backup_size(data_size, backup_frequency)
    total_cost = calculate_storage_cost(backup_size, cost_per_gb) * weeks
    return f"The total storage needed for backup is {backup_size} GB and the total cost for {weeks} weeks is ${total_cost:,.2f} dollars"

def get_user_input(prompt):
    value = -1
    while value <= 0:
        try:
            value = float(input(prompt))
            if value <= 0:
                print("Please enter a positive number.")
        except ValueError:
            print("Invalid input. Please enter a number.")
    return value

data_size = get_user_input("Enter the size of data in GB: ")
backup_frequency = get_user_input("Enter the backup frequency per week: ")
cost_per_gb = get_user_input("Enter cost per GB ($): ")
weeks = get_user_input("Enter number of weeks: ")

print(storage_info(data_size, backup_frequency, cost_per_gb, weeks))
