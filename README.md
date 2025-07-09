# Roadsurfer Dashboard

A calendar-like dashboard web application for managing campervan bookings at rental stations. Built with Vue.js 2, TypeScript, and TailwindCSS.

## 🚀 Live Demo

[View Live Application](https://jelicich.github.io/roadsurfer)

## 📋 Project Overview

This application provides station personnel with an intuitive calendar interface to view and manage campervan pickups and returns. The dashboard displays weekly views of bookings, allowing staff to easily track vehicle availability and customer interactions.

### Key Features

- **📅 Weekly Calendar View**: Navigate through weeks to see all bookings
- **🔍 Station Autocomplete**: Search and select stations with real-time suggestions
- **📱 Mobile-First Design**: Responsive layout optimized for all devices
- **📊 Booking Management**: View pickup and dropoff details
- **🎯 Booking Details**: Detailed view of individual bookings
- **⚡ Real-time Search**: Debounced API calls for optimal performance

## 🏗️ Architecture & Design Decisions

### Modular Approach

I chose a **modular architecture** throughout the application to achieve:

- **Clear Separation of Concerns**: Each module has a single responsibility
- **Enhanced Testability**: Isolated modules are easier to unit test
- **Scalability**: New features can be added without affecting existing code
- **Maintainability**: Changes to one module don't cascade to others

#### Examples of Modularity:

```
src/
├── components/
│   ├── autocomplete-field/
│   │   ├── AutocompleteField.vue
│   │   ├── AutocompleteFieldModule.ts    # Business logic
│   │   └── AutocompleteField.spec.ts     # Tests
│   └── booking-calendar/
│       ├── BookingCalendar.vue
│       ├── BookingCalendarModule.ts      # Date logic
│       └── BookingCalendar.spec.ts       # Tests
├── services/                             # API layer
├── store/modules/                        # State management
└── models/                              # Type definitions
```

### Component Structure

Each major component follows this pattern:
- **Vue Component**: Handles UI and user interactions
- **Module Class**: Contains business logic and pure functions
- **Test Suite**: Comprehensive unit tests for both UI and logic
- **Styles**: Component-scoped CSS using TailwindCSS utilities

This separation allows for:
- **Easy testing** of business logic without DOM dependencies
- **Reusable logic** across different components
- **Clear interfaces** between UI and business layers

## 🛠️ Technology Stack

- **Framework**: Vue.js 2 with TypeScript
- **State Management**: Vuex
- **Styling**: TailwindCSS
- **Testing**: Vitest with Vue Test Utils
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

### Framework Choice: Vue.js 2

I chose to use **Vue.js 2** for this project because it's the version I'm most comfortable with and have extensive experience using. While I would have preferred to use **Vue.js 3** to showcase the latest features and Composition API, the time constraints of this take-home task meant I needed to prioritize delivery speed and code quality over learning new framework features.

Given more time, I would have implemented this using Vue.js 3 with the Composition API, which would have provided:
- Better TypeScript integration
- More performant reactivity system
- Composition API for better code organization
- Improved tree-shaking and bundle sizes

## 🤖 AI-Assisted Development

I leveraged AI assistance for specific parts of the development process:

- **Vuex Store Setup**: AI helped generate the initial store structure and module boilerplate
- **CSS Styling**: AI assisted in writing most of the TailwindCSS utility classes and component styles
- **Unit Tests**: AI was used to write comprehensive unit tests for components and modules
- **Decision Making**: The architectural decisions (modular approach, custom CSS classes wrapping Tailwind utilities) were my own
- **README**: This file was also generated with the help of AI

### Custom CSS Classes Following SUIT CSS Convention

I made the conscious decision to create custom CSS classes that apply TailwindCSS utilities, following the **SUIT CSS naming convention**:

```css
.AutocompleteField-input {
  @apply w-full py-2 pl-3 pr-9 bg-white text-gray-700 leading-tight
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.BookingCalendar-day {
  @apply bg-white relative overflow-hidden border border-gray-200 rounded-lg shadow-sm;
}

.BookingCalendar-day--today {
  @apply border-blue-500 bg-blue-50;
}
```

**SUIT CSS Convention Benefits:**
- **ComponentName-elementName**: Clear component-to-element relationships
- **ComponentName--modifierName**: Consistent modifier naming
- **Predictable Structure**: Easy to locate and understand styles
- **Scalable**: Works well with component-based architectures

**Additional Benefits of this approach:**
- **Maintainability**: Changes to styling are centralized
- **Readability**: Template markup stays clean and semantic
- **Consistency**: Ensures consistent styling across components
- **Flexibility**: Easy to modify design system without touching templates

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jelicich/roadsurfer.git
   cd roadsurfer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test:unit    # Run unit tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # Run ESLint
```

## 🧪 Testing Strategy

The application includes comprehensive unit tests with **95%+ coverage**:

### Testing Approach
- **Component Tests**: UI behavior and user interactions
- **Module Tests**: Business logic and pure functions
- **Integration Tests**: Component and module interactions
- **Mock Strategy**: External dependencies are properly mocked

### Test Examples
```bash
# Run all tests
npm run test:unit

# Run specific test file
npm run test:unit -- AutocompleteField.spec.ts

# Run tests with coverage
npm run test:unit -- --coverage
```

## 📱 Features Implementation

### 1. Autocomplete Component
- **Reusable** across the application
- **Configurable** debounce time and minimum characters
- **Accessible** with proper ARIA attributes
- **Responsive** to user input with loading states

### 2. Calendar View
- **Weekly Navigation**: Previous/Next week controls
- **Responsive Grid**: Adapts from 1 column (mobile) to 7 columns (desktop)
- **Today Highlighting**: Current day is visually distinct
- **Booking Display**: Shows pickup/dropoff events with visual indicators

### 3. Booking Details
- **Detailed Information**: Customer name, dates, duration, station
- **Navigation**: Easy return to calendar view
- **Error Handling**: Graceful handling of missing bookings

### 4. State Management
- **Vuex Modules**: Separate modules for stations and bookings
- **Typed Actions**: Full TypeScript support
- **Error States**: Proper error handling and loading states

## 🔧 Project Structure

```
src/
├── components/           # Vue components
│   ├── autocomplete-field/
│   ├── booking-calendar/
│   └── booking-info/
├── models/              # TypeScript interfaces
├── services/            # API service layer
├── store/               # Vuex store modules
├── views/               # Route-level components
├── router/              # Vue Router configuration
└── modules/             # Utility modules
```

## 🚀 Deployment

The application is deployed to GitHub Pages automatically via GitHub Actions:

1. **Build Process**: Vite builds the application for production
2. **Asset Optimization**: Images, CSS, and JS are optimized
3. **Deployment**: Static files are deployed to GitHub Pages


---

Built with ❤️ by [jelicich](https://github.com/jelicich)