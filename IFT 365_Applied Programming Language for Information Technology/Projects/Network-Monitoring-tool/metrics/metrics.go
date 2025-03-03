package metrics

import (
	"encoding/json"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/briandowns/spinner"
)

type SpeedMetrics struct {
	DownloadSpeed     float64 // in Mbps
	UploadSpeed       float64 // in Mbps
	Ping              float64 // in ms
	Jitter            float64 // in ms
	PacketLoss        float64 // in %
	HasRateLimitError bool    // Indicates if the speedtest hit a rate limit (429 error)
}

// getSpeedTestPath retrieves the relative path to `speedtest.exe` from the current directory.
func getSpeedTestPath() string {
	speedTestPath := "./ookla-speedtest-1.2.0-win64/speedtest.exe"

	// Verify the file exists
	if _, err := os.Stat(speedTestPath); os.IsNotExist(err) {
		log.Fatalf("speedtest.exe not found at %s. Please check the file location.", speedTestPath)
	}

	return speedTestPath
}

// RunSpeedTest runs the Ookla speed test CLI and returns the metrics.
func RunSpeedTest() SpeedMetrics {
	s := spinner.New(spinner.CharSets[75], 100*time.Millisecond) // Choose spinner style and speed
	s.Prefix = "Starting speed test & loading GUI... "
	s.Start()

	// Get the dynamic path to `speedtest.exe`
	speedTestPath := getSpeedTestPath()

	cmd := exec.Command(speedTestPath, "--format=json")
	output, err := cmd.CombinedOutput()
	s.Stop()

	if err != nil {
		log.Printf("Error running speedtest: %v", err)

		// Check if the error is due to rate limiting (exit status 429)
		if exitErr, ok := err.(*exec.ExitError); ok && exitErr.ExitCode() == 429 {
			log.Println("Rate limit error detected.")
			return SpeedMetrics{HasRateLimitError: true}
		}
		return SpeedMetrics{}
	}

	// Parse the JSON output from speedtest
	var speedTestResult map[string]interface{}
	if err := json.Unmarshal(output, &speedTestResult); err != nil {
		log.Printf("Error parsing speedtest output: %v", err)
		return SpeedMetrics{}
	}

	downloadSpeed := 0.0
	uploadSpeed := 0.0
	ping := 0.0
	jitter := 0.0
	packetLoss := 0.0

	if download, ok := speedTestResult["download"].(map[string]interface{}); ok {
		if bandwidth, ok := download["bandwidth"].(float64); ok {
			downloadSpeed = bandwidth * 8 / 1e6 // Convert from bytes to Mbps
		}
	}

	if upload, ok := speedTestResult["upload"].(map[string]interface{}); ok {
		if bandwidth, ok := upload["bandwidth"].(float64); ok {
			uploadSpeed = bandwidth * 8 / 1e6 // Convert from bytes to Mbps
		}
	}

	if pingData, ok := speedTestResult["ping"].(map[string]interface{}); ok {
		if latency, ok := pingData["latency"].(float64); ok {
			ping = latency
		}
		if jitterValue, ok := pingData["jitter"].(float64); ok {
			jitter = jitterValue
		}
	}

	if packetLossValue, ok := speedTestResult["packetLoss"].(float64); ok {
		packetLoss = packetLossValue
	}

	return SpeedMetrics{
		DownloadSpeed:     downloadSpeed,
		UploadSpeed:       uploadSpeed,
		Ping:              ping,
		Jitter:            jitter,
		PacketLoss:        packetLoss,
		HasRateLimitError: false,
	}
}
