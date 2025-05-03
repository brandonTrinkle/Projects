import itertools

def is_derangement(p):
     return all(p[i] != i for i in range(len(p)))
for p in itertools.permutations(range(5)):
    if is_derangement(p):
        print("Student ID: 1217455031")
        print(p)