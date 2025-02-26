# ConvoCube - Chat Application

ConvoCube is a real-time chat application that provides messaging and group chat functionality. The app allows users to sign in, chat with others, create and manage groups, and more. It uses modern technologies like React, Redux, Socket.io for real-time communication, and is designed to work seamlessly on both web and mobile platforms.

## Live Demo
You Can check live demo at **[Visit Here](https://convocube.online/)**
- Register Your Profile
- Invite your Friends
- Enjoy your conversations in ConvoCube

## Features

- **Real-time Chat**: Users can send and receive messages instantly using Socket.io for real-time communication.
- **Group Chat**: Users can create, join, and manage groups for group chats.
- **Admin Dashboard**: Admins can log in to manage users, chats, and messages.
- **Notifications**: The app provides notifications for new messages and group updates.
- **Mobile Version**: A mobile version of the app is also available. See the mobile version repository [here](https://github.com/ishaan-k-19/chatAppMobile).

## Tech Stack

- **Frontend**: React.js, Redux, React Router, Socket.io, ShadCN UI, TailwindCSS
- **Backend**: Node.js, Express, MongoDB
- **Real-time Communication**: Socket.io
- **Styling**: CSS, Styled-components (optional), TailwindCSS
- **Authentication**: JWT (JSON Web Tokens)

## How to Run the App Locally

### 1. Clone the Repository

First, clone the repository to your local machine using the following command:

```bash
git clone https://github.com/ishaan-k-19/chatapp.git
```
### 2. Install Dependencies

Navigate to the project directory and install the necessary dependencies:

```bash
cd chatApp
npm install
```

### 3. Setup Environment Variables

Create a .env file in the root directory and add the following environment variables:

```bash
MONGO_URI="mongodb://localhost:27017/chatapp"
PORT="3000"

JWT_SECRET="your_jwt_secret_key_here"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="your_email@example.com"
SMTP_PASS="your_email_password_here"

ADMIN_SECRET_KEY="your_admin_secret_key_here"


NODE_ENV="development"


CLIENT_URL="http://localhost:3000"  

CLOUDINARY_NAME="your_cloudinary_name_here"
CLOUDINARY_API_KEY="your_cloudinary_api_key_here"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret_here"
```
### 4. Run the App

To start the development server, run:

```bash
npm run dev
```

This will start the app in development mode and you can access it at http://localhost:3000.

### 5. Testing the App on Mobile

To test the mobile version of the app, please visit the mobile version repository https://github.com/ishaan-k-19/chatappmobile. The mobile app has similar functionality and can be run on Android and iOS devices (Developed On ReactNative).

### 6. Admin Panel

To access the admin panel, log in as an admin through the /admin route. Admins can manage users, chats, and messages. Please note that the backend needs to support admin authentication for this functionality to work.

### 7. Socket.io Connection

This app uses Socket.io to handle real-time messaging. Make sure your backend server is running and connected to Socket.io.

## Folder Structure
- **`src/`**: Contains all the frontend React code.
- **`components/`**: Reusable UI components.
- **`pages/`**: Page-level components such as Home, Login, etc.
- **`redux/`**: Redux slices and actions for state management.
- **`socket/`**: Handles Socket.io connections and events.
- **`constants/`**: Stores constants like URLs, events, etc.
- **`api/`**: Contains API calls and integrations with the backend.

## How to Contribute

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your Changes
4. Commit your changes:
   ```bash
   git commit -am 'Add new feature'
   ```
5. Push to the branch
   ```bash
   git push origin feature-name
   ```
6. Create a new Pull Request.
