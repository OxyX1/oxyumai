# Base image for Node.js
FROM node:18

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the application
COPY . .

# Start application
CMD ["npm", "start"]
