def implies(p, q):
    return (not p) or q

print("Student ID: 1217455031")
print(f"| {'a':6} {'b':6} {'c':6} {'d':5} | {'(a->b)->(c->d)':15} | {'(a->(b->c))->d':15}|")
print("-" * 62)
for a in [False, True]:
    for b in [False, True]:
        for c in [False, True]:
            for d in [False, True]:
                expr1 = implies(implies(a, b), implies(c, d))
                expr2 = implies(implies(a, implies(b, c)), d)
                
                # Convert boolean values and print strings so True/False displayes instead of 1/0
                print(f"|{str(a):6} {str(b):6} {str(c):6} {str(d):6} | "
                      f"{str(expr1):15} | {str(expr2):15}|")