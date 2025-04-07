# Define the function f as a list where f[x] = f(x) for x in S = {0,1,...,20}
f = [1, 2, 3, 4, 5, 0, 7, 8, 9, 10, 11, 12, 6, 14, 15, 16, 17, 18, 19, 20, 13]

# Function to compose two functions represented as lists.
def compose(g, h):
    # Returns the composition (g o h) defined by (g o h)(x) = g(h(x))
    return [ g[h[x]] for x in range(len(h)) ]

# Use a set to record distinct powers; represent each mapping as a tuple.
distinct = set()

# Start with f^1
current = f[:]  # copy of f
n = 1

while tuple(current) not in distinct:
    distinct.add(tuple(current))
    # Compute the next power: current = f^(n+1) = f o current
    current = compose(f, current)
    n += 1

print("Student ID: 1217455031")
print("The number of distinct powers f^n is:", len(distinct))