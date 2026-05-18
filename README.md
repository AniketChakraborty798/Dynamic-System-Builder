# Dynamic Application Gene

A full-stack, configuration-driven application generator that dynamically builds a complete web application (React frontend + Node.js/Express backend + PostgreSQL database) from a single JSON configuration file.

This project was built to demonstrate a scalable architecture where UI components, API endpoints, and database schemas are all dynamically provisioned on the fly—without hardcoding models.

## 🚀 Key Features

* **JSON-Driven Architecture**: The entire application flow, database models, and UI rendering are dictated by `app-config.json`.
* **Dynamic Database Provisioning**: Automatically generates PostgreSQL tables based on the models defined in your config.
* **Auto-Generated CRUD APIs**: Instantly creates `GET`, `POST`, `PUT`, and `DELETE` REST API endpoints for every defined model.
* **Dynamic UI Rendering**: The React frontend uses Vite and TailwindCSS to dynamically render tables, forms, and pages based on the config structure.

### Mandatory Integrated Features:
1. **Authentication Engine**: Fully working JWT-based user registration and login.
2. **CSV Import**: Bulk import structured data directly into dynamically generated tables.
3. **i18n Localization**: Built-in support for multi-language translations (English & Spanish included).

## 🛠️ Tech Stack

* **Frontend**: React (Vite), TypeScript, Tailwind CSS, React Router, Axios, i18next
* **Backend**: Node.js, Express, TypeScript, pg (PostgreSQL node client), Multer, jsonwebtoken, bcryptjs
* **Database**: PostgreSQL (Neon.tech cloud hosted)

## 📦 How to Run Locally

### 1. Database Setup
Create a PostgreSQL database (locally or via Neon.tech/Supabase).
Navigate into the `backend` folder and add your connection string to a `.env` file:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
2. Start the Backend
Open a terminal in the backend directory:

bash
cd backend
npm install
ts-node src/index.ts
Note: Upon starting, the backend will connect to your database and automatically provision all necessary tables and endpoints.

3. Start the Frontend
Open a new terminal in the frontend directory:

bash
cd frontend
npm install
npm run dev
Visit http://localhost:3000 to interact with your dynamically generated application!

⚙️ Modifying the App (app-config.json)
To change the app, you only need to edit app-config.json.

Add a new object to the models array to instantly get a new Postgres table, full CRUD APIs, and UI tables/forms.
Change the theme block to instantly update the application's color scheme.
Toggle features to enable or disable authentication or CSV uploading.
Built for the Full Stack Developer Internship Demo Task.
