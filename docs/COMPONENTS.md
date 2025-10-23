# Frontend Component Documentation

## Table of Contents

- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Feature Components](#feature-components)
- [Hooks](#custom-hooks)
- [State Management](#state-management)
- [Styling Guide](#styling-guide)

---

## Project Structure

```
frontend/src/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Authentication routes
│   │   ├── login/            # Login page
│   │   ├── logout/           # Logout page
│   │   └── register/         # Registration page
│   ├── (main)/                # Main application routes
│   ├── (planner)/             # Meal planner routes
│   │   └── planner/          # Planner page
│   ├── components/            # All React components
│   │   ├── auth/             # Authentication components
│   │   ├── collections/      # Food collection components
│   │   ├── common/           # Shared UI components
│   │   ├── icon/             # Icon components
│   │   ├── layout/           # Layout components
│   │   └── planner/          # Planner-specific components
│   ├── features/              # Redux feature slices
│   │   ├── auth/             # Auth slice
│   │   └── profile/          # Profile slice
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Redux store configuration
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
│
├── lib/                       # External libraries & API clients
│   ├── api/                  # API client functions
│   └── utils.ts              # Utility functions
│
├── types/                     # Global TypeScript types
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── collection.types.ts
│   ├── food.types.ts
│   └── profile.types.ts
│
└── middleware.ts              # Next.js middleware
```

---

## Core Components

### Layout Components

#### `Header`

Main application header/navigation bar with authentication state.

**Location:** `app/components/layout/Header.tsx`

**Props:** No props (uses Redux state)

**Features:**

- Responsive design with mobile menu
- User profile dropdown
- Active route highlighting
- Authentication-aware navigation
- Integration with NProgress for route transitions

**Usage:**

```tsx
import Header from "@/app/components/layout/Header";

<Header />;
```

---

#### `Sidebar`

Side navigation for dashboard and main application areas.

**Location:** `app/components/layout/Sidebar.tsx`

**Props:**

```typescript
interface SidebarProps {
	isOpen?: boolean;
}
```

**Features:**

- Menu items with icons
- Active route highlighting
- Dashboard, Macros, Planner, Collection navigation

**Usage:**

```tsx
<Sidebar isOpen={true} />
```

---

#### `Footer`

Application footer with links and information.

**Location:** `app/components/layout/Footer.tsx`

**Usage:**

```tsx
import Footer from "@/app/components/layout/Footer";

<Footer />;
```

---

#### `LoadingSpinner`

Loading indicator component.

**Location:** `app/components/layout/LoadingSpinner.tsx`

**Usage:**

```tsx
<LoadingSpinner />
```

---

#### `ProgressBar`

Top-of-page progress bar for route transitions using NProgress.

**Location:** `app/components/common/ProgressBar.tsx`

**Features:**

- Automatic integration with Next.js navigation
- Configured with custom speed and appearance

**Usage:**

```tsx
import ProgressBar from "@/app/components/common/ProgressBar";

// In layout
<ProgressBar />;
```

---

### Common Components

#### `NxInput`

Custom input component with password visibility toggle.

**Location:** `app/components/common/NxInput.tsx`

**Props:**

```typescript
interface NxInputProps {
	id: string;
	name: string;
	label: string;
	type?: "text" | "email" | "password";
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	required?: boolean;
	minLength?: number;
	placeholder?: string;
}
```

**Features:**

- Password visibility toggle
- Styled label and input
- Support for validation attributes

**Usage:**

```tsx
<NxInput
	id="email"
	name="email"
	label="Email Address"
	type="email"
	value={email}
	onChange={handleChange}
	required
/>
```

---

#### `FoodDetailModal`

Modal for displaying detailed food information.

**Location:** `app/components/common/FoodDetailModal.tsx`

**Usage:**

```tsx
<FoodDetailModal
	isOpen={showModal}
	onClose={() => setShowModal(false)}
	foodData={selectedFood}
/>
```

---

## Feature Components

### Authentication Components

#### `LoginForm`

User login form with validation and Redux integration.

**Location:** `app/components/layout/LoginForm.tsx`

**Props:** No props (self-contained)

**State (from Redux):**

```typescript
const { isLoading, error, isAuthenticated } = useAppSelector(
	(state) => state.auth
);
```

**Features:**

- Email and password validation
- Error handling and display
- Loading state
- Auto-redirect on successful login
- Social login buttons (Google, GitHub)
- Integration with authSlice

**Usage:**

```tsx
import LoginForm from "@/app/components/layout/LoginForm";

<LoginForm />;
```

---

#### `RegisterForm`

New user registration form with validation.

**Location:** `app/components/layout/RegisterForm.tsx`

**Props:** No props (self-contained)

**Features:**

- Email and password validation
- Password confirmation
- Terms and conditions checkbox
- Error handling
- Auto-login after successful registration
- Redirect to planner page

**Validation:**

- Email format validation
- Password strength (min 8 characters)
- Password confirmation match
- Required fields check
- Terms acceptance

**Usage:**

```tsx
import RegisterForm from "@/app/components/layout/RegisterForm";

<RegisterForm />;
```

---

#### `AuthProvider`

Authentication context provider.

**Location:** `app/components/auth/AuthProvider.tsx`

**Usage:**

```tsx
import AuthProvider from "@/app/components/auth/AuthProvider";

<AuthProvider>{children}</AuthProvider>;
```

---

### Food Collection Components

#### `ImageGrid`

Grid display for food images with meal type filtering.

**Location:** `app/components/collections/ImageGrid.tsx`

**Props:**

```typescript
interface ImageGridProps {
	images: FoodImage[];
	selectedImages: Set<string>;
	onImageClick: (image: FoodImage) => void;
	onSelectImage: (imageId: string) => void;
	onDeleteImage: (imageId: string) => void;
}

interface FoodImage {
	id: string;
	imageUrl: string;
	date: string;
	mealType: "breakfast" | "lunch" | "dinner" | "snack";
	analyzed: boolean;
	createdAt: string;
	nutritionData?: NutritionData;
}
```

**Features:**

- Responsive grid layout (1-4 columns)
- Meal type badges with colors
- Date formatting
- Image selection
- Delete functionality
- Analyzed status indicator

**Usage:**

```tsx
<ImageGrid
	images={foodImages}
	selectedImages={selectedSet}
	onImageClick={handleImageClick}
	onSelectImage={handleSelect}
	onDeleteImage={handleDelete}
/>
```

---

#### `UploadImageModal`

Modal for uploading food images with metadata.

**Location:** `app/components/collections/UploadImageModal.tsx`

**Props:**

```typescript
interface UploadImageModalProps {
	onClose: () => void;
	onSuccess: (image: FoodImage) => void;
	initialMealType?: "breakfast" | "lunch" | "dinner" | "snack";
	initialDate?: Date;
}
```

**Features:**

- Image file selection with preview
- Meal type selection
- Date picker
- File size validation (max 10MB)
- Image type validation
- Upload progress indication

**Usage:**

```tsx
<UploadImageModal
	onClose={() => setShowModal(false)}
	onSuccess={handleUploadSuccess}
	initialMealType="lunch"
	initialDate={new Date()}
/>
```

---

#### `ImageDetailModal`

Modal for viewing detailed food image information.

**Location:** `app/components/collections/ImageDetailModal.tsx`

**Features:**

- Full-size image display
- Nutrition information
- Meal type and date
- Edit and delete actions

---

#### `NutritionAnalysisModal`

Modal displaying AI-analyzed nutrition information.

**Location:** `app/components/collections/NutritionAnalysisModal.tsx`

**Features:**

- Detailed macro breakdown
- Calorie information
- Micronutrients display
- AI confidence score

---

#### `FilterBar`

Filtering controls for food collection.

**Location:** `app/components/collections/FilterBar.tsx`

**Features:**

- Date range selection
- Meal type filter
- Search functionality
- Sort options

---

### Planner Components

#### `MealsSection`

Main meal planning interface with image uploads for each meal.

**Location:** `app/components/planner/MealsSection.tsx`

**Props:**

```typescript
interface MealsSectionProps {
	selectedDate?: Date;
}
```

**Features:**

- Breakfast, Lunch, Dinner sections
- Image upload for each meal
- Display meal images
- Remove image functionality
- Integration with UploadImageModal

**Usage:**

```tsx
<MealsSection selectedDate={new Date()} />
```

---

#### `MealCard`

Individual meal card display.

**Location:** `app/components/planner/MealCard.tsx`

**Features:**

- Meal image display
- Nutrition summary
- Edit and delete actions

---

#### `NutritionPanel`

Comprehensive nutrition tracking panel with charts.

**Location:** `app/components/planner/NutritionPanel.tsx`

**Props:**

```typescript
interface NutritionPanelProps {
	data?: NutritionData;
	targets?: NutritionTargets;
}

interface NutritionData {
	calories: number;
	carbs: number;
	fat: number;
	protein: number;
	fiber: number;
	sodium: number;
	cholesterol: number;
}

interface NutritionTargets {
	calories: number;
	carbs: string;
	fat: string;
	protein: string;
	fiber: number;
}
```

**Features:**

- Doughnut chart for macros visualization (Chart.js)
- Calorie tracking with progress
- Macro breakdown (Carbs, Fat, Protein)
- Micronutrients display (Fiber, Sodium, Cholesterol)
- Target vs actual comparison
- Meal timing suggestions
- Hydration tips

**Usage:**

```tsx
<NutritionPanel data={nutritionData} targets={userTargets} />
```

---

#### `DateNavigator`

Date selection and navigation component.

**Location:** `app/components/planner/DateNavigator.tsx`

**Features:**

- Previous/Next day navigation
- Calendar date picker
- Today quick select

---

#### `PlannerSidebar`

Sidebar for planner page with quick actions.

**Location:** `app/components/planner/PlannerSidebar.tsx`

**Features:**

- Quick meal templates
- Recent meals
- Favorite foods
- Nutrition goals summary

---

### Icon Components

**Location:** `app/components/icon/`

Available icons:

- `Logo.tsx` - Application logo
- `ProfileIcon.tsx` - User profile icon
- `ChatbotIcon.tsx` - Chatbot/AI assistant icon
- `GoogleIcon.tsx` - Google logo
- `GithubIcon.tsx` - GitHub logo
- `EyeOffIcon.tsx` - Password hide icon
- `EyeOpenIcon.tsx` - Password show icon
- `ClockIcon.tsx` - Time/clock icon
- `SmileIcon.tsx` - Happy/smile icon
- `AlertCircleIcon.tsx` - Alert icon
- `AlertTriangleIcon.tsx` - Warning icon
- `RefreshIcon.tsx` - Refresh/reload icon
- `MoreVerticalIcon.tsx` - More options menu icon

**Usage:**

```tsx
import Logo from "@/app/components/icon/Logo";
import { COLORS } from "@/app/utils/constants";

<Logo width={32} height={32} style={{ color: COLORS.primary.DEFAULT }} />;
```

---

## Custom Hooks

### `useClickOutside`

Detect clicks outside a referenced element.

**Location:** `app/hooks/useClickOutside.ts`

**Usage:**

```tsx
import { useRef } from "react";
import { useClickOutside } from "@/app/hooks/useClickOutside";

const MyComponent = () => {
	const dropdownRef = useRef<HTMLDivElement>(null);

	useClickOutside(dropdownRef, () => {
		// Close dropdown when clicking outside
		setIsOpen(false);
	});

	return <div ref={dropdownRef}>Dropdown content</div>;
};
```

**Common Use Cases:**

- Closing dropdowns
- Dismissing modals
- Hiding tooltips
- Closing mobile menus

---

### Redux Hooks

**Location:** `app/store/hooks.ts`

**Typed Hooks:**

```typescript
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";

// Use these instead of plain useDispatch and useSelector
const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);
```

**Benefits:**

- Full TypeScript type inference
- RootState and AppDispatch types
- No need to type annotations in components

**Usage Example:**

```tsx
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { loginUser } from '@/app/features/auth/authSlice';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async (email: string, password: string) => {
    await dispatch(loginUser({ email, password }));
  };

  return (
    // ... component JSX
  );
}
```

---

## State Management

### Redux Store Structure

**Location:** `app/store/store.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import profileReducer from "../features/profile/profileSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		profile: profileReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Root State Structure:**

```typescript
interface RootState {
	auth: AuthState;
	profile: ProfileState;
}
```

---

### Auth Slice

**Location:** `app/features/auth/authSlice.ts`

**State:**

```typescript
interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}
```

**Async Thunks:**

- `registerUser(credentials)` - Register new user
- `loginUser({ email, password })` - Authenticate user
- `logoutUser()` - Clear auth state and cookies
- `checkAuth()` - Verify current authentication status

**Synchronous Actions:**

- `setUser(user)` - Update user data
- `clearError()` - Clear error state
- `setToken(token)` - Set authentication token

**Usage:**

```tsx
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { loginUser, logoutUser, clearError } from '@/app/features/auth/authSlice';

function AuthComponent() {
  const dispatch = useAppDispatch();
  const { user, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogin = async (email: string, password: string) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Success
    } catch (err) {
      // Error handled by slice
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    // ... component JSX
  );
}
```

---

### Profile Slice

**Location:** `app/features/profile/profileSlice.ts`

**State:**

```typescript
interface ProfileState {
	profile: UserProfile | null;
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;
	lastUpdated: string | null;
}
```

**Async Thunks:**

- `getMyProfile()` - Fetch current user's profile
- `updateMyProfile(data)` - Update profile information
- `createMyProfile(data)` - Create new profile
- `deleteMyProfile()` - Delete user profile

**Synchronous Actions:**

- `clearError()` - Clear error state
- `resetProfile()` - Reset profile state

**Usage:**

```tsx
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { getMyProfile, updateMyProfile } from '@/app/features/profile/profileSlice';

function ProfileComponent() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isSaving, error } = useAppSelector((state) => state.profile);

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  const handleUpdate = async (data: UserProfileUpdate) => {
    try {
      await dispatch(updateMyProfile(data)).unwrap();
      // Success - profile updated
    } catch (err) {
      // Error handled by slice
    }
  };

  return (
    // ... component JSX
  );
}
```

---

### Redux Provider

**Location:** `app/store/ReduxProvider.tsx`

**Usage:**

```tsx
import ReduxProvider from "@/app/store/ReduxProvider";

// In root layout
<ReduxProvider>{children}</ReduxProvider>;
```

---

## Styling Guide

### Tailwind CSS Configuration

The project uses Tailwind CSS for styling with custom configuration.

**Color Palette (from `app/utils/constants.ts`):**

```typescript
export const COLORS = {
	primary: {
		DEFAULT: "#FF6B35", // Orange
		light: "#FF8C61",
		dark: "#E55A2B",
	},
	text: {
		primary: "#1F2937", // Gray-900
		secondary: "#4B5563", // Gray-600
	},
	// ... other colors
};
```

**Common CSS Classes:**

```css
/* Card */
.card {
	@apply bg-white rounded-lg shadow-md p-6;
}

/* Button Primary */
.btn-primary {
	@apply bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors;
}

/* Input */
.input {
	@apply w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none;
}

/* Grid Layout */
.grid-responsive {
	@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
}
```

---

### Common UI Patterns

#### Modal Overlay

```tsx
<div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
	<div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
		{/* Modal content */}
	</div>
</div>
```

#### Card Container

```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
	{/* Card content */}
</div>
```

#### Button Variants

```tsx
// Primary Button
<button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
  Primary Action
</button>

// Secondary Button
<button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
  Secondary Action
</button>

// Outline Button
<button className="border-2 border-orange-600 text-orange-600 px-4 py-2 rounded-md hover:bg-orange-50 transition-colors">
  Outline Action
</button>

// Icon Button
<button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
  <IconComponent className="w-5 h-5" />
</button>
```

#### Input Field

```tsx
<div>
	<label className="block text-sm font-medium mb-2 text-gray-700">
		Field Label
	</label>
	<input
		type="text"
		className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
		placeholder="Enter value..."
	/>
</div>
```

#### Badge/Tag

```tsx
{/* Meal Type Badge */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
  Breakfast
</span>

<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Lunch
</span>

<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  Dinner
</span>
```

---

### Responsive Design

**Breakpoints:**

- `sm`: 640px - Small devices (tablets)
- `md`: 768px - Medium devices (landscape tablets)
- `lg`: 1024px - Large devices (laptops)
- `xl`: 1280px - Extra large devices (desktops)
- `2xl`: 1536px - 2X large devices (large desktops)

**Responsive Grid Example:**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
	{/* Grid items */}
</div>
```

**Responsive Text:**

```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
	Responsive Heading
</h1>
```

**Responsive Padding:**

```tsx
<div className="p-4 sm:p-6 md:p-8 lg:p-10">{/* Content */}</div>
```

---

### Animation Classes

The project uses Tailwind's built-in animations and custom animations:

```tsx
{/* Fade in */}
<div className="animate-in fade-in duration-200">

{/* Zoom in */}
<div className="animate-in zoom-in-95 duration-200">

{/* Slide in from bottom */}
<div className="animate-in slide-in-from-bottom duration-300">

{/* Spin (for loading) */}
<div className="animate-spin">

{/* Pulse */}
<div className="animate-pulse">
```

---

### NProgress Styling

For route transition progress bar:

```typescript
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
	showSpinner: false,
	trickleSpeed: 200,
	minimum: 0.08,
});
```

**Custom NProgress CSS** (in `globals.css`):

```css
#nprogress .bar {
	background: #ff6b35 !important;
	height: 3px;
}

#nprogress .peg {
	box-shadow: 0 0 10px #ff6b35, 0 0 5px #ff6b35;
}
```

---

## TypeScript Types

### Main Type Files

**Location:** `types/` and `app/types/`

#### Authentication Types

**File:** `types/auth.types.ts`

```typescript
export interface User {
	id: string;
	email: string;
	username?: string;
	createdAt: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}
```

#### Collection Types

**File:** `types/collection.types.ts`

```typescript
export interface FoodImage {
	id: string;
	imageUrl: string;
	date: string;
	mealType: "breakfast" | "lunch" | "dinner" | "snack";
	analyzed: boolean;
	createdAt: string;
	nutritionData?: NutritionData;
}

export interface NutritionData {
	calories: number;
	carbs: number;
	protein: number;
	fat: number;
	fiber?: number;
	sodium?: number;
	cholesterol?: number;
}
```

#### Profile Types

**File:** `types/profile.types.ts`

```typescript
export interface UserProfile {
	id: string;
	userId: string;
	name?: string;
	age?: number;
	gender?: "male" | "female" | "other";
	height?: number;
	weight?: number;
	activityLevel?: string;
	dietaryGoal?: string;
	targetCalories?: number;
	targetProtein?: number;
	targetCarbs?: number;
	targetFat?: number;
}

export interface UserProfileUpdate {
	name?: string;
	age?: number;
	gender?: "male" | "female" | "other";
	height?: number;
	weight?: number;
	activityLevel?: string;
	dietaryGoal?: string;
}

export interface ProfileState {
	profile: UserProfile | null;
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;
	lastUpdated: string | null;
}
```

#### API Types

**File:** `types/api.types.ts`

```typescript
export interface ApiError {
	detail: string;
	status?: number;
}

export interface ApiResponse<T> {
	data: T;
	message?: string;
	status: number;
}
```

---

## Best Practices

### 1. Component Organization

- **Keep components small and focused** - Single responsibility principle
- **Use composition over inheritance** - Compose complex UIs from simple components
- **Extract reusable logic to custom hooks** - Keep component logic DRY
- **Co-locate related files** - Keep styles, tests, and components together when appropriate

**Example:**

```tsx
// ✅ Good - Small, focused component
function UserAvatar({ src, name }: { src: string; name: string }) {
	return <img src={src} alt={name} className="w-10 h-10 rounded-full" />;
}

// ✅ Good - Composition
function UserCard({ user }: { user: User }) {
	return (
		<div className="card">
			<UserAvatar src={user.avatar} name={user.name} />
			<UserInfo user={user} />
			<UserActions user={user} />
		</div>
	);
}
```

### 2. Type Safety

- **Define interfaces for all props** - Use TypeScript interfaces/types
- **Use TypeScript strict mode** - Enable strict type checking
- **Avoid `any` type** - Use `unknown` or proper types instead
- **Leverage type inference** - Let TypeScript infer types when possible

**Example:**

```typescript
// ✅ Good - Proper typing
interface ButtonProps {
	variant: "primary" | "secondary";
	onClick: () => void;
	children: React.ReactNode;
	disabled?: boolean;
}

// ❌ Bad - Using any
interface BadProps {
	data: any;
	callback: any;
}
```

### 3. Performance

- **Use React.memo for expensive renders** - Prevent unnecessary re-renders
- **Implement proper key props in lists** - Use stable, unique keys
- **Lazy load routes and components** - Use Next.js dynamic imports
- **Optimize images** - Use Next.js Image component

**Example:**

```tsx
// ✅ Good - Memoized component
const ExpensiveComponent = React.memo(({ data }: { data: Data }) => {
	// Expensive computation
	return <div>{/* ... */}</div>;
});

// ✅ Good - Lazy loading
const DynamicComponent = dynamic(() => import("./HeavyComponent"), {
	loading: () => <LoadingSpinner />,
});
```

### 4. State Management

- **Use Redux for global state** - Auth, user profile, app-wide settings
- **Use local state for component-specific data** - Form inputs, UI toggles
- **Use URL state for shareable state** - Filters, pagination, search params
- **Avoid prop drilling** - Use Context or Redux for deeply nested components

### 5. Accessibility

- **Use semantic HTML** - `<button>`, `<nav>`, `<main>`, `<article>`, etc.
- **Add ARIA labels** - For screen readers
- **Ensure keyboard navigation** - All interactive elements must be keyboard accessible
- **Maintain color contrast** - WCAG AA compliance minimum

**Example:**

```tsx
// ✅ Good - Accessible button
<button
  type="button"
  aria-label="Close modal"
  onClick={onClose}
  className="..."
>
  <CloseIcon aria-hidden="true" />
</button>

// ✅ Good - Semantic navigation
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/planner">Planner</a></li>
  </ul>
</nav>
```

### 6. Error Handling

- **Handle API errors gracefully** - Show user-friendly messages
- **Use error boundaries** - Catch React errors
- **Validate user input** - Client-side and server-side validation
- **Log errors for debugging** - Use proper logging services

### 7. Code Style

- **Use consistent formatting** - Prettier configuration
- **Follow naming conventions** - PascalCase for components, camelCase for functions
- **Add meaningful comments** - Explain "why", not "what"
- **Keep functions small** - Single responsibility

---

## API Integration

### API Client Structure

**Location:** `lib/api/`

Available API clients:

- `auth.api.ts` - Authentication endpoints
- `profile.api.ts` - User profile endpoints
- `food.api.ts` - Food management endpoints
- `collection.api.ts` - Food image collection endpoints

**Example Usage:**

```typescript
import { authApi } from "@/lib/api/auth.api";
import { profileApi } from "@/lib/api/profile.api";

// Login
const user = await authApi.login({ email, password });

// Get profile
const profile = await profileApi.getMyProfile();

// Update profile
const updatedProfile = await profileApi.updateProfile(data);
```

---

## Testing Guidelines

### Component Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import LoginForm from "@/app/components/layout/LoginForm";

describe("LoginForm", () => {
	it("should render email and password inputs", () => {
		render(<LoginForm />);
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
	});

	it("should call onSubmit when form is submitted", async () => {
		const onSubmit = jest.fn();
		render(<LoginForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByRole("button", { name: /login/i }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalled();
		});
	});
});
```

---

## Common Utilities

### Constants

**Location:** `app/utils/constants.ts`

```typescript
export const COLORS = {
	primary: { DEFAULT: "#FF6B35", light: "#FF8C61", dark: "#E55A2B" },
	text: { primary: "#1F2937", secondary: "#4B5563" },
};

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

### Helper Functions

**Location:** `lib/utils.ts`

Common utility functions for formatting, validation, and data manipulation.

---

For more information, see:

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Contributing Guide](../CONTRIBUTING.md)
