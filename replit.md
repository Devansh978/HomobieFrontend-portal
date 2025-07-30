# Homobie CRM System

## Overview

This is a full-stack web application built for managing home loan processes. The system provides a comprehensive platform for loan officers, builders, telecallers, and administrators to manage leads, documents, and loan workflows efficiently. The application features role-based access control, real-time updates, and a modern glass morphism UI design.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **TailwindCSS** with custom CRED-inspired design system
- **Framer Motion** for smooth animations and transitions
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management
- **Shadcn/ui** components with Radix UI primitives
- **Glass morphism design pattern** with animated backgrounds

### Backend Architecture
- **Express.js** REST API server
- **Node.js** runtime with ES modules
- **JWT-based authentication** with bcrypt password hashing
- **Role-based access control (RBAC)** system
- **Multer** for file upload handling
- **Session management** with connect-pg-simple

### Data Storage
- **PostgreSQL** database with Drizzle ORM
- **Neon Database** as the cloud PostgreSQL provider
- **Database migrations** managed through Drizzle Kit
- **Connection pooling** for optimal performance

## Key Components

### Authentication & Authorization
- JWT token-based authentication with 7-day expiration
- Role hierarchy: super_admin > admin > ca > builder > broker > telecaller > user
- Permission-based access control for granular security
- Password hashing with bcrypt (12 salt rounds)
- Session timeout and automatic token refresh

### Lead Management System
- Complete lead lifecycle tracking from new to disbursed
- Status progression: new → contacted → documents_requested → documents_received → under_review → approved → rejected → disbursed
- Lead assignment to telecallers and CAs
- Timeline tracking for all lead activities
- Search and filtering capabilities

### Document Management
- File upload with size and type validation (10MB limit)
- Support for multiple file formats: jpeg, jpg, png, gif, pdf, doc, docx, txt
- Document status tracking: pending, approved, rejected, urgent
- Secure file storage and retrieval

### Role-Based Dashboards
- **Builder Dashboard**: Project management, telecaller oversight, lead assignment
- **Telecaller Portal**: Lead calling interface, performance tracking
- **Admin Dashboard**: User management, system configuration
- **CA Dashboard**: Document review, loan processing

### Real-Time Features
- Live metrics updates every 30 seconds
- Real-time notification system
- Activity timeline with instant updates
- WebSocket-ready architecture for future enhancements

## Data Flow

1. **User Authentication**: Login → JWT token generation → Role-based redirection
2. **Lead Creation**: Form submission → Validation → Database storage → Audit logging
3. **Lead Assignment**: Admin/Builder selects telecaller → Assignment creation → Notification sent
4. **Document Upload**: File selection → Validation → Server upload → Database record
5. **Status Updates**: Status change → Timeline entry → Audit log → Real-time UI update

## External Dependencies

### Frontend Dependencies
- React ecosystem (react, react-dom, react-router)
- UI components (@radix-ui/* packages)
- Animation library (framer-motion)
- HTTP client (@tanstack/react-query)
- Form handling (react-hook-form, @hookform/resolvers)
- Validation (zod)
- Styling (tailwindcss, clsx, class-variance-authority)

### Backend Dependencies
- Express framework with middleware
- Database ORM (drizzle-orm, @neondatabase/serverless)
- Authentication (jsonwebtoken, bcryptjs)
- File handling (multer)
- Environment management (dotenv)
- Build tools (tsx, esbuild)

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend
- tsx for TypeScript execution in development
- Replit-specific plugins for development experience
- Environment variables for database connection

### Production Build
- Vite builds optimized React bundle to `dist/public`
- esbuild bundles Express server to `dist/index.js`
- Single command deployment: `npm run build && npm start`
- Environment-specific configurations for database SSL

### Database Management
- Drizzle migrations for schema changes
- `npm run db:push` for development schema updates
- PostgreSQL with SSL in production
- Connection pooling for scalability

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
- June 29, 2025. Enhanced Builder Dashboard with glassmorphism design
- June 29, 2025. Created role-based dashboards for all user types
- June 29, 2025. Implemented enhanced navigation with avatar functionality
- June 29, 2025. Added comprehensive project creation and lead assignment dialogs
- June 29, 2025. Fixed authentication system with test user creation
- June 29, 2025. Added sample data for testing all dashboard functionality
- June 29, 2025. Created comprehensive dashboards for Admin, Broker, and CA roles
- June 29, 2025. Fixed API request system and authentication flow
- June 29, 2025. Added sample projects, leads, and test users for all roles
- June 29, 2025. Implemented working role-based authentication and redirection
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```