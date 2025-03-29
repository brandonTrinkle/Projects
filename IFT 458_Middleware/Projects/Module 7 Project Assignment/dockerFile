# Use the official Node.js runtime as base image :18 is the version of node
FROM node:18


# Set the working directory in the image
WORKDIR /usr/src/app


# Install app dependencies by copying package.json and package-lock.json
COPY package*.json ./


# Install Node.js dependencies
RUN npm install


# Bundle app source code
COPY . .


# Expose the port the app will run on 4000
# as we have configured it on the config.env file 
EXPOSE 4000


# Command to run the application
CMD [ "npm", "start" ]