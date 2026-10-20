FROM node:20-alpine

WORKDIR /app

# 1. Сначала копируем package.json и ставим зависимости
COPY package*.json ./
RUN npm install

# 2. Затем копируем папку prisma (со схемой!)
COPY prisma ./prisma

# 3. И только теперь генерируем клиента
RUN npx prisma generate

# 4. Копируем остальной код
COPY src ./src
COPY .env ./

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node src/index.js"]