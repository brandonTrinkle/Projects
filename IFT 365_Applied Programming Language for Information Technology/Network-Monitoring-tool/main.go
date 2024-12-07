package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"network-monitoring-tool/dashboard"
	"network-monitoring-tool/graphs"
	"network-monitoring-tool/metrics"
	"network-monitoring-tool/reports"
	schedule "network-monitoring-tool/scheduler"
)

const (
	speedTestInterval    = 15 * time.Minute
	rateLimitPause       = 30 * time.Minute
	graphGenerationDelay = 5 * time.Second
	csvWriteTimeout      = 10 * time.Second
	maxRetries           = 3
)

// LogEntry defines the structure of the JSON log entry.
type LogEntry struct {
	Timestamp string `json:"timestamp"`
	Level     string `json:"level"`
	Message   string `json:"message"`
}

// logMessage is a global function that outputs logs in JSON format.
func logMessage(level, message string) {
	logEntry := LogEntry{
		Timestamp: time.Now().Format(time.RFC3339),
		Level:     level,
		Message:   message,
	}
	jsonEntry, err := json.Marshal(logEntry)
	if err != nil {
		log.Printf(`{"timestamp": "%s", "level": "ERROR", "message": "Failed to marshal log entry: %v"}`, time.Now().Format(time.RFC3339), err)
	} else {
		log.Println(string(jsonEntry))
	}
}

func getCSVFilePath() string {
	// Always return the correct relative path for the CSV file
	return "./network_metrics.csv"
}

func main() {
	// Set up logging to a file
	logDir := "logs"
	if _, err := os.Stat(logDir); os.IsNotExist(err) {
		err := os.Mkdir(logDir, 0755)
		if err != nil {
			log.Fatalf("Failed to create log directory: %v", err)
		}
	}

	logFilePath := filepath.Join(logDir, "network-monitoring.log")
	file, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}
	defer file.Close()

	// Set the log output to the log file
	log.SetOutput(file)
	log.SetFlags(0) // Disable default timestamp flags

	// Create a cancellable context to handle graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())

	// Handle application shutdown gracefully
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-stopChan
		logMessage("INFO", "Shutting down application gracefully...")
		cancel()
	}()

	// Run initial speed test on startup
	logMessage("INFO", "Attempting to start initial speed test...")
	runSpeedTestWithRetry(ctx, maxRetries)

	// Read the last metrics from CSV to initialize the dashboard
	csvFilePath := getCSVFilePath()
	initialMetrics, err := dashboard.ReadMetricsFromCSV(csvFilePath)
	if err != nil {
		logMessage("ERROR", fmt.Sprintf("Failed to read initial metrics from CSV: %v", err))
		go dashboard.ShowDashboard(nil)
	} else {
		go dashboard.ShowDashboard(initialMetrics)
	}

	// Function to handle CSV write task
	writeCSVTask := func() {
		logMessage("INFO", "Starting scheduled speed test...")

		// Run speed test to collect metrics
		runSpeedTestWithRetry(ctx, maxRetries)
	}

	// Function to handle delay before starting graph generation
	delayFunc := func() {
		time.Sleep(graphGenerationDelay)
		logMessage("INFO", "Starting graph generation process after delay...")
		graphs.GraphMetrics()
	}

	// Scheduling the speed test at a fixed interval
	scheduler := schedule.ScheduleReport(speedTestInterval, writeCSVTask, delayFunc)

	// Wait for shutdown signal
	<-ctx.Done()
	scheduler.Stop()
	logMessage("INFO", "Scheduler stopped.")
	if err := file.Close(); err != nil {
		logMessage("ERROR", "Failed to close log file properly.")
	}
	logMessage("INFO", "Application shutdown complete.")
}

func runSpeedTestWithRetry(ctx context.Context, maxRetries int) {
	for attempt := 1; attempt <= maxRetries; attempt++ {
		logMessage("INFO", fmt.Sprintf("Running speed test, attempt %d/%d...", attempt, maxRetries))

		// Run the speed test to collect metrics
		metricsData := metrics.RunSpeedTest()

		// Log the metrics data immediately after collection
		logMessage("INFO", fmt.Sprintf("Speed test results: Download=%.2f Mbps, Upload=%.2f Mbps, Ping=%.2f ms",
			metricsData.DownloadSpeed, metricsData.UploadSpeed, metricsData.Ping))

		// Handle rate limit error scenario
		if metricsData.HasRateLimitError {
			logMessage("WARNING", "Rate limit error detected. Pausing for 30 minutes before retrying...")
			select {
			case <-ctx.Done():
				logMessage("INFO", "Context canceled during rate limit pause.")
				return
			case <-time.After(rateLimitPause):
			}
			continue
		}

		// Handle cases where the speed test fails (all zero values)
		if metricsData.DownloadSpeed == 0 && metricsData.UploadSpeed == 0 && metricsData.Ping == 0 {
			logMessage("WARNING", "Speed test failed, skipping this run due to zero results.")
			continue
		}

		// Write metrics to CSV with a timeout to prevent blocking indefinitely
		done := make(chan bool, 1)
		go func() {
			success := reports.WriteMetricsToCSV(metricsData)
			done <- success
		}()

		select {
		case success := <-done:
			if success {
				logMessage("INFO", "Metrics written to CSV successfully.")
				// Log that we are generating graphs
				logMessage("INFO", "Generating graphs after successful write to CSV.")
				graphs.GraphMetrics() // Generate graphs after successful write
				return
			} else {
				logMessage("ERROR", fmt.Sprintf("Failed to write metrics to CSV, retrying attempt %d/%d...", attempt, maxRetries))
			}
		case <-time.After(csvWriteTimeout):
			logMessage("ERROR", "CSV write operation timed out.")
		case <-ctx.Done():
			logMessage("INFO", "Context canceled during speed test.")
			return
		}

		time.Sleep(1 * time.Second)
	}
	logMessage("ERROR", "All retry attempts failed.")
}
