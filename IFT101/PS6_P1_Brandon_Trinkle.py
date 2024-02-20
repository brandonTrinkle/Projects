'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS6
Problem: P1
Date: 11/17/2023
'''

class Employee:
    def __init__(self, name, employee_id, department, position):
        # Initialize the attributes
        self.name = name
        self.employee_id = employee_id
        self.department = department
        self.position = position

    def get_details(self):
        # Print the details of the employee
        print(f"Name: {self.name}, ID: {self.employee_id}, Department: {self.department}, Position: {self.position}")

class EmployeeManagement:
    def __init__(self):
        # Initialize an empty list of employees
        self.employees = []

    def add_employee(self, employee):
        # Add an employee to the list
        self.employees.append(employee)

    def remove_employee(self, employee_id):
        # Remove an employee from the list by ID
        self.employees.remove(employee_id)

    def display_all_employees(self):
        # Display all employees
        for e in self.employees:
            e.get_details()

# Demonstrate the functionality
emp1 = Employee("John", "001", "IT", "Software Engineer")
emp2 = Employee("Sarah", "002", "HR", "HR Manager")


manager = EmployeeManagement()
print("Employee John has been added")
print("Employee Sarah has been added")
manager.add_employee(emp1)
manager.add_employee(emp2)


manager.display_all_employees()

manager.remove_employee(emp1)
print("Employee John has been removed.")

manager.display_all_employees()