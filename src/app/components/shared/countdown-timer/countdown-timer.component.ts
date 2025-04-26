import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss']
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() targetDate: Date | string;
  @Input() showDays = true;
  @Input() showHours = true;
  @Input() showMinutes = true;
  @Input() showSeconds = true;
  @Input() primaryColor = '#3f51b5';
  @Input() fontFamily = 'Arial, sans-serif';
  @Input() fontSize = 'normal';
  @Input() compact = false;
  @Output() timerComplete = new EventEmitter<void>();
  @Output() timerTick = new EventEmitter<CountdownValues>();

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  isComplete = false;

  private timerSubscription: Subscription | null = null;

  constructor() { }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(): void {
    if (this.timerSubscription) {
      this.stopTimer();
    }

    const targetDateTime = new Date(this.targetDate).getTime();

    this.timerSubscription = interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const distance = targetDateTime - now;

      if (distance < 0) {
        this.stopTimer();
        this.isComplete = true;
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.timerComplete.emit();
      } else {
        this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
        this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.timerTick.emit({
          days: this.days,
          hours: this.hours,
          minutes: this.minutes,
          seconds: this.seconds,
          totalSeconds: Math.floor(distance / 1000)
        });
      }
    });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  getTimerStyle(): { [key: string]: string } {
    return {
      'font-family': this.fontFamily,
      'color': this.primaryColor
    };
  }
}

export interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}
