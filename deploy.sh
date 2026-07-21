#!/usr/bin/env bash

set -e

DOCKER_USERNAME="marianat859"
IMAGE_NAME="seniorease-web"

TAG=$1

if [ -z "$TAG" ]; then
  echo "❌ Erro: Nenhuma tag/versão foi informada."
  exit 1
fi

FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME"

# Carrega as variáveis do arquivo .env.local se ele existir
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Iniciando build e envio da imagem: $FULL_IMAGE_NAME:$TAG"

docker login

echo "📦 Construindo a imagem Docker com Build Args..."
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -t "$FULL_IMAGE_NAME:$TAG" -t "$FULL_IMAGE_NAME:latest" .

echo "⬆️ Enviando imagem..."
docker push "$FULL_IMAGE_NAME:$TAG"
docker push "$FULL_IMAGE_NAME:latest"

echo "✅ Sucesso!"