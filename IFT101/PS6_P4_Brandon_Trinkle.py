'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS6
Problem: P4
Date: 11/17/2023
'''

# Define the Animal parent class
class Animal:
    def __init__(self, name, age, species):
        self.name = name
        self.age = age
        self.species = species

    def make_sound(self):
        return "Generic animal sound"

# Define child classes for Lion and Elephant
class Lion(Animal):
    def make_sound(self):
        return "Roar"

class Elephant(Animal):
    def make_sound(self):
        return "Trumpet"

# Define the Zoo class
class Zoo:
    def __init__(self):
        self.animals = []

    def add_animal(self, animal):
        self.animals.append(animal)

    def remove_animal(self, animal_name):
        for animal in self.animals:
            if animal.name == animal_name:
                self.animals.remove(animal)
                print(f"{animal_name} has been removed from the zoo.")
                return
        print(f"{animal_name} is not in the zoo.")

    def get_animals(self):
        for animal in self.animals:
            print(f"Name: {animal.name}, Age: {animal.age}, Species: {animal.species}, Sound: {animal.make_sound()}")

# Create a dictionary to map animal types to classes
animal_types = {
    "lion": Lion,
    "elephant": Elephant
}

# Main loop for the interactive program
def main():
    zoo = Zoo()
    print("===== Sparky's Zoo Management System =====")

    while True:
        print("\nZoo Menu:")
        print("1. Add an animal")
        print("2. Remove an animal")
        print("3. List all animals")
        print("4. Quit")

        choice = input()

        if choice == "1":
            animal_type = input("Enter the type of animal (lion/elephant): ").lower()
            if animal_type in animal_types:
                name = input("Enter the name of the animal: ")
                age = input("Enter the age of the animal: ")
                animal = animal_types[animal_type](name, age, animal_type)
                zoo.add_animal(animal)
                print(f"{name} has been added to the zoo.")
            else:
                print("Invalid animal type.")

        elif choice == "2":
            animal_name = input("Enter the name of the animal to remove: ")
            zoo.remove_animal(animal_name)

        elif choice == "3":
            zoo.get_animals()

        elif choice == "4":
            print("Goodbye!")
            break

        else:
            print("Invalid choice. Please choose a valid option.")

if __name__ == "__main__":
    main()