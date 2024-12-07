package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	// Initialize a slice to store user inputs
	var userInputs []string

	// Initialize a reader for user input
	scanner := bufio.NewScanner(os.Stdin)

	for {
		// Prompt user to input a string
		fmt.Print("String to add: ")
		scanner.Scan()
		input := scanner.Text()

		// Append the input to the userInputs slice
		userInputs = append(userInputs, input)

		// Ask if the user wants to continue
		fmt.Print("Continue? [y/n]: ")
		scanner.Scan()
		choice := strings.ToLower(scanner.Text())

		// If the user does not want to continue, break the loop
		if choice != "y" {
			break
		}
	}

	// Use strings.Join to combine the inputs with a comma separator
	result := strings.Join(userInputs, ", ")
	fmt.Printf("You added: %s\n", result)
}
