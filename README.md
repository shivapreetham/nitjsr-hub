# Nitjsr Hub v1 - student platform for NIT JSR🚀

A comprehensive, full-stack application designed to integrate essential community and student tools into a single, seamless platform. This project features real-time chat, a peer-to-peer marketplace, integrated video conferencing, and a unique automated attendance tracking system.

**[Live Demo](https://nit-jsr-hub-v1.vercel.app)** 🔗


<img width="1865" height="932" alt="image" src="https://github.com/user-attachments/assets/c6030e99-36c9-4fa0-a99b-315ad5cc75fa" />

---

## ## Key Features ✨

Nexus is divided into four primary modules, each packed with its own set of features:

### ### 💬 Real-Time Chat
-   **Instant Messaging:** One-on-one and group conversations with real-time message delivery powered by **Pusher**.
-   **Typing Indicators & Read Receipts:** See when users are typing and when your messages have been seen.
-   **Rich Media:** Share images and files seamlessly within chats.
-   **Group Management:** Easily create groups and add or remove members.

### ### 🛒 Peer-to-Peer Marketplace
-   **Product Listings:** Users can create, update, and delete their product listings.
-   **Image Uploads:** Multiple image uploads for each product, handled by **Supabase Storage**.
-   **Show Interest:** Users can express interest in products, notifying the seller and initiating a conversation.
-   **Direct-to-Chat:** A "Contact Seller" button creates a private conversation between the buyer and seller.

### ### 🎥 Video Conferencing
-   **Seamless Integration:** High-quality video and audio calls powered directly by the **Stream.io SDK**.
-   **Schedule Meetings:** Plan and schedule future meetings with other users.
-   **Recording & History:** Access a history of past meetings and view recordings, all managed by Stream's backend.

### ###  attendance Attendance Tracker
-   **Automated Data Scraping:** An independent **Express.js microservice** uses **Playwright** to automatically log into a college portal and scrape attendance data.
-   **Data Analytics:** The microservice processes the raw data to calculate daily/weekly attendance percentages and trends.
-   **Visualizations:** The frontend displays attendance data in a calendar view, with analytics charts and a student leaderboard.
-   **Manual Refresh Trigger:** A "Refresh" button on the frontend can ping the microservice to wake it up and trigger an on-demand scrape.

---

## ## System Architecture 🏗️

This project utilizes a modular, microservice-oriented architecture to separate concerns and ensure scalability.

-   **Monorepo Frontend:** The main application is a **Next.js** app containing the UI and business logic for all four modules.
-   **Microservice Backend:** The attendance scraper is a completely separate **Express.js** server that runs independently.
-   **Shared Database:** A single **MongoDB** instance acts as the source of truth for all application data.
-   **Third-Party Services:** Leverages best-in-class services like Pusher, Stream, and Supabase Storage to handle specialized tasks efficiently.

**(A screenshot of the system architecture diagram we created would be perfect here!)**

---

## ## Technology Stack 🛠️

| Category              | Technology                                                                          |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) (for Microservice) |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) |
| **Authentication** | ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-000?style=for-the-badge&logo=next-auth&logoColor=white) |
| **Real-Time Services**| **Pusher** (Chat), **Stream.io** (Video)                                           |
| **File Storage** | **Supabase Storage** (for Images & Files)                                         |
| **Scraping** | **Playwright** |
| **Uptime/Monitoring** | **UptimeRobot** (for pinging the scraper microservice)                              |
| **Deployment** | **Vercel** (Next.js App), **Render / Fly.io** (Microservice) - *Recommended* |

---

## ## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### ### Prerequisites

-   Node.js (v18.x or later)
-   npm or yarn
-   Git
-   MongoDB instance (you can get a free one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### ### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Set up the Main Next.js Application:**
    -   Navigate to the root directory.
    -   Install dependencies:
        ```sh
        npm install
        ```
    -   Create a `.env.local` file in the root directory and add the following environment variables:
        ```env
        # MongoDB
        DATABASE_URL="your_mongodb_connection_string"

        # NextAuth
        NEXTAUTH_SECRET="a_random_strong_secret_for_jwt"
        NEXTAUTH_URL="http://localhost:3000"

        # Pusher
        PUSHER_APP_ID="your_pusher_app_id"
        NEXT_PUBLIC_PUSHER_APP_KEY="your_pusher_public_key"
        PUSHER_SECRET="your_pusher_secret"

        # Stream
        NEXT_PUBLIC_STREAM_API_KEY="your_stream_api_key"
        STREAM_API_SECRET="your_stream_secret"

        # Supabase (for File Storage)
        NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
        ```

3.  **Set up the Attendance Scraper Microservice:**
    -   Navigate to the microservice directory:
        ```sh
        cd microservices/attendance-scraper
        ```
    -   Install dependencies:
        ```sh
        npm install
        ```
    -   Create a `.env` file in this directory (`/microservices/attendance-scraper`) and add the following:
        ```env
        # Database
        DATABASE_URL="your_mongodb_connection_string" # Should be the same as above

        # College Portal Credentials for the scraper bot
        COLLEGE_PORTAL_USERNAME="your_college_portal_login_id"
        COLLEGE_PORTAL_PASSWORD="your_college_portal_password"

        # Server Port
        PORT=3001
        ```

### ### Running the Application

You'll need to run both the frontend and the microservice in separate terminal windows.

1.  **Start the Next.js development server (from the root directory):**
    ```sh
    npm run dev
    ```
    Your application will be available at `http://localhost:3000`.

2.  **Start the Express.js scraper server (from the `/microservices/attendance-scraper` directory):**
    ```sh
    npm run dev
    ```
    The scraper microservice will be running on `http://localhost:3001`.

---

## ## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## ## Acknowledgements

-   ReadMe Template inspiration
-   Icons from [Shields.io](https://shields.io/)
-   All the amazing developers behind the open-source libraries used in this project.
