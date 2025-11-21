a# Aluna

Aluna is a modern, cloud-based wellness application designed to help you cultivate self-awareness and track your emotional and physical well-being over time. By providing a simple yet powerful interface for daily check-ins, the app empowers you to notice patterns, understand your feelings, and build a healthier relationship with your inner world.

The application features a clean, multi-step interface that guides you through logging your physical sensations, identifying your emotions with a detailed three-level emotion wheel, and recognizing your current thought patterns. Your data is securely stored in the cloud and visualized on a personal dashboard, offering clear insights into your wellness journey.

## Features

### Authentication & User Management
- **Secure User Accounts:** Email/password authentication powered by Firebase Auth
- **Personal Data Privacy:** All wellness entries are user-specific and protected by Firestore security rules
- **Profile Management:** Dedicated profile page for account management and logout

### Multi-Step Check-in Form
A guided, three-step process to comprehensively log your current state:

#### Step 1: Sensation Logging
- **29 Body Parts:** Track sensations in specific locations (Head, Face, Eyes, Ears, Nose, Mouth, Jaw, Neck, Throat, Shoulders, Chest, Upper Back, Lower Back, Stomach, Abdomen, Hips, Arms, Elbows, Wrists, Hands, Fingers, Legs, Thighs, Knees, Ankles, Feet, Toes, Other)
- **Intensity Rating:** Slider from 0-10 to quantify sensation strength
- **Descriptive Notes:** Optional text field (up to 200 characters) to add context
- **Multiple Sensations:** Add and track multiple sensations simultaneously
- **Visual Feedback:** Real-time display of logged sensations as animated pills

#### Step 2: 3-Level Emotion Wheel
An interactive, hierarchical emotion classification system with **162 distinct emotions**:

**Level 1 - 6 Primary Categories:**
- Happy (Orange)
- Sad (Pink)
- Disgusted (Purple)
- Angry (Teal/Blue)
- Fearful (Teal/Green)
- Surprised (Yellow)

**Level 2 - Sub-Categories (2-4 per primary):**
Examples: Peaceful, Joyful, Proud, Optimistic (under Happy); Anxious, Insecure, Scared (under Fearful)

**Level 3 - Specific Emotions (9 per sub-category):**
Detailed emotion vocabulary for precise identification. Example under "Peaceful": Content, Relaxed, Calm, Serene, Tranquil, At Ease, Grounded, Fulfilled, Secure

**Implementation:**
- Interactive SVG-based wheel with smooth animations
- Multi-select capability for Level 3 emotions
- Color-coded by primary category for easy navigation
- Visual feedback with hover effects and center display

#### Step 3: Thought Pattern Identification
A non-judgmental checklist to recognize common cognitive patterns:

1. Worrying about the future
2. Dwelling on the past
3. Engaging in self-criticism
4. Black-and-white thinking
5. Feeling grateful or appreciative
6. Planning or problem-solving
7. Simply observing the present
8. Mind wandering or daydreaming

**Features:** Multi-select checkboxes, optional field

### Insightful Dashboard
A comprehensive analytics page to visualize your wellness data over time:

#### Stat Cards
Three key metrics displayed prominently:
- **Last Check-in:** Time elapsed since your most recent entry
- **Dominant Emotion:** Your most frequently logged primary emotion category
- **Weekly Sensation Average:** Average intensity (0-10 scale) of sensations over the past 7 days

#### Wellness Charts
- **Sensation Intensity Timeline:** Line chart tracking physical sensation intensity over time with interactive tooltips and date formatting
- **Emotion Distribution:** Donut chart showing the breakdown of your primary emotion categories with color-coded legend

#### Recent Entries
- **Last 5 Check-ins:** Quick review list showing:
  - Emotion icon with category-specific background color
  - Sub-category and specific emotions logged
  - Relative time (e.g., "3 days ago")
  - Number of sensations recorded
- **Scrollable Area:** Easy navigation through recent history

### Additional Features
- **Dark/Light Theme Toggle:** System-wide theme switching with next-themes
- **Breathing Tools:** Placeholder page for future mindfulness exercises (Box Breathing coming soon)
- **Real-time Synchronization:** Instant data updates across sessions using Firestore listeners
- **Loading States:** Skeleton loaders for smooth user experience
- **Empty States:** Helpful prompts when no data is available
- **Form Validation:** Comprehensive validation using Zod schemas
- **Error Handling:** Toast notifications for user-friendly error messages
- **Responsive Design:** Mobile-first approach with adaptive layouts
- **Smooth Animations:** Framer Motion for polished interactions
- **Snap Scrolling:** Full-height sections in check-in form with smooth navigation

## Tech Stack

### Core Framework
- **[Next.js](https://nextjs.org/)** 15.3.3 - React framework with App Router
- **[React](https://react.dev/)** 18.3.1 - UI library
- **[TypeScript](https://www.typescriptlang.org/)** 5.x - Type-safe development

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)** 3.4.1 - Utility-first CSS framework
- **[ShadCN UI](https://ui.shadcn.com/)** - 50+ pre-built accessible components
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** 0.3.0 - Theme management

### Data Visualization
- **[Recharts](https://recharts.org/)** 2.15.1 - Chart library for React

### Backend & Database
- **[Firebase](https://firebase.google.com/)** 11.9.1 - Backend-as-a-Service
  - **Firebase Auth** - User authentication
  - **Cloud Firestore** - NoSQL cloud database
  - **Firestore Security Rules** - Data access control
- **Real-time Listeners** - Live data synchronization with `onSnapshot`

### AI Integration
- **[Genkit](https://github.com/firebase/genkit)** 1.20.0 - AI integration framework
- **@genkit-ai/google-genai** 1.20.0 - Google AI integration
- **@genkit-ai/next** 1.20.0 - Next.js integration for Genkit

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/)** 7.54.2 - Form state management
- **[Zod](https://zod.dev/)** 3.24.2 - TypeScript-first schema validation
- **@hookform/resolvers** 4.1.3 - Validation resolver integration

### State Management
- **React Context API** - Global state management
- **Custom Hooks** - useUser, useCollection, useDoc, useTheme

### Utilities
- **[date-fns](https://date-fns.org/)** 3.6.0 - Date formatting and manipulation
- **[clsx](https://github.com/lukeed/clsx)** 2.1.1 - Conditional className construction
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** 3.0.1 - Merge Tailwind classes
- **[class-variance-authority](https://cva.style/)** 0.7.1 - Component variants

### Animations
- **[Framer Motion](https://www.framer.com/motion/)** 11.5.7 - Animation library

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** or **yarn**
- **Firebase Project** with Firestore and Authentication enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your_username_/aluna.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd aluna
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure Firebase:**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
   - Enable Firebase Authentication (Email/Password provider)
   - Create a Firestore database
   - Copy your Firebase config credentials
   - Create a `.env.local` file in the root directory:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

5. **Deploy Firestore Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
/src
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Landing page
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── dashboard/           # Dashboard with analytics
│   ├── check-in/            # Multi-step check-in form
│   ├── profile/             # User profile & logout
│   └── tools/               # Breathing tools (placeholder)
├── components/
│   ├── check-in-form.tsx    # Main 3-step form component
│   ├── emotion-wheel.tsx    # Interactive emotion wheel SVG
│   ├── layout/              # Navigation & app shell
│   └── ui/                  # ShadCN UI components (50+)
├── context/
│   └── wellness-log-provider.tsx  # State management for entries
├── firebase/
│   ├── config.ts            # Firebase credentials
│   ├── provider.tsx         # Firebase context
│   └── firestore/           # Firestore hooks
├── hooks/                   # Custom React hooks
├── lib/
│   ├── data.ts             # Emotion categories, body parts, thought patterns
│   ├── actions.ts          # Server actions with validation
│   └── utils.ts            # Utility functions
└── ai/                      # Genkit AI integration

/docs
├── blueprint.md             # Original design specification
└── backend.json             # Firestore schema

/firestore.rules             # Firestore security rules
/apphosting.yaml             # Firebase App Hosting config
```

## Data Model

### Firestore Collection Path
`/users/{userId}/wellnessEntries/{wellnessEntryId}`

### Document Schema
```typescript
interface LogEntry {
  id: string;
  date: Timestamp;              // Server timestamp
  emotion: string;              // Level 2 emotion (e.g., "Joyful")
  specificEmotions: string[];   // Level 3 emotions array
  sensations: Sensation[];      // Array of sensation objects
  thoughts: string[];           // Thought pattern IDs
}

interface Sensation {
  id: string;
  location: string;   // Body part name
  intensity: number;  // 0-10 scale
  notes: string;      // Optional descriptive text
}
```

## Security

- **Firestore Security Rules** enforce user-specific data access
- Users can only create, read, update, and delete their own wellness entries
- Schema validation on all write operations
- Email/password authentication with Firebase Auth
- Environment variables for sensitive configuration

## Pages & Routes

| Route | Description | Authentication Required |
|-------|-------------|------------------------|
| `/` | Landing page with signup/login | No |
| `/login` | Email/password sign-in | No |
| `/signup` | Email/password registration | No |
| `/dashboard` | Main analytics dashboard | Yes |
| `/check-in` | 3-step wellness check-in form | Yes |
| `/profile` | User profile & sign out | Yes |
| `/tools` | Breathing exercises (coming soon) | Yes |

## Features in Development

- Box Breathing tool
- Additional mindfulness exercises
- Enhanced data analytics
- Export functionality
- Custom emotion categories

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Emotion wheel design inspired by the Plutchik wheel of emotions
- UI components built with ShadCN UI and Radix UI
- Cloud infrastructure powered by Firebase
