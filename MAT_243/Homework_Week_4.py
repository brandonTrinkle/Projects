def multiplicative_order(a, mod=101):
    t = 1
    current = a % mod
    while current != 1:
        current = (current * a) % mod
        t += 1
        # In a finite group of order mod-1, t will never exceed mod-1.
        if t > mod - 1:
            break
    return t

def find_generators(mod=101):
    generators = []
    for a in range(1, mod):
        order = multiplicative_order(a, mod)
        # The function f_a(x)=a^x mod mod is bijective if and only if the order is mod-1.
        if order == mod - 1:
            generators.append(a)
    return generators

def main():
    generators = find_generators()
    print("Student ID: 1217455031")
    print(generators)

if __name__ == "__main__":
    main()