best_p, best_q = 0, 0
smallest_diff = 1

for q in range(2, 100001):
    lower_p = int(1.4 * q)
    upper_p = int(1.5 * q) + 1

    for p in range(lower_p, upper_p):
        approx = p / q
        diff = abs(approx**2 - 2)

        if diff < smallest_diff:
            smallest_diff = diff
            best_p, best_q = p, q

print("Student ID: 1217455031")
print(f"Best approximation of sqrt(2) is {best_p}/{best_q} = {best_p/best_q}")
