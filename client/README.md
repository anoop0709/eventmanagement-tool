# Event Management Tool - React Client

A pure React application for managing events, built with Vite and custom CSS.

## Tech Stack

- **React** 18.3.1 - UI library
- **Vite** 5.0.12 - Build tool and dev server
- **React Router** 6.28.0 - Client-side routing
- **Formik** 2.4.9 - Form management
- **React DatePicker** 7.5.0 - Date selection component

## Project Structure


```
client/
├── public/
│   └── images/
│       └── decorations/
│           ├── balloon/
│           ├── floral/
│           ├── modern/
│           └── traditional/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AdminRoute.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── calendar/
│   │   │   ├── CalendarView.jsx
│   │   │   └── CalendarView.css
│   │   ├── dashboard/
│   │   │   ├── event-list/
│   │   │   │   ├── EventList.jsx
│   │   │   │   └── EventList.css
│   │   │   ├── event-row/
│   │   │   │   ├── EventRow.jsx
│   │   │   │   └── EventRow.css
│   │   │   └── status-card/
│   │   │       ├── StatCard.jsx
│   │   │       └── StatCard.css
│   │   ├── layout/
│   │   │   ├── appshell/
│   │   │   │   ├── AppShell.jsx
│   │   │   │   └── AppShell.css
│   │   │   ├── sidebar/
│   │   │   │   ├── SidebarNav.jsx
│   │   │   │   └── SidebarNav.css
│   │   │   └── topbar/
│   │   │       ├── TopBar.jsx
│   │   │       └── TopBar.css
│   │   └── ui/
│   │       ├── badge/
│   │       ├── button/
│   │       ├── confirmation-dialog/
│   │       ├── form-card/
│   │       ├── form-field-renderer/
│   │       ├── multiple-events/
│   │       ├── review/
│   │       │   ├── Review.jsx
│   │       │   └── Review.css
│   │       ├── select/
│   │       │   ├── Select.jsx
│   │       │   └── Select.css
│   │       ├── snackbar/
│   │       └── update-event-details/
│   ├── config/
│   │   ├── eventFormConfig.js
│   │   ├── formStepsConfig.js
│   │   └── updateDetailsConfig.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── SnackbarContext.jsx
│   ├── data/
│   │   └── mockEvents.js
│   ├── pages/
│   │   ├── catalog/
│   │   │   ├── CatalogPage.jsx
│   │   │   └── CatalogPage.css
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   └── DashboardPage.css
│   │   ├── events/
│   │   │   ├── EventsPage.jsx
│   │   │   ├── EventsPage.css
│   │   │   ├── EventViewPage.jsx
│   │   │   └── EventViewPage.css
│   │   ├── login/
│   │   │   ├── LoginPage.jsx
│   │   │   └── LoginPage.css
│   │   ├── newevent/
│   │   │   ├── CreateEventPage.jsx
│   │   │   └── CreateEventPage.css
│   │   └── quotes/
│   │       └── QuotesViewPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── variables.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

First, run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Features

- **Authentication**: Mock authentication with localStorage
- **Dashboard**: Overview of events, statistics, and quick actions
- **Event Management**: Create and manage events with detailed forms
- **Custom CSS**: Each component has its own CSS file for easy styling
- **Responsive Design**: Works on desktop and mobile devices

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Migration from Next.js + TypeScript

This project was converted from:
- **Next.js** → **Vite + React**
- **TypeScript** → **JavaScript (JSX)**
- **Tailwind CSS** → **Custom CSS**

Each component now has its own CSS file for better organization and customization.

## Authentication

The app uses a simple mock authentication system:
- Any email and password will work for login
- User data is stored in localStorage
- Protected routes redirect to login if not authenticated

## Demo Login

Use any email and password to login and access the dashboard.
