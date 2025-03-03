package main

import (
	"encoding/csv"
	"fmt"
	"os"
	"sort"
	"strconv"
	"sync"
)

// Person struct to represent each entry
type Person struct {
	Name   string
	Age    int
	Salary float64
}

// Function to write data to CSV
func writeCSV(filePath string, people []Person) {
	file, err := os.Create(filePath)
	if err != nil {
		panic(fmt.Sprintf("Error creating file: %v", err))
	}
	defer func() {
		fmt.Println("Closing file after writing")
		file.Close()
	}()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	writer.Write([]string{"Name", "Age", "Salary"})
	for _, person := range people {
		record := []string{person.Name, strconv.Itoa(person.Age), fmt.Sprintf("%.2f", person.Salary)}
		if err := writer.Write(record); err != nil {
			panic(fmt.Sprintf("Error writing to CSV: %v", err))
		}
	}
	fmt.Println("Data written successfully to", filePath)
}

// Function to read data from CSV
func readCSV(filePath string) ([]Person, error) {
	defer recoverFromPanic()
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("error opening file: %w", err)
	}
	defer func() {
		fmt.Println("Closing file after reading")
		file.Close()
	}()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("error reading CSV: %w", err)
	}

	var people []Person
	for i, record := range records {
		if i == 0 {
			continue
		}
		age, _ := strconv.Atoi(record[1])
		salary, _ := strconv.ParseFloat(record[2], 64)
		people = append(people, Person{
			Name:   record[0],
			Age:    age,
			Salary: salary,
		})
	}
	return people, nil
}

// Function to recover from panics
func recoverFromPanic() {
	if r := recover(); r != nil {
		fmt.Println("Recovered from panic:", r)
	}
}

// Function to sort by name
func sortByName(people []Person) {
	sort.Slice(people, func(i, j int) bool {
		return people[i].Name < people[j].Name
	})
}

// Read, sort, and send data
func processCSVData(filePath string, wg *sync.WaitGroup, ch chan<- []Person) {
	defer wg.Done()
	people, err := readCSV(filePath)
	if err != nil {
		fmt.Println("Error reading CSV:", err)
		return
	}
	sortByName(people)
	ch <- people
}

func main() {
	filePath := "Lab_5.csv"

	// Data to write to CSV
	people := []Person{
		{"Steve", 32, 55000.0},
		{"Brandon", 38, 100000.0},
		{"Alanna", 30, 90000.0},
		{"Deo", 12, 10000.0},
		{"Cocoa", 2, 20000},
		{"Noca", 1, 15000},
	}

	// Write data to CSV
	writeCSV(filePath, people)

	// Read, sort, and display data
	var wg sync.WaitGroup
	ch := make(chan []Person)

	wg.Add(1)
	go processCSVData(filePath, &wg, ch)

	go func() {
		wg.Wait()
		close(ch)
	}()

	// Retrieve and print sorted data from the channel
	for sortedPeople := range ch {
		fmt.Println("\nSorted Data:")
		for _, person := range sortedPeople {
			fmt.Printf("Name: %s, Age: %d, Salary: %.2f\n", person.Name, person.Age, person.Salary)
		}
	}
}
