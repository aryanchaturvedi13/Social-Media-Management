# 🌐 Pulse - Social Media Management Platform

> A modern full-stack social media platform built using **React, Next.js, Node.js, Express.js, MySQL, and Prisma ORM** that enables users to connect, share content, interact in real-time, and communicate seamlessly.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white">
  <img src="https://img.shields.io/badge/JWT-Authentication-D63AFF?style=for-the-badge">
</p>

---

# 📖 Overview

**Pulse** is a feature-rich social media platform designed to replicate the experience of modern social networking applications. It enables users to create profiles, publish posts, interact through likes and comments, exchange messages, and receive real-time updates.

The application follows a scalable full-stack architecture and was developed as a **Database Management Systems (DBMS)** semester project.

---

# ✨ Features

## 👤 User Management

- 🔐 Secure User Authentication using JWT
- 📝 User Registration & Login
- 👤 User Profile Creation
- ✏️ Edit Profile Details
- 🖼️ Profile Picture Support
- 🔍 Search Users

---

## 📰 Social Feed

- 📝 Create Posts
- 🖼️ Upload Images
- 🗑️ Delete Posts
- ❤️ Like / Unlike Posts
- 💬 Comment on Posts
- 🧵 Threaded Replies
- 📌 Personalized Feed

---

## 🤝 Social Interaction

- 👥 User Profiles
- 🚫 Block Users
- 📊 Engagement Tracking
- 🔔 Real-Time Notifications

---

## 💬 Messaging

- 📩 One-to-One Messaging
- ⚡ Real-Time Chat using Server Sent Events (SSE)
- 💬 Conversation History

---

## ⚙️ Backend Features

- JWT Authentication
- Password Hashing
- Protected Routes
- RESTful API Architecture
- Prisma ORM
- Normalized Relational Database
- Server Sent Events (SSE)
- Middleware-based Request Handling
- Error Handling

---

# 🛠 Tech Stack

### Frontend

- React.js
- Next.js
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- Server Sent Events (SSE)

### Database

- MySQL
- Prisma ORM

### Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# 🏗 System Architecture

```text
                React + Next.js
                      │
                      │ REST APIs
                      ▼
              Express.js Server
                      │
        ┌─────────────┴─────────────┐
        │                           │
 JWT Authentication         SSE (Real-Time)
        │                           │
        └─────────────┬─────────────┘
                      ▼
                 Prisma ORM
                      │
                      ▼
                MySQL Database
```

---

# 🗄 Database Design

The backend is powered by a **normalized relational database** consisting of **12+ interconnected tables**.

Major entities include:

- Users
- Posts
- Comments
- Replies
- Likes
- Messages
- Conversations
- User Blocks
- Notifications
- Authentication Records
- Media
- Sessions

The schema minimizes redundancy while ensuring efficient querying and scalability.

---

# 🚀 REST APIs

The backend exposes multiple REST API endpoints.

### Authentication

- Register
- Login
- Logout

### User

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

Pulse uses **Server Sent Events (SSE)** to provide real-time updates without continuous polling.

Supported live events:

- 💬 Incoming Messages
- ❤️ Likes
- 💭 Comments
- 🧵 Replies
- 🔔 Notifications

---

# 🔐 Authentication Flow

```text
User Login
     │
     ▼
Generate JWT Token
     │
     ▼
Store Token
     │
     ▼
Authenticated API Requests
```

Only authenticated users can access protected resources.

---

# 📂 Project Structure

```text
Pulse
│
├── client
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── styles
│   └── utils
│
├── server
│   ├── controllers
│   ├── middleware
│   ├── prisma
│   ├── routes
│   ├── services
│   └── utils
│
├── prisma
│   └── schema.prisma
│
└── README.md
```

---

# 💡 Use Cases

Pulse can be used as:

- 📚 Database Management Systems Project
- 💼 Full-Stack Portfolio Project
- 🎓 Learning Resource for React + Node.js + MySQL
- 🚀 Starter Template for Social Networking Applications
- 🔥 Demonstration of JWT Authentication and REST APIs

---

# 🎯 Learning Outcomes

This project demonstrates:

- Full Stack Development
- Database Design
- Database Normalization
- REST API Development
- Authentication using JWT
- Prisma ORM
- Real-Time Communication
- CRUD Operations
- Client-Server Architecture
- Backend Design Principles

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/aryanchaturvedi13/Social-Media-Management.git
```

```bash
cd Social-Media-Management
```

---

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside the backend folder.

```env
DATABASE_URL=your_database_url

JWT_SECRET=your_secret_key

PORT=5000
```

---

## Start the Backend

```bash
npm run dev
```

---

## Start the Frontend

```bash
npm run dev
```

---

# 📸 Screenshots

> Add screenshots of your application here.

| Login | Feed |
|-------|------|
| ![](assets/login.png) | ![](assets/feed.png) |

| Profile | Messaging |
|---------|-----------|
| ![](assets/profile.png) | ![](assets/chat.png) |

---

# 🔮 Future Improvements

- 📱 Fully Responsive Mobile UI
- 🌙 Dark Mode
- 📹 Video Upload Support
- 📞 Voice & Video Calling
- 📌 Saved Posts
- 🏷️ Hashtags
- 📍 Location Tags
- 🤖 AI-powered Feed Recommendation
- 🔔 Push Notifications
- 📊 User Analytics Dashboard

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added a new feature"
```

4. Push your branch

```bash
git push origin feature-name
```

5. Open a Pull Request 🚀

---

# 👨‍💻 Author

**Aryan Chaturvedi**

If you found this project helpful, consider giving it a ⭐ on GitHub!

---

# 📜 License

This project is intended for educational purposes and is open for learning and experimentation.
