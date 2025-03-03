package graphs

import (
	"encoding/csv"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/go-echarts/go-echarts/v2/charts"
	"github.com/go-echarts/go-echarts/v2/opts"
)

const csvFilePath = "network_metrics.csv"
const maxRowsToProcess = 121 // Define the maximum number of rows to process

// GraphMetrics reads the CSV and generates a line chart for all network metrics.
func GraphMetrics() {
	log.Println("Starting graph generation process...")

	// Open the CSV file for reading
	file, err := os.Open(csvFilePath)
	if err != nil {
		log.Fatalf("Error opening CSV file: %v", err)
	}
	defer func() {
		log.Println("Closing the CSV file after reading for graphing.")
		file.Close()
	}()

	reader := csv.NewReader(file)

	// Read all data from the CSV file
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatalf("Error reading CSV file: %v", err)
	}

	if len(records) < 2 {
		log.Println("No data available to graph.")
		return
	}

	// Ensure we only process up to the maximum allowed rows
	if len(records) > maxRowsToProcess {
		records = records[:maxRowsToProcess]
	}

	// Parse the CSV data
	var timestamps []string
	var downloadSpeeds, uploadSpeeds, pings, jitters, packetLosses []opts.LineData

	// Skip the header (first row)
	for i, record := range records[1:] {
		if len(record) != 6 {
			log.Printf("Skipping row %d: incorrect number of columns (%d columns found, expected 6)", i+2, len(record))
			continue
		}

		// Log the raw data of the current row being processed
		log.Printf("Processing row %d: %v", i+2, record)

		// Parse timestamp
		timestamp, err := time.Parse("01/02/2006 15:04", record[0])
		if err != nil || record[0] == "" {
			log.Printf("Invalid or empty timestamp in row %d: %s. Setting timestamp to current time.", i+2, record[0])
			timestamp = time.Now() // Set to current time as fallback
		}
		timestamps = append(timestamps, timestamp.Format("2006-01-02 15:04:05"))

		// Parse download speed
		if record[1] == "" {
			log.Printf("Skipping row %d: download speed value is empty.", i+2)
			continue
		}
		downloadSpeed, err := strconv.ParseFloat(record[1], 64)
		if err != nil {
			log.Printf("Skipping row %d: invalid download speed value '%s'", i+2, record[1])
			continue
		}
		downloadSpeeds = append(downloadSpeeds, opts.LineData{Value: downloadSpeed})

		// Parse upload speed
		if record[2] == "" {
			log.Printf("Skipping row %d: upload speed value is empty.", i+2)
			continue
		}
		uploadSpeed, err := strconv.ParseFloat(record[2], 64)
		if err != nil {
			log.Printf("Skipping row %d: invalid upload speed value '%s'", i+2, record[2])
			continue
		}
		uploadSpeeds = append(uploadSpeeds, opts.LineData{Value: uploadSpeed})

		// Parse ping
		if record[3] == "" {
			log.Printf("Skipping row %d: ping value is empty.", i+2)
			continue
		}
		ping, err := strconv.ParseFloat(record[3], 64)
		if err != nil {
			log.Printf("Skipping row %d: invalid ping value '%s'", i+2, record[3])
			continue
		}
		pings = append(pings, opts.LineData{Value: ping})

		// Parse jitter
		if record[4] == "" {
			log.Printf("Skipping row %d: jitter value is empty.", i+2)
			continue
		}
		jitter, err := strconv.ParseFloat(record[4], 64)
		if err != nil {
			log.Printf("Skipping row %d: invalid jitter value '%s'", i+2, record[4])
			continue
		}
		jitters = append(jitters, opts.LineData{Value: jitter})

		// Parse packet loss
		if record[5] == "" {
			log.Printf("Skipping row %d: packet loss value is empty.", i+2)
			continue
		}
		packetLoss, err := strconv.ParseFloat(record[5], 64)
		if err != nil {
			log.Printf("Skipping row %d: invalid packet loss value '%s'", i+2, record[5])
			continue
		}
		packetLosses = append(packetLosses, opts.LineData{Value: packetLoss})
	}

	// If we have no data after processing, log and return
	if len(timestamps) == 0 {
		log.Println("No valid data found in the CSV file for graph generation. Exiting graph generation.")
		return
	}

	// Create a line chart
	lineChart := charts.NewLine()
	lineChart.SetGlobalOptions(
		charts.WithTitleOpts(opts.Title{Title: "Network Metrics Report", Top: "5%", TitleStyle: &opts.TextStyle{Color: "#FFFFFF"}}),
		charts.WithXAxisOpts(opts.XAxis{
			Name:         "Time",
			NameLocation: "middle",
			NameGap:      30,
			AxisLabel:    &opts.AxisLabel{Color: "#FFFFFF"}, // White axis labels for dark background
		}),
		charts.WithYAxisOpts(opts.YAxis{
			Name:         "Metric Values",
			NameLocation: "middle",
			NameGap:      50,
			AxisLabel:    &opts.AxisLabel{Color: "#FFFFFF"},
		}),
		charts.WithLegendOpts(opts.Legend{Show: opts.Bool(true), Right: "10%", Top: "10%", TextStyle: &opts.TextStyle{Color: "#FFFFFF"}}),
		charts.WithTooltipOpts(opts.Tooltip{Show: opts.Bool(true), Trigger: "axis"}),
		charts.WithInitializationOpts(opts.Initialization{
			Theme: "dark", // Properly set the dark theme for the chart
		}),
	)

	// Set the X-axis and add series for each metric with vibrant colors and smooth lines
	lineChart.SetXAxis(timestamps).
		AddSeries("Download Speed (Mbps)", downloadSpeeds,
			charts.WithLineChartOpts(opts.LineChart{Smooth: opts.Bool(true)}),
			charts.WithLineStyleOpts(opts.LineStyle{Color: "#FF5733"})). // Vibrant red-orange
		AddSeries("Upload Speed (Mbps)", uploadSpeeds,
			charts.WithLineChartOpts(opts.LineChart{Smooth: opts.Bool(true)}),
			charts.WithLineStyleOpts(opts.LineStyle{Color: "#33FF57"})). // Vibrant green
		AddSeries("Ping (ms)", pings,
			charts.WithLineChartOpts(opts.LineChart{Smooth: opts.Bool(true)}),
			charts.WithLineStyleOpts(opts.LineStyle{Color: "#3375FF"})). // Vibrant blue
		AddSeries("Jitter (ms)", jitters,
			charts.WithLineChartOpts(opts.LineChart{Smooth: opts.Bool(true)}),
			charts.WithLineStyleOpts(opts.LineStyle{Color: "#FF33F6"})). // Vibrant pink
		AddSeries("Packet Loss (%)", packetLosses,
			charts.WithLineChartOpts(opts.LineChart{Smooth: opts.Bool(true)}),
			charts.WithLineStyleOpts(opts.LineStyle{Color: "#FFFF33"})) // Vibrant yellow

	// Render the chart to an HTML file
	outputFile := "network_metrics_chart.html"
	f, err := os.Create(outputFile)
	if err != nil {
		log.Fatalf("Error creating output file for graph: %v", err)
	}
	defer func() {
		log.Println("Closing the output file after writing the graph.")
		f.Close()
	}()

	err = lineChart.Render(f)
	if err != nil {
		log.Fatalf("Error rendering combined chart: %v", err)
	}

	log.Printf("Combined chart generated and saved to %s", outputFile)
}
