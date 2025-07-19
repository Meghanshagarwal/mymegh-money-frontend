# MyMeghMoney Frontend

React frontend for the MyMeghMoney expense tracking application.

## Deployment to Vercel

1. Push this frontend folder to a Git repository
2. Connect the repository to Vercel
3. Set the following environment variables in Vercel:
   - `VITE_API_URL`: Your Render backend URL (e.g., https://mymegh-money-backend.onrender.com)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```
VITE_API_URL=https://your-backend-domain.render.com
```

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Features

- Mobile-first responsive design
- Professional avatar system
- Real-time expense tracking
- Payment management
- Friend management
- Balance calculations
- Activity history