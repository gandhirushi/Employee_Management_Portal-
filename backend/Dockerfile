# Step 1: Use official lightweight Node.js 20 LTS base image
FROM node:20-alpine

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy dependency manifests first (for Docker layer caching)
COPY package*.json ./
COPY prisma ./prisma/

# Step 4: Install dependencies
RUN npm ci

# Step 5: Generate Prisma Client for Linux
RUN npx prisma generate

# Step 6: Copy remaining source code
COPY . .

# Step 7: Expose backend port
EXPOSE 5000

# Step 8: Set environment to production
ENV NODE_ENV=production

# Step 9: Start the Node application
CMD ["npm", "start"]