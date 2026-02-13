# MongoDB Setup Guide

## Option 1: Docker (Recommended)

### Prerequisites:

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Steps:

1. Open PowerShell in the project root directory
2. Run:
   ```powershell
   docker-compose up -d
   ```
3. MongoDB will be running on `localhost:27017`
4. Mongo Express (GUI) will be available at `http://localhost:8081`
5. The backend should now connect successfully

### Stop MongoDB:

```powershell
docker-compose down
```

---

## Option 2: MongoDB Community Edition (Local Installation)

### Prerequisites:

- Install [MongoDB Community Edition for Windows](https://www.mongodb.com/try/download/community)

### Steps:

1. Download and install MongoDB Community Edition
2. MongoDB will automatically start on `localhost:27017`
3. Update backend `.env` if needed (should auto-detect)
4. The backend should now connect successfully

---

## Option 3: MongoDB Atlas (Cloud - Using Proper IP Whitelisting)

If you want to use the existing MongoDB Atlas cluster:

### Steps:

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Go to your cluster security settings
3. In **Network Access**, add your current IP address to the IP whitelist
4. Get your IP: Open [whatismyipaddress.com](https://whatismyipaddress.com/)
5. Uncomment the MongoDB Atlas URI in `.env` and comment out the local one
6. Restart the backend: `npm run dev`

---

## Testing MongoDB Connection

Once MongoDB is running, you should see:

```
✅ MongoDB Connected at localhost:27017/BM12-Section
🚀 Server running at http://localhost:5000
```

---

## Default Credentials (Docker):

- **Username**: admin
- **Password**: password123
- **Database**: BM12-Section
