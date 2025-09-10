# Areca Nut Disease Prediction System

## Overview
This project is a web-based application designed to predict diseases affecting Areca nut trees using a pre-trained TensorFlow model (`arecanut_cnn_model.keras`). The system combines computer vision, AI-generated recommendations, and web-based interfaces to assist farmers and agricultural experts in identifying and managing tree diseases efficiently.

The backend is built with **Django** and **Django REST Framework**, providing a robust RESTful API for image analysis and user management. The system integrates with the **Groq AI API** to generate evidence-based recommendations and remedies based on the predicted disease. Users can upload images of Areca nut trees, and the application returns the disease name along with actionable advice.

---

## Features
- **Image Upload & Disease Prediction:** Upload images of Areca nut trees to detect diseases like "Yellow Stem Disease" or "Bud Rot" using a CNN model.  
- **AI-Generated Recommendations:** Get evidence-based, natural or home-based remedies generated through Groq AI.  
- **User Authentication:** Secure authentication using JWT tokens.  
- **REST API Endpoints:** For image analysis, user registration, login, and profile management.  
- **Responsive Frontend:** Intuitive interface for easy use on desktops and mobile devices.  

---

## Tools & Technologies Used

### Frontend
- **React.js** – For building dynamic and interactive user interfaces.  
- **Tailwind CSS** – For responsive and modern styling.  
- **Axios / Fetch API** – For making API requests to the backend.  
- **React Router** – For navigation and routing in the single-page application.  

### Backend
- **Python & Django** – For building the server-side application.  
- **Django REST Framework (DRF)** – For creating RESTful APIs.  
- **JWT (JSON Web Tokens)** – For secure user authentication.  
- **PostgreSQL / SQLite** – Database for storing user and analysis data.  
- **python-dotenv** – For managing sensitive environment variables like API keys.  

### AI Model
- **TensorFlow / Keras** – For building and loading the convolutional neural network (CNN) model.  
- **arecanut_cnn_model.keras** – Pre-trained model for predicting Areca nut tree diseases.  
- **Groq AI API** – For generating recommendations and remedies based on predicted disease results.  
