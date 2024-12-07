package dashboard

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	ui "github.com/gizak/termui/v3"
	"github.com/gizak/termui/v3/widgets"
)

var mu sync.Mutex // Mutex to prevent data race conditions

func ShowDashboard(initialMetrics map[string]float64) {

	// Initialize the terminal UI
	if err := ui.Init(); err != nil {
		log.Fatalf("failed to initialize termui: %v", err)
	}
	defer ui.Close()

	// Create widgets to display speed test results
	downloadParagraph := widgets.NewParagraph()
	downloadParagraph.Title = "Download Speed (Mbps)"
	if initialMetrics != nil {
		downloadParagraph.Text = fmt.Sprintf("%.2f Mbps", initialMetrics["DownloadSpeed"])
	} else {
		downloadParagraph.Text = "Waiting for initial test..."
	}
	downloadParagraph.TitleStyle = ui.NewStyle(ui.ColorWhite)
	downloadParagraph.TextStyle = ui.NewStyle(ui.ColorGreen)
	downloadParagraph.SetRect(0, 0, 30, 3)

	uploadParagraph := widgets.NewParagraph()
	uploadParagraph.Title = "Upload Speed (Mbps)"
	if initialMetrics != nil {
		uploadParagraph.Text = fmt.Sprintf("%.2f Mbps", initialMetrics["UploadSpeed"])
	} else {
		uploadParagraph.Text = "Waiting for initial test..."
	}
	uploadParagraph.TitleStyle = ui.NewStyle(ui.ColorWhite)
	uploadParagraph.TextStyle = ui.NewStyle(ui.ColorGreen)
	uploadParagraph.SetRect(0, 4, 30, 7)

	pingParagraph := widgets.NewParagraph()
	pingParagraph.Title = "Ping (ms)"
	if initialMetrics != nil {
		pingParagraph.Text = fmt.Sprintf("%.2f ms", initialMetrics["Ping"])
	} else {
		pingParagraph.Text = "Waiting for initial test..."
	}
	pingParagraph.TitleStyle = ui.NewStyle(ui.ColorWhite)
	pingParagraph.TextStyle = ui.NewStyle(ui.ColorGreen)
	pingParagraph.SetRect(0, 8, 100, 11)

	jitterParagraph := widgets.NewParagraph()
	jitterParagraph.Title = "Jitter (ms)"
	if initialMetrics != nil {
		jitterParagraph.Text = fmt.Sprintf("%.2f ms", initialMetrics["Jitter"])
	} else {
		jitterParagraph.Text = "Waiting for initial test..."
	}
	jitterParagraph.TitleStyle = ui.NewStyle(ui.ColorWhite)
	jitterParagraph.TextStyle = ui.NewStyle(ui.ColorGreen)
	jitterParagraph.SetRect(0, 12, 30, 15)

	packetLossParagraph := widgets.NewParagraph()
	packetLossParagraph.Title = "Packet Loss (%)"
	if initialMetrics != nil {
		packetLossParagraph.Text = fmt.Sprintf("%.2f %%", initialMetrics["PacketLoss"])
	} else {
		packetLossParagraph.Text = "Waiting for initial test..."
	}
	packetLossParagraph.TitleStyle = ui.NewStyle(ui.ColorWhite)
	packetLossParagraph.TextStyle = ui.NewStyle(ui.ColorGreen)
	packetLossParagraph.SetRect(0, 16, 30, 19)

	// Read all metrics from the CSV and initialize the BarCharts
	speedMetricsList, err := ReadAllMetricsFromCSV()
	if err != nil {
		log.Printf("Failed to read all metrics from CSV: %v", err)
		speedMetricsList = [][]float64{{}, {}} // Empty slices if no data available
	}

	// Ensure each dataset has at least 10 entries, using the last 10 entries if available
	downloadData := getLastTenEntries(speedMetricsList[0])
	uploadData := getLastTenEntries(speedMetricsList[1])

	// Configure BarChart for Download Speed
	downloadBarChart := widgets.NewBarChart()
	downloadBarChart.Title = "Download Speed Over Time (Mbps)"
	downloadBarChart.Data = downloadData
	downloadBarChart.Labels = make([]string, len(downloadData))
	for i := range downloadBarChart.Labels {
		downloadBarChart.Labels[i] = fmt.Sprintf("%d", i+1) // x-axis labels: 1-10
	}
	downloadBarChart.BarWidth = 5 // Adjusted bar width to fit chart
	downloadBarChart.BarColors = []ui.Color{ui.ColorBlue}
	downloadBarChart.NumStyles = []ui.Style{ui.NewStyle(ui.ColorWhite, ui.ColorClear)}
	downloadBarChart.SetRect(31, 0, 100, 10) // Adjust chart size to fit

	// Configure BarChart for Upload Speed
	uploadBarChart := widgets.NewBarChart()
	uploadBarChart.Title = "Upload Speed Over Time (Mbps)"
	uploadBarChart.Data = uploadData
	uploadBarChart.Labels = make([]string, len(uploadData))
	for i := range uploadBarChart.Labels {
		uploadBarChart.Labels[i] = fmt.Sprintf("%d", i+1) // x-axis labels: 1-10
	}
	uploadBarChart.BarWidth = 5
	uploadBarChart.BarColors = []ui.Color{ui.ColorMagenta}
	uploadBarChart.NumStyles = []ui.Style{ui.NewStyle(ui.ColorWhite, ui.ColorClear)}
	uploadBarChart.SetRect(31, 11, 100, 21)

	// Dynamically generate Y-axis labels
	maxDownload := findMax(downloadData)
	maxUpload := findMax(uploadData)

	downloadYAxisLabel := widgets.NewParagraph()
	downloadYAxisLabel.Text = generateYAxisLabels(maxDownload)
	downloadYAxisLabel.SetRect(25, 0, 32, 10)

	uploadYAxisLabel := widgets.NewParagraph()
	uploadYAxisLabel.Text = generateYAxisLabels(maxUpload)
	uploadYAxisLabel.SetRect(25, 11, 32, 21)

	// Create countdown timer paragraph
	countdownParagraph := widgets.NewParagraph()
	countdownParagraph.Title = "Next Speed Test In"
	countdownParagraph.Text = "Calculating..."
	countdownParagraph.SetRect(0, 20, 100, 23) //0, 20, 90, 23
	countdownParagraph.TitleStyle = ui.NewStyle(ui.ColorWhite)
	countdownParagraph.TextStyle = ui.NewStyle(ui.ColorRed)

	// Render initial UI elements
	ui.Render(
		downloadParagraph,
		uploadParagraph,
		pingParagraph,
		jitterParagraph,
		packetLossParagraph,
		downloadBarChart,
		uploadBarChart,
		downloadYAxisLabel,
		uploadYAxisLabel,
		countdownParagraph,
	)

	// Ticker for periodic updates
	nextTestDuration := 15 * time.Minute
	updateInterval := 1 * time.Second
	testTicker := time.NewTicker(nextTestDuration)
	updateTicker := time.NewTicker(updateInterval)
	defer testTicker.Stop()
	defer updateTicker.Stop()

	startTime := time.Now()

	for {
		select {
		case <-testTicker.C:
			go func() {
				mu.Lock()
				defer mu.Unlock()
				csvFilePath := "./network_metrics.csv"
				speedMetrics, err := ReadMetricsFromCSV(csvFilePath)
				if err != nil {
					log.Printf("Failed to read metrics from CSV: %v", err)
					return
				}
				updateWidgets(speedMetrics, downloadParagraph, uploadParagraph, pingParagraph, jitterParagraph, packetLossParagraph, downloadBarChart, uploadBarChart, downloadYAxisLabel, uploadYAxisLabel)
				startTime = time.Now() 
			}()
		case <-updateTicker.C:
			remaining := nextTestDuration - time.Since(startTime)
			if remaining < 0 {
				remaining = 0
			}
			countdownParagraph.Text = fmt.Sprintf("Next test in: %02d:%02d", int(remaining.Minutes()), int(remaining.Seconds())%60)
			ui.Render(countdownParagraph)
		case e := <-ui.PollEvents():
			if e.Type == ui.KeyboardEvent && (e.ID == "q" || e.ID == "<C-c>") {
				return
			}
		}
	}
}

func findMax(data []float64) float64 {
	max := 0.0
	for _, value := range data {
		if value > max {
			max = value
		}
	}
	return max
}

func generateYAxisLabels(maxValue float64) string {
	step := maxValue / 5 // Divide the range into 5 steps
	labels := ""
	for i := 5; i >= 0; i-- {
		labels += fmt.Sprintf("%.0f\n", step*float64(i))
	}
	return labels
}

func getLastTenEntries(data []float64) []float64 {
	// If the data has more than 10 entries, get the last 10
	if len(data) > 10 {
		return data[len(data)-10:]
	}
	// If fewer than 10 entries, pad with zeros at the beginning
	for len(data) < 10 {
		data = append([]float64{0}, data...)
	}
	return data
}

// ReadMetricsFromCSV reads the latest metrics from the CSV file.
func ReadMetricsFromCSV(filePath string) (map[string]float64, error) {
	log.Printf("Attempting to read from CSV file at path: %s", filePath)

	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("Error opening CSV file: %v", err)
		return nil, fmt.Errorf("failed to open CSV file: %v", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Printf("Error reading CSV file: %v", err)
		return nil, fmt.Errorf("failed to read CSV data: %v", err)
	}

	if len(records) < 2 {
		log.Printf("CSV file does not have enough rows; returning dummy data.")
		return map[string]float64{
			"DownloadSpeed": 0,
			"UploadSpeed":   0,
			"Ping":          0,
			"Jitter":        0,
			"PacketLoss":    0,
		}, nil
	}

	latestRecord := records[len(records)-1]
	log.Printf("Latest CSV record: %v", latestRecord)

	download, err1 := strconv.ParseFloat(latestRecord[1], 64)
	upload, err2 := strconv.ParseFloat(latestRecord[2], 64)
	ping, err3 := strconv.ParseFloat(latestRecord[3], 64)
	jitter, err4 := strconv.ParseFloat(latestRecord[4], 64)
	packetLoss, err5 := strconv.ParseFloat(latestRecord[5], 64)

	if err1 != nil || err2 != nil || err3 != nil || err4 != nil || err5 != nil {
		log.Printf("Error parsing CSV data: download=%v, upload=%v, ping=%v, jitter=%v, packetLoss=%v",
			err1, err2, err3, err4, err5)
		return nil, fmt.Errorf("failed to parse CSV data")
	}

	return map[string]float64{
		"DownloadSpeed": download,
		"UploadSpeed":   upload,
		"Ping":          ping,
		"Jitter":        jitter,
		"PacketLoss":    packetLoss,
	}, nil
}

// ReadAllMetricsFromCSV reads all metrics from the CSV file.
func ReadAllMetricsFromCSV() ([][]float64, error) {
	filePath := "./network_metrics.csv" 
	log.Printf("Attempting to read all metrics from CSV file at path: %s", filePath)

	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("Error opening CSV file: %v", err)
		return nil, fmt.Errorf("failed to open CSV file: %v", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Printf("Error reading CSV file: %v", err)
		return nil, fmt.Errorf("failed to read CSV data: %v", err)
	}

	// Skip header row and read data
	var downloadData, uploadData []float64
	for _, record := range records[1:] {
		download, err1 := strconv.ParseFloat(record[1], 64)
		upload, err2 := strconv.ParseFloat(record[2], 64)

		if err1 == nil && err2 == nil {
			downloadData = append(downloadData, download)
			uploadData = append(uploadData, upload)
		}
	}

	return [][]float64{downloadData, uploadData}, nil
}

func updateWidgets(
	speedMetrics map[string]float64,
	downloadParagraph *widgets.Paragraph,
	uploadParagraph *widgets.Paragraph,
	pingParagraph *widgets.Paragraph,
	jitterParagraph *widgets.Paragraph,
	packetLossParagraph *widgets.Paragraph,
	downloadBarChart *widgets.BarChart,
	uploadBarChart *widgets.BarChart,
	downloadYAxisLabel *widgets.Paragraph,
	uploadYAxisLabel *widgets.Paragraph,
) {
	// Update the text of the paragraphs to reflect the new speed metrics
	downloadParagraph.Text = fmt.Sprintf("Download Speed: %.2f Mbps", speedMetrics["DownloadSpeed"])
	uploadParagraph.Text = fmt.Sprintf("Upload Speed: %.2f Mbps", speedMetrics["UploadSpeed"])
	pingParagraph.Text = fmt.Sprintf("%.2f ms", speedMetrics["Ping"])
	jitterParagraph.Text = fmt.Sprintf("%.2f ms", speedMetrics["Jitter"])
	packetLossParagraph.Text = fmt.Sprintf("%.2f %%", speedMetrics["PacketLoss"])

	// Update bar chart data safely for download and upload charts
	downloadBarChart.Data = append(downloadBarChart.Data, speedMetrics["DownloadSpeed"])
	if len(downloadBarChart.Data) > 10 {
		downloadBarChart.Data = downloadBarChart.Data[len(downloadBarChart.Data)-10:]
	}

	uploadBarChart.Data = append(uploadBarChart.Data, speedMetrics["UploadSpeed"])
	if len(uploadBarChart.Data) > 10 {
		uploadBarChart.Data = uploadBarChart.Data[len(uploadBarChart.Data)-10:]
	}

	// Render all updated widgets, including Y-axis labels
	ui.Render(
		downloadParagraph,
		uploadParagraph,
		pingParagraph,
		jitterParagraph,
		packetLossParagraph,
		downloadBarChart,
		uploadBarChart,
		downloadYAxisLabel,
		uploadYAxisLabel,
	)
}
