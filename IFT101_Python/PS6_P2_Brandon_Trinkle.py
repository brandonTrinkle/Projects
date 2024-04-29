'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS6
Problem: P2
Date: 11/17/2023
'''

import datetime

class Vehicle:
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year

    def display_info(self):
        print(f"Make: {self.make}\nModel: {self.model}\nYear: {self.year}")

    def get_age(self):
        current_year = datetime.datetime.now().year
        return current_year - self.year

class Truck(Vehicle):
    def __init__(self, make, model, year, max_load):
        super().__init__(make, model, year)
        self.max_load = max_load

    def display_info(self):
        super().display_info()
        print(f"Max Load: {self.max_load} pounds")

    def can_carry(self, weight):
        weight_in_pounds = weight * 1
        return self.max_load >= weight_in_pounds

# Instantiate Vehicle and Truck
v = Vehicle('Tesla', 'Model 3', 2022)
t = Truck('Ford', 'F-150', 2020, 10000)

# Call methods
v.display_info()
print(f"Vehicle Age: {v.get_age()} years\n")
t.display_info()
print(f"Truck Age: {t.get_age()} years")
print(f"Can the truck carry 11000 lbs? {'Yes' if t.can_carry(11000) else 'No'}")