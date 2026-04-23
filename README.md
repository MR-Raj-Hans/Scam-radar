# 🛡️ ScamRadar

**ScamRadar** is a community-driven, full-stack platform designed to identify, report, and stay safe from the ever-evolving landscape of digital fraud. In a world where scams are becoming increasingly sophisticated, ScamRadar provides a unified space for users to share their experiences and help protect others from falling victim to similar traps.

---

## 🌟 Why ScamRadar?

Digital fraud isn't just about losing money—it's about the breach of trust and the confusion that follows. We built ScamRadar to:
- **Centralize Information:** Bring together community reports, news, and official blacklists (like TRAI) into one place.
- **Empower Users:** Give you the tools to check suspicious numbers, emails, or links before you interact.
- **Provide AI-Assisted Safety:** Our built-in assistant uses Anthropic's Claude to help analyze potential scams and offer immediate safety advice.

---

## 🚀 Key Features

- **Community Reporting:** Submit detailed logs of scams you've encountered to warn the community.
- **Real-Time Feed:** A live, interactive feed of the latest reports and scam trends.
- **Advanced Checker:** A specialized search engine that cross-references inputs against our database and external APIs (including TRAI data).
- **AI Safety Assistant:** A conversational widget that can classify scam types and suggest the next best steps.
- **Comprehensive News:** Stay updated with a curated feed of news related to digital fraud and cybersecurity.
- **Interactive Dashboard:** Track your contributions and stay informed about cases you follow.
- **Admin Portal:** Robust moderation tools to ensure the platform remains a reliable source of information.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State & Routing:** React Router, Context API
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose)
- **AI Engine:** Anthropic Claude SDK
- **Security:** Helmet, Express-rate-limit, CORS

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (Local or Atlas)
- An Anthropic API Key (Optional, but recommended for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MR-Raj-Hans/Scam-radar.git
   cd Scam-radar
   ```

2. **Install all dependencies:**
   We've made it easy with a root-level script that handles both the client and server:
   ```bash
   npm run install-all
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the following:
   ```env
   # Server Config
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development

   # Client Config
   CLIENT_URL=http://localhost:5173

   # AI Integration
   ANTHROPIC_API_KEY=your_claude_api_key
   ```

4. **Seed the Database (Optional):**
   If you want some initial data to play with:
   ```bash
   npm run seed
   ```

---

## 🏃 Running the Project

To start both the client and server concurrently, simply run:

```bash
npm run dev
```

The application will be available at:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

## 📁 Project Structure

```text
scamradar/
├── client/          # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
├── server/          # Node.js + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── jobs/        # Automated tasks & schedulers
└── .env             # Global configuration
```

---

## 🤝 Contributing

We believe that community safety is a shared responsibility. If you're a developer, designer, or security enthusiast, we'd love your help! Feel free to:
1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/CoolNewFeature`).
3. Commit your changes (`git commit -m 'Add some CoolNewFeature'`).
4. Push to the branch (`git push origin feature/CoolNewFeature`).
5. Open a Pull Request.

---

## ⚖️ License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Stay Safe. Report Scams. Protect the Community.** 🛡️
