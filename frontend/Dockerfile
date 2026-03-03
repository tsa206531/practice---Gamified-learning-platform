# 第一階段：安裝依賴
# 這個階段的目的是安裝所有必要的依賴項。由於依賴不常變動，Docker 會快取這層，加速後續的建置。
FROM node:20-alpine AS deps
# 設定工作目錄
WORKDIR /app

# 供 Next.js 於建置期讀取的公開參數
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# 複製 package.json 與 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 啟用 corepack 並啟用 pnpm，設定相依策略後安裝依賴
RUN corepack enable \
  && corepack prepare pnpm@9 --activate \
  && pnpm config set strict-peer-dependencies false \
  && pnpm install --frozen-lockfile

# ---

# 第二階段：建置應用程式
# 這個階段會利用上一階段安裝好的依賴來建置 Next.js 應用程式。
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 再宣告一次 ARG 以便在本階段可用，並輸出為 ENV 供 next build 嵌入
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# 從 'deps' 階段複製 node_modules
COPY --from=deps /app/node_modules ./node_modules
# 複製所有專案原始碼
COPY . .

# 執行建置命令（使用 pnpm）
RUN corepack enable && corepack prepare pnpm@9 --activate \
  && pnpm build

# ---

# 第三階段：正式運行的映像檔
# 這是最終的、輕量化的映像檔。它只包含運行應用程式所必需的檔案。
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 建立一個非 root 的使用者 'nextjs'，增加安全性
RUN addgroup --system --gid 1001 nextjs \
  && adduser --system --uid 1001 nextjs

# 從 'builder' 階段複製建置好的 .next 資料夾
COPY --from=builder /app/.next ./.next
# 從 'builder' 階段複製 public 和 package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# 需要 node_modules 來執行 next start
COPY --from=deps /app/node_modules ./node_modules

# 設定環境變數
ENV NODE_ENV=production

# 以 'nextjs' 使用者身份運行
USER nextjs

# 開放 3000 port
EXPOSE 3000

# 不依賴 pnpm/npm，直接以 node 執行 next start（使用已存在的 node_modules）
CMD ["node", "node_modules/next/dist/bin/next", "start"]