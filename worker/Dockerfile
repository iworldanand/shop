# CaptionForge render worker — Node 20 + FFmpeg + fonts (incl. Indic scripts)
FROM node:20-bookworm-slim

# FFmpeg + font packages so burned-in captions render every language correctly.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fontconfig \
    fonts-noto-core \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    fonts-indic \
    fonts-noto-extra \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY index.mjs ./

# Refresh the font cache so FFmpeg's ass/drawtext filters find the fonts.
RUN fc-cache -f

ENV NODE_ENV=production
CMD ["node", "index.mjs"]
