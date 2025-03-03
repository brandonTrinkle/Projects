package main

import (
	"fmt"
)

func checkCredentials(loginID, password string) bool {
	const validLoginID = "admin"
	const validPassword = "Pa$$w0rd"

	if loginID != validLoginID {
		fmt.Println("LoginID incorrect!")
		return false
	}

	if password != validPassword {
		fmt.Println("Password incorrect!")
		return false
	}

	return true
}

func main() {
	var loginID, password string
	maxAttempts := 3

	for attempts := 1; attempts <= maxAttempts; attempts++ {
		fmt.Println("Enter LoginID:")
		fmt.Scanln(&loginID)

		fmt.Println("Enter Password:")
		fmt.Scanln(&password)

		if checkCredentials(loginID, password) {
			fmt.Println("Login Successful!")
			return
		} else {
			if attempts < maxAttempts {
				fmt.Printf("Try again - %d attempts remaining!\n", maxAttempts-attempts)
			} else {
				fmt.Println("Account locked - contact 1-800-123-4567")
			}
		}
	}
}
