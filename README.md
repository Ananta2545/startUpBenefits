# Startup Benefits Platform

A full-stack platform providing exclusive SaaS deals for startups, featuring user verification and deal claiming functionality.

## 🚀 Tech Stack

**Frontend:**

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)

**Backend:**

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication

## 📁 Project Structure

```
startup-benefits-platform/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── index.js        # Server entry point
│   │   └── seed.js         # Database seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   └── lib/            # API utilities
│   └── package.json
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install

# Create .env file (copy from .env.example)
# Update MONGODB_URI if using Atlas

npm run seed    # Populate sample deals
npm run dev     # Start server on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Start on port 3000
```

## 🔐 Authentication & Authorization

### Strategy

- **JWT-based auth**: Tokens stored in cookies, expire in 7 days
- **Password hashing**: bcrypt with salt rounds of 12
- **Protected routes**: Middleware validates JWT on each request

### User Verification Workflow

1. **New users register** and start as `isVerified: false`
2. Unverified users can browse deals but **cannot claim locked deals**
3. **Admin verifies users** through the admin panel
4. Once verified, users can claim all deals including locked ones

> **Note:** Anyone can create a new account! After registration, the admin must verify the account before the user can access locked deals.

### Admin Authentication Workflow

1. Admin logs in with admin credentials at `/login`
2. Admin is redirected to `/admin` dashboard
3. From the admin panel, admin can:
   - View all pending verifications
   - Approve or reject user verification requests
   - Manage deals and claims

### Flow

```
User: Register → Login → Browse Deals → Request Verification → Admin Approves → Access Locked Deals
Admin: Login → Admin Dashboard → Manage Users/Verifications → Approve/Reject Requests
```

## 📋 Core Entities

### User

```javascript
{
  (email,
    password,
    name,
    companyName,
    companySize,
    isVerified,
    role,
    createdAt);
}
```

### Deal

```javascript
{
  title, description, partner: { name, logo, website },
  category, discountValue, isLocked, eligibility,
  terms, claimInstructions, featured, isActive
}
```

### Claim

```javascript
{
  user, deal, status: ['pending' | 'approved' | 'rejected'],
  claimCode, createdAt
}
```

## 🔄 Claiming a Deal - Internal Flow

```
1. User clicks "Claim Deal" on frontend
2. POST /api/claims { dealId } with JWT header
3. Backend validates:
   - User is authenticated
   - Deal exists and is active
   - Deal not expired
   - If deal.isLocked → user.isVerified must be true
   - User hasn't already claimed this deal
   - Max claims not reached
4. Create Claim with status: 'pending'
5. Increment deal.currentClaims
6. Return claim data to frontend
7. Frontend shows success + dashboard updates
```

## 🌐 API Endpoints

### Auth

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| POST   | /api/auth/register | Create account   |
| POST   | /api/auth/login    | Login, get JWT   |
| GET    | /api/auth/me       | Get current user |

### Deals

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| GET    | /api/deals            | List all (with filters) |
| GET    | /api/deals/:id        | Single deal details     |
| GET    | /api/deals/categories | List categories         |
| GET    | /api/deals/featured   | Featured deals          |

### Claims (Protected)

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| POST   | /api/claims       | Claim a deal     |
| GET    | /api/claims       | User's claims    |
| GET    | /api/claims/stats | Claim statistics |

## 🎨 UI & Animation Features

### Implemented

- Animated hero section with parallax scroll effects
- Page transitions using Framer Motion
- Micro-interactions (hover states, button feedback)
- Skeleton loading states
- Glassmorphism design elements
- Gradient borders and glow effects
- Responsive mobile menu
- Category-based color coding

### Design System

- Dark theme with purple/indigo accent
- Custom scrollbar styling
- `.glass` and `.glass-light` utility classes
- `.gradient-text` for gradient typography
- `.card-hover` for lift effect
- `.skeleton` for loading shimmer

## ⚠️ Known Limitations

1. **No email verification**: Users set as unverified by default, no actual verification flow
2. **No admin panel**: Claim approval happens manually in DB
3. **No password reset**: Would need email service integration
4. **No rate limiting**: Should add for production
5. **Image URLs external**: Partner logos are external URLs, no upload system
6. **Single server**: No horizontal scaling setup

## 🚧 Production Improvements Needed

### Security

- [ ] Add rate limiting (express-rate-limit)
- [ ] Implement CSRF protection
- [ ] Add helmet.js for security headers
- [ ] Input sanitization (xss-clean)
- [ ] Move secrets to proper vault

### Performance

- [ ] Add Redis caching for deals
- [ ] Implement API response caching
- [ ] Image optimization / CDN
- [ ] Database connection pooling

### Features

- [ ] Email verification flow
- [ ] Admin dashboard for claim approval
- [ ] Password reset functionality
- [ ] Deal expiration notifications
- [ ] Search indexing (Elasticsearch)

### Infrastructure

- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Error monitoring (Sentry)
- [ ] Logging service (Winston + ELK)
- [ ] Load balancer setup

## 🧪 Demo Credentials

### User Account

```
Email: demo@startup.com
Password: demo123
Status: Verified (can claim locked deals)
```

### Admin Account

```
Email: admin@startup.com
Password: admin123
Role: Admin (can verify users and manage deals)
```

### Creating Your Own Account

1. Go to `/register` and create a new account
2. Login with your credentials
3. You'll start as **unverified** (cannot claim locked deals)
4. Admin must approve your account from the admin panel
5. Once verified, you can claim all deals

## 📊 Architecture Decisions

1. **Monorepo structure**: Simplified development and deployment
2. **JWT in cookies**: More secure than localStorage, works with SSR
3. **Compound index on claims**: Prevents duplicate claims efficiently
4. **Category enum validation**: Ensures data consistency
5. **Soft delete for deals**: `isActive` flag instead of hard delete
6. **Claim codes auto-generated**: On approval, provides redemption tracking

## 🤝 Frontend-Backend Interaction

```
Frontend                          Backend
   |                                 |
   |-- POST /auth/login ----------->|
   |<-- { token, user } ------------|
   |                                 |
   |-- GET /deals (with token) ---->|
   |<-- { deals[], pagination } ----|
   |                                 |
   |-- POST /claims { dealId } ---->|
   |   [JWT validates user]         |
   |   [Check verification status]  |
   |<-- { claim } or { error } -----|
```

---

Built for the Full-Stack Developer Assignment.
