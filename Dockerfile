FROM node:20-alpine
WORKDIR /app
ADD ./package*.json ./
RUN npm install -f
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]

