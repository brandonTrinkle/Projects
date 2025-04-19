from typing import List

def compute_f(n: int) -> int:
    if n < 2:
        return n

    dp: List[int] = [0] * (n + 1)
    dp[1] = 1

    for i in range(2, n + 1):
        dp[i] = dp[i // 2] + dp[i // 3]

    return dp[n]

if __name__ == "__main__":
    N = 100_000
    result = compute_f(N)
    print("Student ID: 1217455031")
    print(f"f({N}) = {result}")