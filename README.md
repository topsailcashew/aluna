# Aluna

**Find Your Inner Balance**

Aluna is a comprehensive mental wellness application that helps you understand your emotional landscape through mindful check-ins, pattern recognition, and AI-powered insights. Log your feelings, sensations, and thoughts to uncover patterns and cultivate self-awareness.

## Features

### Core Wellness Tracking

#### Multi-Step Check-In Form
A guided, three-step process to comprehensively log your current state:

**Step 1: Feel - Emotional and Physical State**
- **Interactive Emotion Wheel:** 3-level hierarchical system with 162 distinct emotions
  - Level 1: 6 primary categories (Happy, Sad, Disgusted, Angry, Fearful, Surprised)
  - Level 2: Sub-categories (2-4 per primary)
  - Level 3: Specific emotions (9 per sub-category)
  - Color-coded, multi-select capability with smooth animations
- **Interactive Body Map:** Track physical sensations across 29 body parts
  - Click body regions to log sensations
  - Intensity rating (0-10 scale)
  - Optional descriptive notes (up to 200 characters)
  - Multiple sensations support with visual feedback

**Step 2: Reflect - Thought Patterns**
- Non-judgmental cognitive pattern recognition
- Common thought patterns including:
  - Worrying about the future
  - Dwelling on the past
  - Engaging in self-criticism
  - Black-and-white thinking
  - Feeling grateful or appreciative
  - Planning or problem-solving
  - Simply observing the present
  - Mind wandering or daydreaming

**Step 3: Understand - Context**
- **Context Tags:** Comprehensive environmental and situational tracking
  - Location tracking
  - Activity logging (multiple selections)
  - Trigger identification
  - People present
  - Time of day
- **Journal Entry:** Free-form reflection space (up to 2000 characters)

### Dashboard & Analytics

**Personalized Dashboard**
- Welcome screen with user greeting
- Quick overview of wellness journey
- Quick Actions panel for common tasks

**Key Metrics**
- **Latest Entry Card:** Detailed view of most recent check-in
- **Streak Tracker:** Monitor consistency with check-in streaks
- **Insight of the Day:** AI-generated personalized insights
- **Last Check-in:** Time elapsed since most recent entry
- **Dominant Emotion:** Most frequently logged emotion category
- **Weekly Sensation Average:** Average intensity over past 7 days

**Data Visualizations**
- **Wellness Charts:** Multiple chart types for pattern visualization
  - Sensation intensity timeline with interactive tooltips
  - Emotion distribution donut chart with color-coded legend
- **Trend Lines Chart:** Track changes in emotional state over time
- **Time Heatmap:** Identify temporal patterns in your feelings
- **Monthly Comparisons:** Compare wellness metrics across periods
- **Recent Check-ins:** Last 5 entries with quick review
  - Emotion icons with category-specific colors
  - Sub-category and specific emotions
  - Relative timestamps
  - Sensation counts

### AI-Powered Features

Aluna uses Google's Gemini AI models via Genkit to provide intelligent insights:

- **Pattern Recognition:** Automated detection of recurring emotional and physical patterns
  - Identifies triggers and correlations
  - Recognizes temporal patterns
  - Suggests connections between events and emotions

- **Personalized Insights:** AI-generated observations about your wellness journey
  - Daily insight of the day
  - Context-aware recommendations
  - Trend analysis and predictions

- **Coping Suggestions:** Intelligent coping strategy recommendations
  - Based on your current emotional state
  - Personalized to your check-in history
  - Contextually relevant techniques

- **Reflection Prompts:** AI-generated journal prompts
  - Deepens self-awareness
  - Encourages meaningful reflection
  - Tailored to your patterns

### Life Messages Exercise

A comprehensive therapeutic tool for understanding core beliefs and patterns:

**Features:**
- **Guided Wizard Interface:** Step-by-step journey through self-discovery
- **Feeling Exploration:** Identify and express current emotional states
- **Belief Identification:** Uncover underlying beliefs and assumptions
- **Pattern Recognition:** AI-assisted pattern detection in beliefs
- **Micro-Goal Creator:** Transform insights into actionable steps
- **Crisis Support:** Immediate access to emergency resources
- **Exportable Summary:**
  - PDF export functionality
  - Textual summary generation
  - Canvas-based visualization

**Implementation:**
- Persistent session storage in Firestore
- Resume capability with session IDs
- Drag-and-drop belief organization
- Real-time progress tracking
- Swipeable card interface

### Wellness Tools & Resources

**Breathing Exercises**
- Animated breathing guide
- Box breathing technique
- Visual cues for inhale/exhale cycles

**Emergency Resources**
- Crisis hotline information
- Emergency mental health resources
- Quick access button throughout the app
- Modal with comprehensive support information

**Coping Strategies**
- AI-suggested techniques
- Personalized recommendations
- Evidence-based practices

### User Experience Features

- **Responsive Design:** Fully functional on mobile, tablet, and desktop
- **Dark/Light Theme:** System-aware with manual toggle
- **Smooth Animations:** Polished interactions using Framer Motion
- **Accessibility:** Built with Radix UI primitives for keyboard navigation and screen readers
- **Real-time Synchronization:** Instant data updates using Firestore listeners
- **Loading States:** Smooth skeleton loaders and spinners
- **Empty States:** Helpful prompts when no data is available
- **Form Validation:** Comprehensive validation using Zod schemas
- **Error Handling:** User-friendly toast notifications
- **Swipeable Cards:** Touch-friendly card interactions
- **Snap Scrolling:** Full-height sections with smooth navigation

## Tech Stack

### Frontend
- **[Next.js](https://nextjs.org/)** 15.3.3 - React framework with App Router
- **[React](https://react.dev/)** 18.3.1 - UI library
- **[TypeScript](https://www.typescriptlang.org/)** 5.x - Type-safe development

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)** 3.4.1 - Utility-first CSS framework
- **[ShadCN UI](https://ui.shadcn.com/)** - Pre-built accessible components
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible primitives
- **[Lucide React](https://lucide.dev/)** 0.475.0 - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** 0.3.0 - Theme management
- **[Framer Motion](https://www.framer.com/motion/)** 11.5.7 - Animation library

### Data Visualization
- **[Recharts](https://recharts.org/)** 2.15.1 - Chart library for React

### Backend & Database
- **[Firebase](https://firebase.google.com/)** 11.9.1 - Backend-as-a-Service
  - **Firebase Auth** - User authentication (email/password)
  - **Cloud Firestore** - NoSQL cloud database with real-time sync
  - **Firebase Admin** 13.6.0 - Server-side Firebase SDK
- **Real-time Listeners** - Live data synchronization with `onSnapshot`

### AI Integration
- **[Genkit](https://github.com/firebase/genkit)** 1.20.0 - AI integration framework
- **@genkit-ai/google-genai** 1.20.0 - Google Gemini AI integration
- **@genkit-ai/next** 1.20.0 - Next.js integration for Genkit
- **Google Gemini Models** - Advanced language models for insights

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/)** 7.54.2 - Form state management
- **[Zod](https://zod.dev/)** 3.24.2 - TypeScript-first schema validation
- **@hookform/resolvers** 4.1.3 - Validation resolver integration

### State Management
- **React Context API** - Global state management
- **Custom Hooks** - useUser, useWellnessLog, useCollection, useDoc

### Utilities
- **[date-fns](https://date-fns.org/)** 3.6.0 - Date formatting and manipulation
- **[clsx](https://github.com/lukeed/clsx)** 2.1.1 - Conditional className construction
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** 3.0.1 - Merge Tailwind classes
- **[class-variance-authority](https://cva.style/)** 0.7.1 - Component variants
- **[html2canvas](https://html2canvas.hertzen.com/)** 1.4.1 - Canvas screenshot generation
- **[jsPDF](https://github.com/parallax/jsPDF)** 3.0.3 - PDF generation

### Component Libraries
- **[@dnd-kit](https://dndkit.com/)** - Drag and drop functionality
  - @dnd-kit/core 6.3.1
  - @dnd-kit/sortable 10.0.0
  - @dnd-kit/utilities 3.2.2
- **[@darshanpatel2608/human-body-react](https://www.npmjs.com/package/@darshanpatel2608/human-body-react)** 1.2.9 - Interactive human body visualization
- **[embla-carousel-react](https://www.embla-carousel.com/)** 8.6.0 - Carousel components

### Development Tools
- **[Vitest](https://vitest.dev/)** 2.0.4 - Unit testing framework
- **[@testing-library/react](https://testing-library.com/)** 16.0.0 - React testing utilities
- **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)** 6.4.8 - Custom matchers
- **[jsdom](https://github.com/jsdom/jsdom)** 24.1.1 - DOM implementation for testing
- **genkit-cli** 1.20.0 - Genkit development tools

## Getting Started

### Prerequisites

- **Node.js** v20 or later
- **npm** or **yarn**
- **Firebase Project** with Firestore and Authentication enabled
- **Google AI API Key** for Genkit/Gemini integration

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aluna.git
   cd aluna
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Client Configuration (Public)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin (Server-side)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key

   # Google AI
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key
   ```

4. **Set up Firebase:**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
   - Enable Firebase Authentication with Email/Password provider
   - Create a Cloud Firestore database
   - Generate a service account key for Firebase Admin
   - Deploy Firestore security rules:
     ```bash
     firebase deploy --only firestore:rules
     ```

5. **Set up Google AI:**
   - Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to your `.env.local` file

### Running the Application

**Development server:**
```bash
npm run dev
```
Opens at [http://localhost:9002](http://localhost:9002)

**Genkit AI development:**
```bash
npm run genkit:dev      # Start Genkit dev server
npm run genkit:watch    # Start with hot reload
```

**Testing:**
```bash
npm test                # Run tests
npm run test:deploy     # Test AI connection and deployability
npm run typecheck       # Run TypeScript checks
npm run check           # Run typecheck, tests, and build
```

**Building for production:**
```bash
npm run build           # Build with type checking
npm start               # Start production server
```

## Project Structure

```
aluna/
├── src/
│   ├── actions/              # Server actions for data mutations
│   │   ├── generate-insights.ts
│   │   └── recognize-patterns.ts
│   ├── ai/                   # AI/Genkit configuration
│   │   ├── flows/            # AI flow definitions
│   │   │   ├── generate-insights.ts
│   │   │   ├── generate-journal-prompts.ts
│   │   │   ├── recognize-patterns.ts
│   │   │   └── suggest-coping.ts
│   │   ├── prompts/          # AI prompt templates
│   │   ├── genkit.ts         # Genkit configuration
│   │   └── dev.ts            # Genkit dev server
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Landing page
│   │   ├── login/            # Authentication pages
│   │   ├── signup/
│   │   ├── dashboard/        # Main dashboard
│   │   │   ├── page.tsx
│   │   │   ├── insight-of-the-day.tsx
│   │   │   ├── latest-entry-card.tsx
│   │   │   ├── monthly-comparison.tsx
│   │   │   ├── no-entries.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   ├── recent-check-ins.tsx
│   │   │   ├── stat-cards.tsx
│   │   │   ├── streak-tracker.tsx
│   │   │   ├── time-heatmap.tsx
│   │   │   ├── trend-lines-chart.tsx
│   │   │   └── wellness-charts.tsx
│   │   ├── check-in/         # Check-in form page
│   │   ├── insights/         # AI insights page
│   │   ├── life-messages/    # Life Messages exercise
│   │   ├── profile/          # User profile
│   │   ├── tools/            # Wellness tools
│   │   ├── trends/           # Trend analysis
│   │   └── api/              # API routes
│   │       ├── ai/
│   │       │   ├── insights/
│   │       │   ├── patterns/
│   │       │   ├── coping/
│   │       │   └── reflect/
│   │       └── lifemessages/
│   ├── components/           # React components
│   │   ├── check-in-form.tsx
│   │   ├── emotion-wheel.tsx
│   │   ├── emotion-wheel-wrapper.tsx
│   │   ├── human-body.tsx
│   │   ├── human-body-wrapper.tsx
│   │   ├── interactive-body-map-v2.tsx
│   │   ├── context-tags-selector.tsx
│   │   ├── journal-entry-editor.tsx
│   │   ├── ai-insights-card.tsx
│   │   ├── breathing-animator.tsx
│   │   ├── emergency-resources-button.tsx
│   │   ├── emergency-resources-modal.tsx
│   │   ├── pattern-insights.tsx
│   │   ├── quick-mood-button.tsx
│   │   ├── swipeable-card-container.tsx
│   │   ├── life-messages/    # Life Messages components
│   │   │   ├── BeliefInput.tsx
│   │   │   ├── BeliefPanel.tsx
│   │   │   ├── CrisisModal.tsx
│   │   │   ├── FeelingInput.tsx
│   │   │   ├── LifeMessagesWizard.tsx
│   │   │   ├── MessageCard.tsx
│   │   │   ├── MessageGrid.tsx
│   │   │   ├── MicroGoalCreator.tsx
│   │   │   ├── PatternsStep.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── SummaryCanvas.tsx
│   │   │   └── SummaryTextual.tsx
│   │   ├── layout/           # App layout
│   │   │   └── app-shell.tsx
│   │   └── ui/               # ShadCN/Radix UI components (40+)
│   ├── context/              # React Context providers
│   │   └── wellness-log-provider.tsx
│   ├── firebase/             # Firebase configuration
│   │   ├── config.ts
│   │   ├── provider.tsx
│   │   └── firestore/        # Firestore hooks
│   ├── hooks/                # Custom React hooks
│   │   └── use-toast.tsx
│   ├── lib/                  # Utilities and helpers
│   │   ├── actions.ts        # Server actions
│   │   ├── api-client.ts     # API client utilities
│   │   ├── data.ts           # Static data (emotions, body parts)
│   │   ├── types.ts          # TypeScript types
│   │   ├── types/
│   │   │   └── life-messages.ts
│   │   └── utils.ts          # Utility functions
│   └── test-ai-connection.js # AI deployment tests
├── docs/                     # Documentation
│   ├── blueprint.md          # Design specification
│   └── backend.json          # Firestore schema
├── firestore.rules           # Firestore security rules
├── apphosting.yaml           # Firebase App Hosting config
├── components.json           # ShadCN UI config
└── vitest.config.ts          # Vitest configuration
```

## Data Model

### Wellness Entries
**Collection Path:** `/users/{userId}/wellnessEntries/{entryId}`

```typescript
interface LogEntry {
  id: string;
  date: Timestamp;              // Server timestamp
  emotion: string;              // Level 2 emotion (e.g., "Joyful")
  specificEmotions: string[];   // Level 3 emotions array
  sensations: Sensation[];      // Array of sensation objects
  thoughts: string[];           // Thought pattern IDs
  contextTags?: ContextTags;    // Optional context information
  journalEntry?: string;        // Optional journal text
}

interface Sensation {
  id: string;
  location: string;   // Body part name
  intensity: number;  // 0-10 scale
  notes: string;      // Optional descriptive text
}

interface ContextTags {
  location?: string;
  activity?: string[];
  triggers?: string[];
  people?: string;
  timeOfDay?: string;
}
```

### Life Messages Sessions
**Collection Path:** `/users/{userId}/lifeMessagesSessions/{sessionId}`

```typescript
interface LifeMessageSession {
  sessionId: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  currentStep: number;
  feelings?: string[];
  beliefs?: Belief[];
  patterns?: Pattern[];
  microGoals?: MicroGoal[];
  completed: boolean;
}
```

## Security

- **Firestore Security Rules:** User-specific data access enforcement
- **Authentication Required:** All protected routes require Firebase Auth
- **Schema Validation:** Server-side validation on all write operations
- **Environment Variables:** Sensitive configuration kept secure
- **API Route Protection:** Token verification on all API endpoints
- **Rate Limiting:** Protection against abuse in AI endpoints

## Pages & Routes

| Route | Description | Authentication |
|-------|-------------|----------------|
| `/` | Landing page with app introduction | No |
| `/login` | Email/password sign-in | No |
| `/signup` | New user registration | No |
| `/dashboard` | Main analytics dashboard | Yes |
| `/check-in` | 3-step wellness check-in form | Yes |
| `/insights` | AI-powered insights and patterns | Yes |
| `/trends` | Trend analysis and visualizations | Yes |
| `/life-messages` | Life Messages therapeutic exercise | Yes |
| `/tools` | Wellness tools (breathing, resources) | Yes |
| `/profile` | User profile and settings | Yes |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/insights` | POST | Generate AI insights from check-in data |
| `/api/ai/patterns` | POST | Recognize patterns in wellness data |
| `/api/ai/coping` | POST | Get AI-suggested coping strategies |
| `/api/ai/reflect` | POST | Generate reflection prompts |
| `/api/lifemessages` | POST | Create Life Messages session |
| `/api/lifemessages/[sessionId]` | PUT | Update Life Messages session |

## Testing

The project uses Vitest with React Testing Library:

```bash
npm test              # Run all tests
npm run test:deploy   # Test AI connection
npm run typecheck     # TypeScript validation
npm run check         # Full validation suite
```

**Test Coverage:**
- Component unit tests
- Integration tests for forms
- AI connection tests
- Build validation

## Deployment

### Firebase App Hosting (Recommended)

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

### Alternative Platforms

The app can be deployed on any platform that supports Next.js:
- **Vercel** - One-click deployment
- **Netlify** - Next.js support
- **Cloud Run** - Containerized deployment
- **Any Node.js hosting** - Traditional deployment

**Pre-deployment checklist:**
- ✅ All environment variables configured
- ✅ Firebase security rules deployed
- ✅ Google AI API key configured
- ✅ `npm run check` passes
- ✅ Service account credentials set up

## Performance Considerations

- **Code Splitting:** Automatic route-based splitting
- **Image Optimization:** Next.js automatic image optimization
- **Lazy Loading:** Dynamic imports for heavy components
- **Memoization:** React.memo and useMemo for expensive operations
- **Real-time Listeners:** Efficient Firestore subscriptions
- **Bundle Size:** Optimized dependencies and tree shaking

## Privacy & Ethics

- **Data Ownership:** Users own their wellness data
- **No Tracking:** No third-party analytics or tracking
- **Secure Storage:** All data encrypted at rest in Firestore
- **HIPAA Consideration:** Not HIPAA compliant - not intended for clinical use
- **Crisis Support:** Emergency resources readily available
- **Non-diagnostic:** Tool for self-awareness, not diagnosis

## Accessibility

- **WCAG 2.1 AA Compliance:** Striving for Level AA standards
- **Keyboard Navigation:** Full keyboard support
- **Screen Reader Support:** ARIA labels and semantic HTML
- **Color Contrast:** Meets minimum contrast ratios
- **Focus Indicators:** Clear visual focus states
- **Motion Preferences:** Respects prefers-reduced-motion

## Contributing

This is a personal wellness application. Contributions and feedback are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and all rights are reserved. Contact the repository owner for licensing inquiries.

## Acknowledgments

- **Emotion Wheel:** Inspired by Plutchik's Wheel of Emotions
- **UI Components:** Built with ShadCN UI and Radix UI
- **AI Integration:** Powered by Google Gemini via Genkit
- **Cloud Infrastructure:** Firebase platform
- **Human Body Visualization:** @darshanpatel2608/human-body-react

## Support

For questions, issues, or feedback:
- Open an issue on GitHub
- Contact the development team
- Review documentation in `/docs`

---

**Built with care for mental wellness and self-discovery.**

*Aluna - Your companion in understanding your inner world.*
