# Birthday & Event Wish Automator 🎉

A modern web application built with Next.js to keep track of birthdays, anniversaries, and special events. It automatically generates personalized wishes using AI and schedules email notifications.

## Features

- 📅 **Calendar View**: Manage and visualize all your upcoming events.
- 🤖 **AI-Powered Wishes**: Automatically generate unique and personalized birthday or anniversary wishes.
- ✉️ **Email Notifications**: Get notified or send wishes automatically via email on special days.
- 🔐 **Authentication**: Secure user login and registration using NextAuth.
- 🗄️ **Database**: Persistent storage using Prisma ORM.
- 🎨 **Modern UI**: Clean, responsive, and beautiful interface.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [Prisma ORM](https://www.prisma.io/) (SQLite)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **AI Integration**: AI-powered wish generation

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Tharnikaa/Wishes.git
   cd Wishes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and configure necessary variables (Database URL, NextAuth secret, Email config, etc.).

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running locally.

## Project Structure

- `/src/app`: Next.js App Router pages and API routes (auth, cron, events, generation).
- `/src/components`: Reusable React components (Calendar, Modals, Cards).
- `/prisma`: Database schema configurations.
- `/src/lib`: Core utility functions (Auth, Prisma, Holidays).
- `/src/hooks`: Custom React hooks (useEvents).

## Deployment (Vercel)

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com).

### Database Configuration for Vercel
Because Vercel is a serverless platform, it requires a cloud database that accepts external connections.

1. **Create a Database**: We recommend creating a free MySQL database on **[Aiven](https://aiven.io/)** or **[TiDB Serverless](https://en.pingcap.com/tidb-serverless/)**. Do not use shared hosting databases (like cPanel/StackCP) as they usually block external connections.
2. **Set the Environment Variable**: In your Vercel project settings, set \`DATABASE_URL\` to your new cloud database connection string.
3. **Automated Schema Push**: You do **not** need to manually build the database tables. Upon deployment, Vercel will automatically run \`prisma db push\` to generate all required tables (\`User\`, \`Event\`, etc.) in your new cloud database.

### Important Environment Variables
Make sure to configure the following environment variables in your Vercel project settings:

- \`DATABASE_URL\`: Connection string to your cloud database.
- \`NEXTAUTH_SECRET\`: A random string used to hash tokens, sign/encrypt cookies and generate cryptographic keys.
- \`NEXTAUTH_URL\`: The canonical URL of your site (e.g., \`https://your-app-url.vercel.app\`).
- \`NEXT_PUBLIC_VAPID_PUBLIC_KEY\` & \`VAPID_PRIVATE_KEY\`: Required for Web Push Notifications.

## License

This project is open-source and available under the MIT License.
