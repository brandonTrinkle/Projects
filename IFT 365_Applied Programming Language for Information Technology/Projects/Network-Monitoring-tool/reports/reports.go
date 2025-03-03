package reports

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"network-monitoring-tool/metrics"
	"os"
	"time"
)

// Constants
const (
	MaxEntries      = 121
	TimestampFormat = "01/02/2006 15:04"
	csvFilePath     = "network_metrics.csv"
)

// WriteMetricsToCSV writes SpeedMetrics to the CSV.
func WriteMetricsToCSV(metricsData metrics.SpeedMetrics) bool {
	log.Println("Starting CSV write operation...")

	// Ensure CSV headers are present
	ensureHeaders(csvFilePath)

	// Skip writing if the speed test results are zero
	if metricsData.DownloadSpeed == 0 && metricsData.UploadSpeed == 0 && metricsData.Ping == 0 {
		log.Println("No valid speed test data. Skipping CSV write.")
		return false
	}

	// Prepare the formatted record
	timestamp := time.Now().Format(TimestampFormat)
	record := formatRecord(metricsData, timestamp)

	// Count rows to determine if we need to append or overwrite
	rowCount := countRows(csvFilePath)
	log.Printf("Current row count: %d", rowCount)

	if rowCount >= MaxEntries {
		// If the row count exceeds MaxEntries, overwrite the oldest row
		success := overwriteOldestRow(csvFilePath, record)
		if success {
			log.Printf("Metrics successfully written to CSV (overwrite).")
			logRecordDetails(record)
		}
		return success
	} else {
		// Append the new record if we're still under the limit
		success := appendRecord(csvFilePath, record)
		if success {
			log.Printf("Metrics successfully written to CSV (append).")
			logRecordDetails(record)
		}
		return success
	}
}

// formatRecord formats the metrics into a consistent CSV format.
func formatRecord(metrics metrics.SpeedMetrics, timestamp string) []string {
	return []string{
		timestamp,
		fmt.Sprintf("%.2f", metrics.DownloadSpeed),
		fmt.Sprintf("%.2f", metrics.UploadSpeed),
		fmt.Sprintf("%.2f", metrics.Ping),
		fmt.Sprintf("%.2f", metrics.Jitter),
		fmt.Sprintf("%.2f", metrics.PacketLoss),
	}
}

// appendRecord adds a new entry to the CSV file.
func appendRecord(filePath string, record []string) bool {
	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("Error opening CSV for appending: %v", err)
		return false
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	if err := writer.Write(record); err != nil {
		log.Printf("Error writing record: %v", err)
		return false
	}

	log.Println("Record successfully appended to CSV.")
	return true
}

// overwriteOldestRow overwrites the oldest row in the CSV file and verifies the change.
func overwriteOldestRow(filePath string, record []string) bool {
	log.Println("Overwriting the oldest row in the CSV...")

	// Open the original CSV for reading and writing
	file, err := os.OpenFile(filePath, os.O_RDWR, 0644)
	if err != nil {
		log.Printf("Error opening CSV for overwriting: %v", err)
		return false
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Printf("Error reading CSV for overwriting: %v", err)
		return false
	}

	// Determine the oldest row based on the timestamp
	oldestIndex := -1
	oldestTime := time.Now() 

	for i := 1; i < len(records); i++ {
		rowTime, err := time.Parse(TimestampFormat, records[i][0])
		if err != nil {
			log.Printf("Error parsing timestamp for row %d: %v", i+1, err)
			continue
		}
		if rowTime.Before(oldestTime) {
			oldestTime = rowTime
			oldestIndex = i
		}
	}

	// Check if an oldest row was found
	if oldestIndex == -1 {
		log.Println("No valid rows available to overwrite.")
		return false
	}

	// Adjust row number
	rowNumber := oldestIndex + 1

	log.Printf("Found oldest row: Row %d. Original row: %v", rowNumber, records[oldestIndex])
	records[oldestIndex] = record
	log.Printf("Overwriting row: Row %d with new values: %v", rowNumber, record)

	// Truncate the file and write updated records
	if err := file.Truncate(0); err != nil {
		log.Printf("Error truncating CSV file: %v", err)
		return false
	}
	file.Seek(0, 0)

	writer := csv.NewWriter(file)
	if err := writer.WriteAll(records); err != nil {
		log.Printf("Error writing updated records: %v", err)
		return false
	}
	writer.Flush()

	if writer.Error() != nil {
		log.Printf("Error during flushing writer: %v", writer.Error())
		return false
	}

	log.Println("File truncated successfully. Rewriting the CSV file with updated records...")
	log.Printf("Oldest row overwritten successfully at Row %d.", rowNumber)

	// Reopen the CSV to verify the updated row
	log.Println("Reopening CSV to verify updated row...")
	fileForVerification, err := os.Open(filePath)
	if err != nil {
		log.Printf("Error opening CSV for verification: %v", err)
		return false
	}
	defer fileForVerification.Close()

	readerForVerification := csv.NewReader(fileForVerification)
	updatedRecords, err := readerForVerification.ReadAll()
	if err != nil {
		log.Printf("Error reading CSV for verification: %v", err)
		return false
	}

	if len(updatedRecords) > oldestIndex && compareRecords(updatedRecords[oldestIndex], record) {
		log.Printf("Verified updated row at Row %d: %v", rowNumber, updatedRecords[oldestIndex])
		log.Println("Verification successful: Row was updated correctly.")
	} else {
		log.Printf("Verification failed: Expected %v, but found %v", record, updatedRecords[oldestIndex])
		return false
	}

	return true
}

// compareRecords compares two CSV records and returns true if they match.
func compareRecords(record1, record2 []string) bool {
	if len(record1) != len(record2) {
		return false
	}
	for i := range record1 {
		if record1[i] != record2[i] {
			return false
		}
	}
	return true
}

// countRows returns the number of rows in the CSV excluding the header.
func countRows(filePath string) int {
	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("Error opening CSV for counting rows: %v", err)
		return 0
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Printf("Error reading CSV for counting rows: %v", err)
		return 0
	}

	return len(records) - 1 // Exclude header row
}

// ensureHeaders ensures that the CSV file has the correct headers.
func ensureHeaders(filePath string) {
	file, err := os.OpenFile(filePath, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		log.Fatalf("Error opening CSV for headers: %v", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	firstLine, err := reader.Read()
	if err == io.EOF || err != nil || len(firstLine) == 0 {
		writeHeaders(file)
	}
}

// writeHeaders writes the headers to the CSV.
func writeHeaders(file *os.File) {
	writer := csv.NewWriter(file)
	headers := []string{"Timestamp", "Download Speed (Mbps)", "Upload Speed (Mbps)", "Ping (ms)", "Jitter (ms)", "Packet Loss (%)"}
	writer.Write(headers)
	writer.Flush()
	if writer.Error() != nil {
		log.Printf("Error writing headers to CSV: %v", writer.Error())
	}
	log.Println("CSV headers written.")
}

// logRecordDetails logs the details of the written record.
func logRecordDetails(record []string) {
	for i, value := range record {
		log.Printf("Written value '%s' to column %d", value, i+1)
	}
}
