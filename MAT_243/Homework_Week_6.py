S = [1,2,3,4]
pairs = [(a,b) for a in S for b in S]
def is_transitive(R):
    return all((a,d) in R for (a,b) in R for (c,d) in R if b==c)
def is_reflexive(R):
    return all((a,a) in R for a in S)
count = 0
for mask in range(1 << len(pairs)):
    R = {pairs[i] for i in range(len(pairs)) if (mask >> i) & 1}
    if is_transitive(R) and not is_reflexive(R):
        count += 1
print("Student ID: 1217455031")
print(count)