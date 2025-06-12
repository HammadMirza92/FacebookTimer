import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { FacebookPageService } from '../../facebook-pages/facebook-page.service';
import { PostService } from '../../../services/post.service';
import { Post, PostStatus } from '../../../models/post.model';
import { Template } from '../../../models/template.model';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface WordGameData {
  word: string;
  scrambled: string;
  hint: string;
  category: string;
  difficulty: number;
}

interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  achievements: string[];
  lastPlayed?: Date;
  bestScores: {
    quiz: number;
    wordScramble: number;
    memory: number;
  };
}

interface MemoryCard {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
  isLogo?: boolean;
  displayIcon?: string;
}

interface ContentIdea {
  text: string;
  category: string;
  favorited: boolean;
  id: number;
}

type TabType = 'overview' | 'action' | 'games' | 'content';
type GameType = 'quiz' | 'wordScramble' | 'memory' | null;
type DifficultyLevel = 'easy' | 'medium' | 'hard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('metricsSection', { static: false }) metricsSection!: ElementRef;
  @ViewChild('actionsSection', { static: false }) actionsSection!: ElementRef;
  @ViewChild('gameSection', { static: false }) gameSection!: ElementRef;
  @ViewChild('contentSection', { static: false }) contentSection!: ElementRef;

  private gameStatsSubject = new BehaviorSubject<GameStats>({
    gamesPlayed: 0,
    totalScore: 0,
    achievements: [],
    bestScores: { quiz: 0, wordScramble: 0, memory: 0 }
  });

  // Core Properties
  currentUser:any;
  templates: Template[] = [];
  recentPosts: Post[] = [];
  loading = true;
  postStatusEnum = PostStatus;
  activeTab: TabType = 'overview';

  // Content Ideas
  contentIdeas: ContentIdea[] = [];
  favoriteIdeas: number[] = [];

  // Game Properties
  activeGame: GameType = null;
  gameStats: GameStats = {
    gamesPlayed: 0,
    totalScore: 0,
    achievements: [],
    bestScores: { quiz: 0, wordScramble: 0, memory: 0 }
  };

  // Quiz Game Properties
  currentQuiz: QuizQuestion | null = null;
  quizScore = 0;
  quizQuestionIndex = 0;
  quizAnswered = false;
  showQuizResult = false;
  selectedAnswer = -1;
  totalQuizQuestions = 10;
  triviaTimeLeft = 30;
  triviaTimer: any;

  // Word Scramble Properties
  currentWordGame: WordGameData | null = null;
  userGuess = '';
  wordGameAttempts = 0;
  maxWordAttempts = 3;
  wordGameCompleted = false;

  // Memory Game Properties
  memoryCards: MemoryCard[] = [];
  flippedCards: number[] = [];
  matchedPairs = 0;
  memoryMoves = 0;
  memoryGameActive = false;
  memoryDifficulty: DifficultyLevel = 'easy';
  memoryGameTimer = 10;
  memoryTimerActive = false;
  memoryTimerInterval: any;
  memoryGameStarted = false;
  showMemoryPreview = true;

  // Professional Content Ideas
  private professionalIdeas: string[] = [
    "Share a detailed behind-the-scenes case study of your most successful project",
    "Create an industry trend analysis with your expert commentary and predictions",
    "Host a live Q&A session addressing your audience's most pressing challenges",
    "Share a personal failure story and the valuable lessons learned from it",
    "Create a step-by-step tutorial solving a common industry problem",
    "Interview a thought leader in your space and share key insights",
    "Conduct a poll asking your audience about their biggest pain points",
    "Share data-driven insights about your industry with visual infographics",
    "Create a 'Day in the Life' content series showcasing your professional routine",
    "Write a thought leadership piece on an emerging trend in your field",
    "Share a tool or resource that has transformed your workflow",
    "Create educational carousel posts breaking down complex concepts",
    "Host a virtual event or webinar on a trending topic",
    "Share customer success stories with detailed metrics and outcomes",
    "Create comparison content helping your audience make informed decisions"
  ];

  // Enhanced Quiz Questions
  private marketingQuizQuestions: QuizQuestion[] = [
    {
      question: "What is the most important metric for measuring email marketing success?",
      options: ["Open Rate", "Click-Through Rate", "Conversion Rate", "Unsubscribe Rate"],
      correctAnswer: 2,
      explanation: "While open rates and CTR are important, conversion rate directly measures how many recipients took the desired action, making it the most valuable metric for ROI.",
      difficulty: 'medium',
      category: 'Email Marketing'
    },
    {
      question: "Which social media platform has the highest average engagement rate?",
      options: ["Facebook", "Instagram", "TikTok", "LinkedIn"],
      correctAnswer: 2,
      explanation: "TikTok currently has the highest average engagement rate at around 5.96%, significantly higher than other platforms due to its algorithm and user behavior.",
      difficulty: 'medium',
      category: 'Social Media'
    },
    {
      question: "What does A/B testing primarily help you optimize?",
      options: ["Audience size", "Content performance", "Budget allocation", "Posting frequency"],
      correctAnswer: 1,
      explanation: "A/B testing allows you to compare different versions of content to determine which performs better with your audience, optimizing for engagement and conversions.",
      difficulty: 'easy',
      category: 'Analytics'
    },
    {
      question: "What is the ideal video length for maximum engagement on Instagram?",
      options: ["15-30 seconds", "30-60 seconds", "1-2 minutes", "3+ minutes"],
      correctAnswer: 1,
      explanation: "Videos between 30-60 seconds tend to perform best on Instagram, providing enough time to deliver value while maintaining viewer attention.",
      difficulty: 'medium',
      category: 'Content Strategy'
    },
    {
      question: "Which metric best indicates brand awareness growth?",
      options: ["Conversion rate", "Reach and impressions", "Click-through rate", "Cost per click"],
      correctAnswer: 1,
      explanation: "Reach and impressions directly measure how many people see your content, making them key indicators of brand visibility and awareness growth.",
      difficulty: 'easy',
      category: 'Brand Marketing'
    },
    {
      question: "What percentage of B2B buyers complete most of their research before contacting sales?",
      options: ["50%", "67%", "75%", "90%"],
      correctAnswer: 2,
      explanation: "Studies show that 75% of B2B buyers complete the majority of their research independently before engaging with sales teams, highlighting the importance of educational content.",
      difficulty: 'hard',
      category: 'B2B Marketing'
    },
    {
      question: "Which content type generates the most leads for B2B companies?",
      options: ["Blog posts", "Whitepapers", "Webinars", "Case studies"],
      correctAnswer: 2,
      explanation: "Webinars consistently generate the highest quality leads for B2B companies, with an average conversion rate of 20-40%.",
      difficulty: 'medium',
      category: 'Lead Generation'
    },
    {
      question: "What is the average ROI of email marketing?",
      options: ["$20 for every $1", "$38 for every $1", "$42 for every $1", "$50 for every $1"],
      correctAnswer: 2,
      explanation: "Email marketing has an average ROI of $42 for every $1 spent, making it one of the most cost-effective marketing channels available.",
      difficulty: 'hard',
      category: 'Email Marketing'
    },
    {
      question: "Which day of the week typically sees the highest social media engagement?",
      options: ["Monday", "Wednesday", "Friday", "Sunday"],
      correctAnswer: 1,
      explanation: "Wednesday typically sees the highest social media engagement rates across most platforms, as people are settled into their weekly routine but not yet thinking about the weekend.",
      difficulty: 'medium',
      category: 'Social Media'
    },
    {
      question: "What is the recommended image-to-text ratio for Facebook ads?",
      options: ["10% text", "20% text", "30% text", "No limit"],
      correctAnswer: 3,
      explanation: "Facebook removed the 20% text rule in 2020. There's now no strict limit, though they still recommend keeping text minimal for better performance.",
      difficulty: 'hard',
      category: 'Paid Advertising'
    }
  ];

  // Enhanced Word Game Data
  private wordGameData: WordGameData[] = [
    { word: "ENGAGEMENT", scrambled: "TNEMEGAGNE", hint: "How actively your audience interacts with content", category: "Metrics", difficulty: 2 },
    { word: "CONVERSION", scrambled: "NOISREVNOC", hint: "When a prospect becomes a paying customer", category: "Sales", difficulty: 3 },
    { word: "ANALYTICS", scrambled: "SCITYLANA", hint: "Data that shows your marketing performance", category: "Data", difficulty: 2 },
    { word: "OPTIMIZATION", scrambled: "NOITAZIMITPO", hint: "Making your campaigns as effective as possible", category: "Strategy", difficulty: 4 },
    { word: "SEGMENTATION", scrambled: "NOITATNEMGES", hint: "Dividing your audience into specific groups", category: "Targeting", difficulty: 3 },
    { word: "ATTRIBUTION", scrambled: "NOITUBIRTTA", hint: "Tracking which touchpoints led to conversions", category: "Analytics", difficulty: 4 },
    { word: "RETARGETING", scrambled: "GNITEGARTER", hint: "Showing ads to people who visited your website", category: "Advertising", difficulty: 3 },
    { word: "PERSONALIZATION", scrambled: "NOITAZILANOSREP", hint: "Customizing content for individual users", category: "Strategy", difficulty: 4 },
    { word: "AUTOMATION", scrambled: "NOITAMOTUA", hint: "Using technology to handle repetitive tasks", category: "Technology", difficulty: 3 },
    { word: "INFLUENCER", scrambled: "RECNEULFNI", hint: "Someone with the power to affect purchasing decisions", category: "Social Media", difficulty: 2 }
  ];

  // Memory Game Icons by Category
  private memoryGameIcons = {
    easy: ['📱', '💼', '📊', '🎯', '📈', '💡'],
    medium: ['📱', '💼', '📊', '🎯', '📈', '💡', '🚀', '⭐', '💻', '📋'],
    hard: ['📱', '💼', '📊', '🎯', '📈', '💡', '🚀', '⭐', '💻', '📋', '🎨', '🔧', '📝', '🎪', '🏆', '🎮']
  };

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : 'Howdey, Buddy!';
    this.initializeComponent();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.loadGameStats();
    this.startDashboardAnimations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearAllTimers();
  }

  // Initialization Methods
  private initializeComponent(): void {
    this.gameStatsSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(500)
    ).subscribe(stats => {
      this.gameStats = stats;
      this.saveGameStats();
    });
  }

  private loadInitialData(): void {
    // Simulate loading with realistic delay
    setTimeout(() => {
      this.loading = false;
      this.generateContentIdeas();
      this.cdr.detectChanges();
    }, 1800);
  }

  private startDashboardAnimations(): void {
    // Trigger staggered animations for dashboard elements
    setTimeout(() => {
      document.querySelectorAll('.metric-card, .action-card, .game-card').forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate-in');
        }, index * 100);
      });
    }, 500);
  }

  // Navigation Methods
  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
    if (tab === 'action') {
       this.actionsSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else if (tab === 'games') {
       this.gameSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else if (tab === 'content') {
       this.contentSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
       this.metricsSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    this.notificationService.showSuccess(`Switched to ${tab} view`);
  }
  // Progress Calculation Methods
  getScoreProgress(): number {
    const maxScore = 1000;
    return Math.min((this.gameStats.totalScore / maxScore) * 100, 100);
  }

  getGamesProgress(): number {
    const targetGames = 20;
    return Math.min((this.gameStats.gamesPlayed / targetGames) * 100, 100);
  }

  getAchievementProgress(): number {
    const maxAchievements = 10;
    return Math.min((this.gameStats.achievements.length / maxAchievements) * 100, 100);
  }

  getIdeasProgress(): number {
    const maxIdeas = 15;
    return Math.min((this.contentIdeas.length / maxIdeas) * 100, 100);
  }

  // Content Ideas Management
  generateContentIdeas(): void {
    const shuffled = [...this.professionalIdeas].sort(() => 0.5 - Math.random());
    const numberOfIdeas = Math.floor(Math.random() * 4) + 5; // 5-8 ideas

    this.contentIdeas = shuffled.slice(0, numberOfIdeas).map((text, index) => ({
      id: Date.now() + index,
      text,
      category: this.getIdeaCategory(text),
      favorited: false
    }));

   // this.notificationService.showSuccess(`Generated ${numberOfIdeas} fresh content ideas! 💡`);
  }

  getIdeaCategory(idea: string): string {
    if (idea.includes('tutorial') || idea.includes('step-by-step')) return 'Tutorial';
    if (idea.includes('case study') || idea.includes('success story')) return 'Case Study';
    if (idea.includes('Q&A') || idea.includes('interview')) return 'Interactive';
    if (idea.includes('trend') || idea.includes('insight')) return 'Industry';
    if (idea.includes('behind-the-scenes') || idea.includes('day in the life')) return 'Personal';
    return 'Strategy';
  }

  copyIdeaToClipboard(idea: string): void {
    navigator.clipboard.writeText(idea).then(() => {
      this.notificationService.showSuccess('Idea copied to clipboard! 📋');
    }).catch(() => {
      this.notificationService.showError('Failed to copy idea. Please try again.');
    });
  }

  toggleFavoriteIdea(index: number): void {
    if (this.contentIdeas[index]) {
      this.contentIdeas[index].favorited = !this.contentIdeas[index].favorited;
      const action = this.contentIdeas[index].favorited ? 'added to' : 'removed from';
      this.notificationService.showSuccess(`Idea ${action} favorites! ⭐`);
    }
  }

  isIdeaFavorited(index: number): boolean {
    return this.contentIdeas[index]?.favorited || false;
  }

  shareIdea(idea: string): void {
    if (navigator.share) {
      navigator.share({
        title: 'Content Idea',
        text: idea
      });
    } else {
      this.copyIdeaToClipboard(idea);
      this.notificationService.showSuccess('Idea copied for sharing! 🔗');
    }
  }

  saveAllIdeas(): void {
    const ideaTexts = this.contentIdeas.map(idea => idea.text);
    localStorage.setItem('savedContentIdeas', JSON.stringify(ideaTexts));
    this.notificationService.showSuccess(`Saved ${ideaTexts.length} ideas for later! 💾`);
  }

  // Game Management Methods
  startGame(gameType: GameType): void {
    if (!gameType) return;

    this.activeGame = gameType;
    this.updateGameStats({ gamesPlayed: this.gameStats.gamesPlayed + 1 });

    switch (gameType) {
      case 'quiz':
        this.startQuizGame();
        break;
      case 'wordScramble':
        this.startWordScrambleGame();
        break;
      case 'memory':
        this.initializeMemoryGame();
        break;
    }

    this.notificationService.showSuccess(`Starting ${this.getGameDisplayName(gameType)}! 🎮`);
  }

  getGameDisplayName(gameType: GameType): string {
    switch (gameType) {
      case 'quiz': return 'Marketing Quiz';
      case 'wordScramble': return 'Word Scramble';
      case 'memory': return 'Memory Match';
      default: return 'Game';
    }
  }

  getGameIcon(gameType: GameType): string {
    switch (gameType) {
      case 'quiz': return 'quiz';
      case 'wordScramble': return 'shuffle';
      case 'memory': return 'memory';
      default: return 'games';
    }
  }

  canPauseGame(): boolean {
    return this.activeGame === 'quiz' && !this.quizAnswered;
  }

  pauseGame(): void {
    if (this.activeGame === 'quiz' && this.triviaTimer) {
      clearInterval(this.triviaTimer);
      this.notificationService.showSuccess('Quiz paused ⏸️');
    }
  }

  closeGame(): void {
    const gameName = this.activeGame ? this.getGameDisplayName(this.activeGame) : 'Game';
    this.activeGame = null;
    this.resetGameStates();
    this.notificationService.showSuccess(`${gameName} closed. Well played! 👏`);
  }

  private resetGameStates(): void {
    this.clearAllTimers();

    // Reset quiz state
    this.currentQuiz = null;
    this.quizScore = 0;
    this.quizQuestionIndex = 0;
    this.quizAnswered = false;
    this.showQuizResult = false;
    this.selectedAnswer = -1;
    this.triviaTimeLeft = 30;

    // Reset word game state
    this.currentWordGame = null;
    this.userGuess = '';
    this.wordGameAttempts = 0;
    this.wordGameCompleted = false;

    // Reset memory game state
    this.memoryCards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.memoryMoves = 0;
    this.memoryGameActive = false;
    this.memoryGameStarted = false;
    this.showMemoryPreview = true;
    this.memoryGameTimer = 10;
    this.memoryTimerActive = false;
  }

  private clearAllTimers(): void {
    if (this.triviaTimer) {
      clearInterval(this.triviaTimer);
      this.triviaTimer = null;
    }
    if (this.memoryTimerInterval) {
      clearInterval(this.memoryTimerInterval);
      this.memoryTimerInterval = null;
    }
  }

  // Quiz Game Implementation
  startQuizGame(): void {
    this.quizQuestionIndex = 0;
    this.quizScore = 0;
    this.selectedAnswer = -1;

    // Shuffle questions for variety
    this.marketingQuizQuestions = [...this.marketingQuizQuestions].sort(() => 0.5 - Math.random());
    this.loadNextQuestion();
  }

  loadNextQuestion(): void {
    if (this.quizQuestionIndex < this.totalQuizQuestions && this.quizQuestionIndex < this.marketingQuizQuestions.length) {
      this.currentQuiz = this.marketingQuizQuestions[this.quizQuestionIndex];
      this.quizAnswered = false;
      this.showQuizResult = false;
      this.selectedAnswer = -1;
      this.startTriviaTimer();
    } else {
      this.endQuizGame();
    }
  }

  answerQuestion(answerIndex: number): void {
    if (this.quizAnswered || !this.currentQuiz) return;

    this.quizAnswered = true;
    this.selectedAnswer = answerIndex;
    this.clearAllTimers();

    if (answerIndex === this.currentQuiz.correctAnswer) {
      this.quizScore++;
      this.notificationService.showSuccess('Correct! Excellent! 🎉');
    } else if (answerIndex === -1) {
      this.notificationService.showError('Time\'s up! ⏰');
    } else {
      this.notificationService.showError('Not quite right. Keep learning! 💪');
    }

    this.showQuizResult = true;

    setTimeout(() => {
      this.quizQuestionIndex++;
      this.loadNextQuestion();
    }, 3500);
  }

  private startTriviaTimer(): void {
    this.triviaTimeLeft = 30;
    this.triviaTimer = setInterval(() => {
      this.triviaTimeLeft--;
      if (this.triviaTimeLeft <= 0) {
        this.answerQuestion(-1);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private endQuizGame(): void {
    const points = this.quizScore * 10;
    this.updateGameStats({ totalScore: this.gameStats.totalScore + points });

    const percentage = (this.quizScore / this.totalQuizQuestions) * 100;

    // Update best score
    if (this.quizScore > this.gameStats.bestScores.quiz) {
      this.updateGameStats({
        bestScores: { ...this.gameStats.bestScores, quiz: this.quizScore }
      });
    }

    // Check for achievements
    this.checkQuizAchievements(percentage);

    this.notificationService.showSuccess(
      `Quiz completed! Score: ${this.quizScore}/${this.totalQuizQuestions} (${Math.round(percentage)}%) +${points} points`
    );
  }

  private checkQuizAchievements(percentage: number): void {
    const achievements = [...this.gameStats.achievements];

    if (percentage >= 80 && !achievements.includes('Quiz Master')) {
      achievements.push('Quiz Master');
      this.notificationService.showSuccess('🏆 Achievement Unlocked: Quiz Master!');
    }

    if (percentage === 100 && !achievements.includes('Perfect Score')) {
      achievements.push('Perfect Score');
      this.notificationService.showSuccess('🏆 Achievement Unlocked: Perfect Score!');
    }

    if (this.gameStats.gamesPlayed >= 10 && !achievements.includes('Dedicated Learner')) {
      achievements.push('Dedicated Learner');
      this.notificationService.showSuccess('🏆 Achievement Unlocked: Dedicated Learner!');
    }

    this.updateGameStats({ achievements });
  }

  getQuizProgress(): number {
    return (this.quizQuestionIndex / this.totalQuizQuestions) * 100;
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  // Word Scramble Game Implementation
  startWordScrambleGame(): void {
    this.loadNewWord();
  }

  private loadNewWord(): void {
    const availableWords = this.wordGameData.filter(word =>
      !this.currentWordGame || word.word !== this.currentWordGame.word
    );

    if (availableWords.length === 0) {
      // If all words used, reshuffle
      this.wordGameData = [...this.wordGameData].sort(() => 0.5 - Math.random());
      this.loadNewWord();
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    this.currentWordGame = availableWords[randomIndex];
    this.userGuess = '';
    this.wordGameAttempts = 0;
    this.wordGameCompleted = false;
  }

  submitWordGuess(): void {
    if (!this.currentWordGame || this.wordGameCompleted || !this.userGuess.trim()) return;

    this.wordGameAttempts++;
    const guess = this.userGuess.trim().toUpperCase();

    if (guess === this.currentWordGame.word) {
      this.wordGameCompleted = true;
      const points = (this.maxWordAttempts - this.wordGameAttempts + 1) * 15;
      this.updateGameStats({ totalScore: this.gameStats.totalScore + points });

      this.notificationService.showSuccess(
        `🎉 Correct! "${this.currentWordGame.word}" (+${points} points)`
      );

      // Check for first-try achievement
      if (this.wordGameAttempts === 1 && !this.gameStats.achievements.includes('Word Wizard')) {
        const achievements = [...this.gameStats.achievements, 'Word Wizard'];
        this.updateGameStats({ achievements });
        this.notificationService.showSuccess('🏆 Achievement Unlocked: Word Wizard!');
      }

      setTimeout(() => this.loadNewWord(), 2500);
    } else if (this.wordGameAttempts >= this.maxWordAttempts) {
      this.notificationService.showError(`Game Over! The word was "${this.currentWordGame.word}"`);
      setTimeout(() => this.loadNewWord(), 2500);
    } else {
      const remaining = this.maxWordAttempts - this.wordGameAttempts;
      this.notificationService.showError(`Not correct! ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
    }

    this.userGuess = '';
  }

  // Memory Game Implementation
  initializeMemoryGame(): void {
    this.resetMemoryGameState();
  }

  startMemoryGame(): void {
    this.resetMemoryGameState();
    this.generateMemoryCards();
    this.startMemoryTimer();
  }

  private resetMemoryGameState(): void {
    this.memoryCards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.memoryMoves = 0;
    this.memoryGameActive = false;
    this.memoryGameStarted = false;
    this.showMemoryPreview = true;
    this.memoryGameTimer = 10;
    this.memoryTimerActive = false;
  }

  generateMemoryCards(): void {
    const difficultyConfig = {
      easy: { pairs: 6 },
      medium: { pairs: 10 },
      hard: { pairs: 16 }
    };

    const config = difficultyConfig[this.memoryDifficulty];
    const icons = this.memoryGameIcons[this.memoryDifficulty].slice(0, config.pairs);
    const cardPairs = [...icons, ...icons];

    // Fisher-Yates shuffle
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    this.memoryCards = cardPairs.map((icon, index) => ({
      id: index,
      icon: icon,
      flipped: true, // Show initially for preview
      matched: false,
      isLogo: false
    }));
  }

  startMemoryTimer(): void {
    this.memoryTimerActive = true;
    this.memoryTimerInterval = setInterval(() => {
      this.memoryGameTimer--;
      if (this.memoryGameTimer <= 0) {
        this.hideAllCards();
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  hideAllCards(): void {
    this.clearAllTimers();
    this.memoryTimerActive = false;
    this.memoryGameActive = true;
    this.memoryGameStarted = true;
    this.showMemoryPreview = false;

    this.memoryCards.forEach(card => {
      card.flipped = false;
      card.isLogo = true;
    });

    this.notificationService.showSuccess('Memory game started! Find the matching pairs! 🧠');
  }

  setMemoryDifficulty(difficulty: DifficultyLevel): void {
    this.memoryDifficulty = difficulty;
    this.notificationService.showSuccess(`Difficulty set to ${difficulty}! 🎯`);
  }

  flipMemoryCard(cardIndex: number): void {
    if (!this.memoryGameActive ||
        !this.memoryGameStarted ||
        this.memoryCards[cardIndex].flipped ||
        this.memoryCards[cardIndex].matched ||
        this.flippedCards.length >= 2) {
      return;
    }

    this.memoryCards[cardIndex].flipped = true;
    this.flippedCards.push(cardIndex);

    if (this.flippedCards.length === 2) {
      this.memoryMoves++;
      setTimeout(() => this.checkMemoryMatch(), 600);
    }
  }

  private checkMemoryMatch(): void {
    const [first, second] = this.flippedCards;

    if (this.memoryCards[first].icon === this.memoryCards[second].icon) {
      // Match found
      this.memoryCards[first].matched = true;
      this.memoryCards[second].matched = true;
      this.matchedPairs++;

      const points = 25;
      this.updateGameStats({ totalScore: this.gameStats.totalScore + points });

      if (this.matchedPairs === this.getTotalPairs()) {
        this.endMemoryGame();
      }

      this.flippedCards = [];
    } else {
      // No match - flip back after delay
      setTimeout(() => {
        this.memoryCards[first].flipped = false;
        this.memoryCards[second].flipped = false;
        this.flippedCards = [];
      }, 1200);
    }
  }

  private endMemoryGame(): void {
    this.memoryGameActive = false;
    const bonusPoints = this.calculateMemoryBonus();
    this.updateGameStats({ totalScore: this.gameStats.totalScore + bonusPoints });

    this.notificationService.showSuccess(
      `🎉 Memory game completed in ${this.memoryMoves} moves! +${bonusPoints} bonus points!`
    );

    // Update best score
    const currentScore = this.memoryMoves;
    if (currentScore < this.gameStats.bestScores.memory || this.gameStats.bestScores.memory === 0) {
      this.updateGameStats({
        bestScores: { ...this.gameStats.bestScores, memory: currentScore }
      });
    }

    this.checkMemoryAchievements();
  }

  private calculateMemoryBonus(): number {
    const perfectMoves = this.getTotalPairs();
    const maxMoves = {
      easy: 12,
      medium: 20,
      hard: 32
    };

    if (this.memoryMoves === perfectMoves) {
      return 100; // Perfect game bonus
    } else if (this.memoryMoves <= maxMoves[this.memoryDifficulty]) {
      return 50; // Good performance bonus
    }
    return 25; // Completion bonus
  }

  private checkMemoryAchievements(): void {
    const achievements = [...this.gameStats.achievements];
    const perfectMoves = this.getTotalPairs();
    const maxMoves = {
      easy: 12,
      medium: 20,
      hard: 32
    };

    if (this.memoryMoves <= maxMoves[this.memoryDifficulty] && !achievements.includes('Memory Master')) {
      achievements.push('Memory Master');
      this.notificationService.showSuccess('🏆 Achievement Unlocked: Memory Master!');
    }

    if (this.memoryMoves === perfectMoves && !achievements.includes('Perfect Memory')) {
      achievements.push('Perfect Memory');
      this.notificationService.showSuccess('🏆 Achievement Unlocked: Perfect Memory!');
    }

    if (this.memoryDifficulty === 'hard' && this.memoryMoves <= 20 && !achievements.includes('Memory Genius')) {
      achievements.push('Memory Genius');
      this.notificationService.showSuccess('🏆 Achievement Unlocked: Memory Genius!');
    }

    this.updateGameStats({ achievements });
  }

  restartMemoryGame(): void {
    this.startMemoryGame();
    this.notificationService.showSuccess('Memory game restarted! 🔄');
  }

  getTotalPairs(): number {
    return this.memoryGameIcons[this.memoryDifficulty].length;
  }

  // Game Stats Management
  private updateGameStats(updates: Partial<GameStats>): void {
    const newStats = { ...this.gameStats, ...updates };
    this.gameStats = newStats;
    this.gameStatsSubject.next(newStats);
  }

  private loadGameStats(): void {
    try {
      const saved = localStorage.getItem('professionalDashboardGameStats');
      if (saved) {
        const parsedStats = JSON.parse(saved);
        this.gameStats = { ...this.gameStats, ...parsedStats };
        this.gameStatsSubject.next(this.gameStats);
      }
    } catch (error) {
      console.warn('Failed to load game stats:', error);
      this.resetGameStats();
    }
  }

  private saveGameStats(): void {
    try {
      localStorage.setItem('professionalDashboardGameStats', JSON.stringify(this.gameStats));
    } catch (error) {
      console.warn('Failed to save game stats:', error);
    }
  }

  resetGameStats(): void {
    this.gameStats = {
      gamesPlayed: 0,
      totalScore: 0,
      achievements: [],
      bestScores: { quiz: 0, wordScramble: 0, memory: 0 }
    };
    this.gameStatsSubject.next(this.gameStats);
    this.notificationService.showSuccess('Game statistics reset! 🔄');
  }

  // Achievement System
  getAchievementIcon(achievement: string): string {
    const iconMap: { [key: string]: string } = {
      'Quiz Master': 'school',
      'Perfect Score': 'star',
      'Word Wizard': 'spellcheck',
      'Memory Master': 'psychology',
      'Perfect Memory': 'brilliant',
      'Memory Genius': 'memory',
      'Dedicated Learner': 'book',
      'Speed Demon': 'speed',
      'Consistent Player': 'trending_up'
    };
    return iconMap[achievement] || 'emoji_events';
  }

  formatAchievementName(achievement: string): string {
    return achievement.replace(/([A-Z])/g, ' $1').trim();
  }

  // Navigation and Actions
  createNewPost(): void {
    this.notificationService.showSuccess('Opening post creator... ✍️');
    this.router.navigate(['/posts/create']);
  }

  linkFacebookPage(): void {

    this.notificationService.showSuccess('Opening Facebook page manager... 📘');
    this.router.navigate(['/facebook-pages']);
  }

  viewAllTemplates(): void {
    this.notificationService.showSuccess('Loading template gallery... 🎨');
    this.router.navigate(['/templates']);
  }

  viewAnalytics(): void {
    this.notificationService.showSuccess('Opening analytics dashboard... 📊');
    this.router.navigate(['/analytics']);
  }

  viewInspirationHub(): void {
    this.notificationService.showSuccess('Exploring inspiration hub... 🚀');
    this.router.navigate(['/inspiration']);
  }

  // Utility Methods
  getMotivationalMessage(): string {
    const { gamesPlayed, totalScore, achievements } = this.gameStats;

    if (gamesPlayed === 0) {
      return "Ready to boost your marketing skills? 🎮";
    } else if (gamesPlayed < 5) {
      return "Great start! Keep building your expertise! 🌟";
    } else if (totalScore > 1000) {
      return "Outstanding performance! You're a marketing pro! 🔥";
    } else if (achievements.length > 3) {
      return "Achievement collector! Impressive dedication! 🏆";
    } else {
      return "Excellent progress! Keep up the momentum! 💪";
    }
  }

  getEncouragementMessage(): string {
    const messages = [
      "Every expert was once a beginner! 🎯",
      "Consistency beats perfection! ✨",
      "You're building valuable skills! 📚",
      "Knowledge is your competitive advantage! 🚀",
      "Learning never goes out of style! 💡",
      "Your growth mindset is inspiring! 🌱",
      "Progress over perfection! 💯"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Array helper for template iteration
  range(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  // Post status utility
  getPostStatusClass(status: PostStatus): string {
    switch (status) {
      case PostStatus.Draft:
        return 'status-draft';
      case PostStatus.Scheduled:
        return 'status-scheduled';
      case PostStatus.Published:
        return 'status-published';
      case PostStatus.Failed:
        return 'status-failed';
      case PostStatus.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  // Performance tracking
  trackUserInteraction(action: string, details?: any): void {
    // In a real app, this would send analytics data
    console.log('User interaction:', action, details);
  }

  // Theme and personalization
  getUserPreferences(): any {
    try {
      return JSON.parse(localStorage.getItem('userPreferences') || '{}');
    } catch {
      return {};
    }
  }

  updateUserPreferences(preferences: any): void {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  // Error handling
  handleError(error: any, userMessage: string): void {
    console.error('Dashboard error:', error);
    this.notificationService.showError(userMessage);
  }

  // Component cleanup
  private performCleanup(): void {
    this.clearAllTimers();
    this.saveGameStats();
    // Additional cleanup tasks
  }
}
