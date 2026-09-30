# Deploying to Render

This backend is configured for deployment on Render. Follow these steps:

## Prerequisites

1.  **MongoDB Database**: Render does not provide a managed MongoDB. You should use a provider like [MongoDB Atlas](https://www.mongodb.com/atlas).
    - Get your Connection String (URI). It looks like `mongodb+srv://<username>:<password>@cluster0.mongodb.net/dbname`.
2.  **Git Repository**: Ensure this code is pushed to a GitHub or GitLab repository.

## Deployment Steps

### Option 1: Using Blueprints (Recommended)

This method uses the `render.yaml` file I created to automatically configure the service.

1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub/GitLab repository.
4.  Render will detect the `render.yaml` file.
5.  It will prompt you for the Environment Variables defined in the YAML:
    - `MONGO_URL`: Paste your MongoDB Connection String.
    - `ACCESS_TOKEN_SECRET`: Enter a long random string for security.
6.  Click **Apply**. Render will deploy your service.

### Option 2: Manual Setup

If you prefer to configure manually:

1.  Create a **New Web Service**.
2.  Connect your repository.
3.  Settings:
    - **Runtime**: Node
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
4.  **Environment Variables**:
    - `NODE_ENV`: `production`
    - `MONGO_URL`: (Your MongoDB Connection String)
    - `ACCESS_TOKEN_SECRET`: (Your secret)
    - `ACCESS_TOKEN_LIFE`: `15m` (Optional)

## Post-Deployment

- Render will provide a URL (e.g., `https://ecommerce-backend.onrender.com`).
- Update your Frontend application to point to this new API URL.
