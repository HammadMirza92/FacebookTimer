import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss']
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() targetDate!: Date;
  @Input() showDays: boolean = true;
  @Input() showHours: boolean = true;
  @Input() showMinutes: boolean = true;
  @Input() showSeconds: boolean = true;
  @Input() primaryColor: string = 'white';
  @Input() fontFamily: string = 'Arial, sans-serif';

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  isEventPassed: boolean = false;

  private timerSubscription?: Subscription;

  constructor() { }

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startCountdown(): void {
    // Update immediately when component initializes
    this.updateCountdown();

    // Then update every second
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateCountdown();
    });
  }

  updateCountdown(): void {
    const now = new Date();
    const eventDate = new Date(this.targetDate);

    // Calculate difference in milliseconds
    const diff = eventDate.getTime() - now.getTime();

    if (diff <= 0) {
      // Event has already passed
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      this.isEventPassed = true;

      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
      return;
    }

    // Calculate time units
    const totalSeconds = Math.floor(diff / 1000);

    // Calculate days, hours, minutes, seconds
    this.days = Math.floor(totalSeconds / (3600 * 24));
    this.hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    this.minutes = Math.floor((totalSeconds % 3600) / 60);
    this.seconds = totalSeconds % 60;

    this.isEventPassed = false;
  }

  // Helper function to display numbers with leading zeros
  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
