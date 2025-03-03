package main

import (
	"fmt"
	"log"
	"time"

	ui "github.com/gizak/termui/v3"
	"github.com/gizak/termui/v3/widgets"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

func main() {
	if err := ui.Init(); err != nil {
		log.Fatalf("failed to initialize termui: %v", err)
	}
	defer ui.Close()

	// Create widgets for the dashboard
	// CPU Usage Gauges for each core
	cpuGauges := []*widgets.Gauge{}
	cpuCount, _ := cpu.Counts(true)
	for i := 0; i < cpuCount; i++ {
		gauge := widgets.NewGauge()
		gauge.Title = fmt.Sprintf("CPU Core %d Usage", i)
		gauge.SetRect(0, i*3, 50, (i+1)*3)
		gauge.Percent = 0
		gauge.BarColor = ui.ColorRed
		gauge.LabelStyle = ui.NewStyle(ui.ColorWhite)
		cpuGauges = append(cpuGauges, gauge)
	}

	// Memory Usage Gauge
	memGauge := widgets.NewGauge()
	memGauge.Title = "Memory Usage"
	memGauge.SetRect(0, cpuCount*3, 50, cpuCount*3+5)
	memGauge.Percent = 0
	memGauge.BarColor = ui.ColorGreen
	memGauge.LabelStyle = ui.NewStyle(ui.ColorWhite)

	// Disk Usage
	diskUsage := widgets.NewList()
	diskUsage.Title = "Disk Usage"
	diskUsage.Rows = []string{"Loading..."}
	diskUsage.SetRect(0, cpuCount*3+6, 50, cpuCount*3+12)
	diskUsage.TextStyle = ui.NewStyle(ui.ColorYellow)

	// Network Usage Paragraph
	netUsage := widgets.NewParagraph()
	netUsage.Title = "Network Usage"
	netUsage.Text = "Total RX: 0 MB\nTotal TX: 0 MB"
	netUsage.SetRect(0, cpuCount*3+13, 50, cpuCount*3+18)
	netUsage.BorderStyle = ui.NewStyle(ui.ColorCyan)

	// Line Graph for CPU Load
	cpuLoadGraph := widgets.NewPlot()
	cpuLoadGraph.Title = "CPU Load"
	cpuLoadGraph.Data = [][]float64{[]float64{}}
	cpuLoadGraph.SetRect(51, 0, 100, 8)
	cpuLoadGraph.AxesColor = ui.ColorWhite
	cpuLoadGraph.LineColors[0] = ui.ColorCyan

	// Process List
	processList := widgets.NewList()
	processList.Title = "Processes"
	processList.Rows = []string{"Loading..."}
	processList.SetRect(51, 9, 100, 18)
	processList.TextStyle = ui.NewStyle(ui.ColorMagenta)

	ui.Render(memGauge, netUsage, diskUsage, cpuLoadGraph, processList)
	for _, g := range cpuGauges {
		ui.Render(g)
	}

	// Update the dashboard periodically
	uiEvents := ui.PollEvents()
	ticker := time.NewTicker(time.Second).C

	for {
		select {
		case e := <-uiEvents:
			if e.Type == ui.KeyboardEvent {
				switch e.ID {
				case "q", "<C-c>":
					return
				}
			}
		case <-ticker:
			// Update CPU gauges for each core
			cpuPercentages, err := cpu.Percent(0, true)
			if err == nil && len(cpuPercentages) > 0 {
				for i, percentage := range cpuPercentages {
					if i < len(cpuGauges) {
						cpuGauges[i].Percent = int(percentage)
					}
				}
			}

			// Update Memory Gauge
			virtualMem, err := mem.VirtualMemory()
			if err == nil {
				memGauge.Percent = int(virtualMem.UsedPercent)
			}

			// Update Disk Usage
			diskParts, err := disk.Partitions(false)
			if err == nil {
				diskRows := []string{}
				for _, part := range diskParts {
					usage, err := disk.Usage(part.Mountpoint)
					if err == nil {
						diskRows = append(diskRows, fmt.Sprintf("%s: %v%% used", part.Mountpoint, usage.UsedPercent))
					}
				}
				diskUsage.Rows = diskRows
			}

			// Update Network Usage
			netStats, err := net.IOCounters(false)
			if err == nil && len(netStats) > 0 {
				rx := float64(netStats[0].BytesRecv) / 1e6 // Convert to MB
				tx := float64(netStats[0].BytesSent) / 1e6 // Convert to MB
				netUsage.Text = fmt.Sprintf("Total RX: %.2f MB\nTotal TX: %.2f MB", rx, tx)
			}

			// Update Process List (top CPU users)
			procs, err := process.Processes()
			if err == nil {
				processRows := []string{}
				for _, p := range procs {
					name, _ := p.Name()
					cpuPercent, _ := p.CPUPercent()
					memPercent, _ := p.MemoryPercent()
					processRows = append(processRows, fmt.Sprintf("%s CPU: %.2f%% MEM: %.2f%%", name, cpuPercent, memPercent))
					if len(processRows) >= 5 {
						break
					}
				}
				processList.Rows = processRows
			}

			// Update the CPU load line graph
			if len(cpuPercentages) > 0 {
				cpuLoadGraph.Data[0] = append(cpuLoadGraph.Data[0], float64(cpuPercentages[0]))
				if len(cpuLoadGraph.Data[0]) > 30 {
					cpuLoadGraph.Data[0] = cpuLoadGraph.Data[0][1:]
				}
			}

			// Re-render the UI with updated values
			ui.Render(memGauge, netUsage, diskUsage, cpuLoadGraph, processList)
			for _, g := range cpuGauges {
				ui.Render(g)
			}
		}
	}
}