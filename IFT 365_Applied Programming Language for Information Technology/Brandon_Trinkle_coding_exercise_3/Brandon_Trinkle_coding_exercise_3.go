package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Define Address struct
type Address struct {
	Street string
	City   string
	State  string
	ZIP    string
}

// Define Teacher struct
type Teacher struct {
	EmployeeID int
	Name       string
	Salary     float64
	Address    Address
}

// Define Student struct
type Student struct {
	StudentID int
	Name      string
	Address   Address
}

// Maps to store Teachers and Students
var teachers = make(map[int]Teacher)
var students = make(map[int]Student)

// Helper function to read input
func getInput(prompt string) string {
	fmt.Print(prompt)
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	return strings.TrimSpace(scanner.Text())
}

// Function to create a new Address
func createAddress() Address {
	street := getInput("Enter Street: ")
	city := getInput("Enter City: ")
	state := getInput("Enter State: ")
	zip := getInput("Enter ZIP Code: ")
	return Address{Street: street, City: city, State: state, ZIP: zip}
}

// Function to add a new Teacher
func addTeacher() {
	id, _ := strconv.Atoi(getInput("Enter EmployeeID: "))
	name := getInput("Enter Name: ")
	salary, _ := strconv.ParseFloat(getInput("Enter Salary: "), 64)
	address := createAddress()
	teachers[id] = Teacher{EmployeeID: id, Name: name, Salary: salary, Address: address}
	fmt.Println("Teacher added successfully!\n")
}

// Function to add a new Student
func addStudent() {
	id, _ := strconv.Atoi(getInput("Enter StudentID: "))
	name := getInput("Enter Name: ")
	address := createAddress()
	students[id] = Student{StudentID: id, Name: name, Address: address}
	fmt.Println("Student added successfully!\n")
}

// Function to display all Teachers
func displayTeachers() {
	for _, teacher := range teachers {
		fmt.Printf("Teacher ID: %d\nName: %s\nSalary: %.2f\nAddress: %s, %s, %s, %s\n\n",
			teacher.EmployeeID, teacher.Name, teacher.Salary,
			teacher.Address.Street, teacher.Address.City,
			teacher.Address.State, teacher.Address.ZIP)
	}
}

// Function to display all Students
func displayStudents() {
	for _, student := range students {
		fmt.Printf("Student ID: %d\nName: %s\nAddress: %s, %s, %s, %s\n\n",
			student.StudentID, student.Name,
			student.Address.Street, student.Address.City,
			student.Address.State, student.Address.ZIP)
	}
}

// Function to search for Teachers by name substring
func searchTeachersByName(substring string) {
	for _, teacher := range teachers {
		if strings.Contains(strings.ToLower(teacher.Name), strings.ToLower(substring)) {
			fmt.Printf("Teacher ID: %d\nName: %s\nSalary: %.2f\nAddress: %s, %s, %s, %s\n\n",
				teacher.EmployeeID, teacher.Name, teacher.Salary,
				teacher.Address.Street, teacher.Address.City,
				teacher.Address.State, teacher.Address.ZIP)
		}
	}
}

// Function to search for Students by name substring
func searchStudentsByName(substring string) {
	for _, student := range students {
		if strings.Contains(strings.ToLower(student.Name), strings.ToLower(substring)) {
			fmt.Printf("Student ID: %d\nName: %s\nAddress: %s, %s, %s, %s\n\n",
				student.StudentID, student.Name,
				student.Address.Street, student.Address.City,
				student.Address.State, student.Address.ZIP)
		}
	}
}

// Main menu to interact with the program
func main() {
	for {
		fmt.Println("Select an option:")
		fmt.Println("1. Add a Teacher")
		fmt.Println("2. Add a Student")
		fmt.Println("3. Display All Teachers")
		fmt.Println("4. Display All Students")
		fmt.Println("5. Search Teachers by Name")
		fmt.Println("6. Search Students by Name")
		fmt.Println("7. Exit")

		choice := getInput("Enter choice: ")

		switch choice {
		case "1":
			addTeacher()
		case "2":
			addStudent()
		case "3":
			displayTeachers()
		case "4":
			displayStudents()
		case "5":
			substring := getInput("Enter name substring to search for Teachers: ")
			searchTeachersByName(substring)
		case "6":
			substring := getInput("Enter name substring to search for Students: ")
			searchStudentsByName(substring)
		case "7":
			fmt.Println("Exiting program.")
			return
		default:
			fmt.Println("Invalid choice, please try again.")
		}
	}
}
