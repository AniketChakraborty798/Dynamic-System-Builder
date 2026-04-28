# Dynamic Application Generator

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
