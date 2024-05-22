git pull origin main
docker compose build
docker compose up -d --force-recreate --remove-orphans
docker compose -f docker-compose.yml -f proxy/docker-compose.yml -f keycloak/docker-compose.yml up -d --force-recreate