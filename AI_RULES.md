# AI Development Rules for this Application

This document outlines the core technologies used in this application and provides guidelines for library usage to ensure consistency and maintainability.

## Tech Stack Overview

*   **Frontend Framework**: React (using JSX).
*   **Build Tool**: Vite.
*   **Language**: JavaScript (with a strong recommendation for TypeScript in new development).
*   **Routing**: React Router DOM for client-side navigation.
*   **Styling**: Currently uses custom CSS, but new styles should transition to Tailwind CSS.
*   **UI Components**: Custom components are currently in use, but `shadcn/ui` is the preferred library for new components.
*   **Icons**: Lucide React.
*   **PDF Generation**: jsPDF and jspdf-autotable.
*   **Data Persistence**: Browser Local Storage (for RSVP data and admin authentication).

## Library Usage Rules

*   **UI Components**: For any new UI elements, always prioritize using components from `shadcn/ui`. If a specific component is not available or requires significant customization, create a new component.
*   **Styling**: All new styling should be implemented using Tailwind CSS classes. Avoid creating new `.css` files for component-specific styles unless absolutely necessary for complex animations or global overrides.
*   **Icons**: Use `lucide-react` for all icons throughout the application.
*   **Routing**: Manage client-side routing exclusively with `react-router-dom`. All main routes should be defined within `src/App.jsx`.
*   **Data Storage**: For client-side data persistence, `localStorage` can be used. For any server-side data storage or authentication needs, integrate Supabase.
*   **PDF Export**: Use `jspdf` and `jspdf-autotable` for generating PDF documents, particularly for administrative features.
*   **Language**: While existing files are in JavaScript, all new files and components should be written in TypeScript (`.tsx` or `.ts`) to improve code quality and maintainability.
*   **File Structure**: Maintain the existing file structure, placing components in `src/components/` and pages in `src/pages/`.