# Multi-stage build para optimizar el tamaño de la imagen

# Stage 1: Build
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de paquetes
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --only=production --silent

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Copiar archivos construidos desde el stage anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]