"""
Brandon Trinkle
IFT 360
8/24/2024
"""

# Concept 1: Variables
integer_var = 10
float_var = 20.5
string_var = "Hello, Python!"

print("Concept 1:")
print(integer_var)
print(float_var)
print(string_var)
print("")

# Concept 2: Type Casting
print("Concept 2:")
string_num = "17"
print("Before type casting:", string_num)
int_num = int(string_num)
print("After type casting:", int_num)
print("")

# Concept 3: Lists
print("Concept 3:")
numbers_list = [1, 2, 3, 4, 5]
print(numbers_list)
print(numbers_list[2])  # Printing the third item in the list (index 2)
numbers_list.append(6)
print(numbers_list)
print("")

# Concept 4: For Loops
print("Concept 4:")
names_list = ["Deo", "Alanna", "Brandon", "Cocoa", "Nova"]
for name in names_list:
    print(name)
names_list.append("Mocha")
print("Length of the list:", len(names_list))
print("")

# Concept 5: Comments
print("Concept 5:")
print("# This is a single-line comment")
print("''' This is a block comment. It can span multiple lines. '''")
print("")

# Concept 6: Dictionaries
print("Concept 6:")
phonebook = {"Brandon": "716-123-4567", "Alanna": "716-567-8901", "Deo": "702-466-1234"}
print(phonebook)
print(phonebook.keys())
print(phonebook.values())
print(phonebook.items())

phonebook["Raj"] = "716-941-6315"
print("Raj's Phone Number:", phonebook["Raj"])

print(phonebook)

del phonebook["Raj"]
print(phonebook)

for name in phonebook:
    print("Name:", name)

for number in phonebook.values():
    print("Phone Number:", number)
    
print("")

# Concept 7: File Handling
print("Concept 7:")
with open('C:\\Users\\Btrin\\Downloads\\names.txt', 'r') as file:
    for line in file:
        print(line.strip())
    
print("")

# Concept 8: Extracting Rows, Attributes from File
print("Concept 8:")
with open('C:\\Users\\Btrin\\Downloads\\names.txt', 'r') as file:
    for line in file:
        name, age = line.split()
        age = int(age)
        print("Age:", age)
print("")

# Concept 9: Pandas Data Frames
import pandas as pd
print("Concept 9:")
# Reading the file into a dataframe
df = pd.read_csv('C:\\Users\\Btrin\\Downloads\\names.txt', sep="\t", header=None, names=["Name", "Age"])

# Finding the max and min age
max_age = df["Age"].max()
min_age = df["Age"].min()
print("Max Age:", max_age)
print("Min Age:", min_age)

# Extracting rows 2 & 3 using loc
extracted_rows = df.loc[1:2]
print(extracted_rows)