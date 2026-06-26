```markdown
# 🌐 Pulse - Social Media Management Platform

> A modern full-stack social media platform built using the MERN-inspired architecture (React + Next.js + Express + MySQL) that enables users to connect, share content, interact in real-time, and communicate seamlessly.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js">
  <img src="https://img.shields.io/badge/Node.js-22-green?logo=node.js">
  <img src="https://img.shields.io/badge/Express.js-Backend-lightgrey?logo=express">
  <img src="https://img.shields.io/badge/MySQL-Database-blue?logo=mysql">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma">
  <img src="https://img.shields.io/badge/JWT-Authentication-red">
</p>

---

## 📖 Overview

**Pulse** is a feature-rich social media platform designed to simulate the functionality of modern social networking applications. It provides users with a seamless experience to create profiles, share posts, interact through comments and likes, send messages, and receive live updates—all while maintaining a scalable and normalized backend architecture.

The project was developed as a **Database Management Systems (DBMS)** semester project under the guidance of **Dr. Nagendra**.

---

# ✨ Features

## 👤 User Management

- 🔐 Secure User Authentication using JWT
- 📝 User Registration & Login
- 👤 Profile Creation & Customization
- 🖼️ Upload Profile Picture
- ✏️ Edit Profile Details
- 🔍 Search Users

---

## 📰 Social Feed

- 📝 Create Posts
- 🖼️ Upload Images
- 🗑️ Delete Posts
- ❤️ Like / Unlike Posts
- 💬 Comment on Posts
- 🧵 Threaded Replies to Comments
- 📌 Personalized Feed

---

## 🤝 Social Interaction

- 👥 Follow / Connect with Users
- 🚫 Block Users
- 🔔 Real-time Activity Updates
- 💭 View User Profiles
- 📊 Engagement Tracking

---

## 💬 Messaging

- 📩 One-to-One Messaging
- ⚡ Live Message Updates using Server Sent Events (SSE)
- 💬 Conversation History
- 👀 Real-time Chat Experience

---

## ⚙️ Backend Features

- JWT Authentication
- Password Encryption
- Protected Routes
- RESTful API Design
- Prisma ORM
- Normalized Relational Database
- Real-time Server Sent Events
- Error Handling
- Middleware Architecture

---

# 🛠 Tech Stack

## Frontend

- ReactJS
- NextJS
- JavaScript
- CSS

## Backend

- NodeJS
- ExpressJS
- REST APIs
- JWT Authentication
- Server Sent Events (SSE)

## Database

- MySQL
- Prisma ORM

## Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# 🏗 Architecture

```

```
             React + Next.js
                   │
                   │ REST APIs
                   ▼
           Express.js Server
                   │
     ┌─────────────┴──────────────┐
     │                            │
 JWT Authentication          SSE Events
     │                            │
     └─────────────┬──────────────┘
                   ▼
              Prisma ORM
                   │
                   ▼
              MySQL Database
```

```

---

# 🗄 Database Design

The backend follows a **normalized relational database design** consisting of **12+ interconnected tables**.

Some of the major entities include:

- Users
- Posts
- Comments
- Replies
- Likes
- Messages
- Conversations
- User Blocks
- Notifications
- User Sessions
- Media
- Authentication Records

The schema is designed to minimize redundancy while ensuring efficient querying and scalability.

---

# 🚀 REST API Highlights

The backend exposes **10+ REST API endpoints**, including:

### Authentication

- Register
- Login
- Logout

### Users

- Get Profile
- Update Profile
- Search Users

### Posts

- Create Post
- Delete Post
- Fetch Feed

### Comments

- Add Comment
- Reply to Comment

### Likes

- Like Post
- Unlike Post

### Messaging

- Send Message
- Fetch Conversations

---

# ⚡ Real-Time Features

Pulse uses **Server Sent Events (SSE)** to deliver real-time updates without requiring continuous polling.

Live updates include:

- 💬 Incoming Messages
- ❤️ New Likes
- 💭 New Comments
- 🧵 Replies
- 🔔 Notifications

---

# 🔐 Authentication

The application uses **JWT (JSON Web Tokens)** for secure authentication.

Authentication flow:

```

User Login
│
▼
Generate JWT
│
▼
Store Token
│
▼
Authenticated Requests

```

Protected routes ensure that only authenticated users can access private resources.

---

# 📂 Project Structure

```

Pulse/
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── styles/
│   └── utils/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── prisma/
│   ├── services/
│   └── utils/
│
├── prisma/
│   └── schema.prisma
│
└── README.md

````

---


# 🎯 Learning Outcomes

This project demonstrates practical understanding of:

- Full Stack Development
- REST API Design
- Database Normalization
- Authentication Systems
- ORM (Prisma)
- Real-time Communication using SSE
- State Management
- Backend Architecture
- CRUD Operations
- Client-Server Communication

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/aryanchaturvedi13/Social-Media-Management.git
````

```bash
cd Social-Media-Management
```

---

## Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

---

## Run Backend

```bash
npm run dev
```

---

## Run Frontend

```bash
npm run dev
```

---

# 📸 Screenshots

> Add screenshots of your application here.

* Login Page
* Home Feed
* User Profile
* Messaging
* Comments
* Notifications

---

# 🔮 Future Improvements

* 📱 Mobile Responsive UI
* 🌙 Dark Mode
* 📹 Video Upload Support
* 📞 Voice & Video Calls
* 📌 Saved Posts
* 🏷️ Hashtags
* 📍 Location Tags
* 🤖 AI-powered Content Recommendation
* 🔔 Push Notifications
* 📊 Analytics Dashboard

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 👨‍💻 Author

**Aryan Chaturvedi**

Feel free to connect or contribute to improve the project!

---

# ⭐ Show Your Support

If you found this project useful, consider giving it a ⭐ on GitHub!

It helps others discover the project and motivates further development.

---

## 📜 License

This project is intended for educational purposes and is open for learning and experimentation.

```
```
