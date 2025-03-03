package schedule

import (
	"log"
	"time"
)

// Scheduler represents a task scheduler that can schedule and execute tasks at specific intervals.
type Scheduler struct {
	ticker    *time.Ticker
	stop      chan bool
	task      func()
	running   bool
	delayFunc func()
}

// NewScheduler creates a new scheduler instance for a given interval and task.
func NewScheduler(interval time.Duration, task func(), delayFunc func()) *Scheduler {
	return &Scheduler{
		ticker:    time.NewTicker(interval),
		stop:      make(chan bool),
		task:      task,
		delayFunc: delayFunc,
	}
}

// Start initiates the scheduler to run the assigned task at the specified intervals.
func (s *Scheduler) Start() {
	if s.running {
		log.Println("Scheduler already running")
		return
	}

	s.running = true
	go func() {
		for {
			select {
			case <-s.ticker.C:
				log.Println("Running scheduled task")
				s.task()

				if s.delayFunc != nil {
					log.Println("Executing delay function after CSV write...")
					s.delayFunc()
				}
			case <-s.stop:
				log.Println("Stopping scheduler")
				s.ticker.Stop()
				return
			}
		}
	}()
	log.Println("Scheduler started successfully")
}

// Stop halts the scheduler.
func (s *Scheduler) Stop() {
	if !s.running {
		log.Println("Scheduler is not running")
		return
	}

	s.stop <- true
	s.running = false
	log.Println("Scheduler stopped successfully")
}

// ScheduleReport is a utility function that schedules a report generation task.
func ScheduleReport(interval time.Duration, generateReportFunc func(), delayFunc func()) *Scheduler {
	scheduler := NewScheduler(interval, generateReportFunc, delayFunc)
	scheduler.Start()
	return scheduler
}
