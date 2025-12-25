# Fria Frontend

Modern React frontend for the Fria e-commerce platform with AR capabilities.

## Features

- 🛍️ Product catalog with search, filters, and pagination
- 🎨 Product detail pages with color selection and AR preview
- 🛒 Shopping cart and checkout flow
- ❤️ Wishlist functionality
- 👤 User authentication (Email, Social Login, Guest Mode)
- 📦 Order management
- ⭐ Product reviews and ratings
- 🎯 Modern, responsive UI with Tailwind CSS
- ⚡ Fast performance with React Query and Vite

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Zustand** for state management
- **Framer Motion** for animations
- **React Hook Form** for forms
- **Axios** for API calls

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://localhost:5001/api
VITE_FRONTEND_URL=https://freedev-lang.github.io
```

**Note:** `VITE_FRONTEND_URL` is used for generating QR codes for the AR feature. If not set, it defaults to the current origin.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── lib/           # API client and utilities
├── store/         # Zustand stores
└── App.tsx        # Main app component
```

## Features Overview

### Authentication
- Email/Password registration and login
- Social login (Google, Facebook, Instagram)
- Guest mode for browsing
- Protected routes

### Product Browsing
- Category filtering
- Search functionality
- Price and size filters
- Sorting options
- Pagination

### Product Details
- Multiple color options
- AR model preview links
- Image gallery
- Reviews and ratings
- Related products

### Shopping
- Add to cart
- Wishlist
- Checkout flow
- Order tracking
- Address management

## Development

The app uses:
- **React Query** for server state management
- **Zustand** for client state (auth, cart)
- **React Router** for navigation
- **Tailwind CSS** for styling

## Build

```bash
npm run build
```

The build output will be in the `dist` directory.

