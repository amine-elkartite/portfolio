FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --chown=node:node backend/ ./
COPY --chown=node:node frontend/ /app/frontend/
COPY --chown=node:node database/ /app/database/
RUN mkdir -p uploads/projects && chown -R node:node uploads
USER node
EXPOSE 5000
CMD ["node", "server.js"]
