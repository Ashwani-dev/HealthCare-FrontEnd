# Docker Setup Guide

This guide explains how to build and run the Healthcare Frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)

## Important Note About API Configuration

The current `src/api/api.js` file has a hardcoded API URL: `http://localhost:8080/api`. 

**For Docker deployment, you have two options:**

### Option 1: Use Relative URLs (Recommended)
Update `src/api/api.js` to use a relative URL:
```javascript
const baseURL = "/api";  // Instead of "http://localhost:8080/api"
```
Then nginx will proxy `/api` requests to your backend service.

### Option 2: Use Environment Variables
Update the code to use Vite environment variables and configure them at build time.

## Quick Start

### Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at: `http://localhost:3000`

### Build Docker Image Manually

```bash
# Build the image
docker build -t healthcare-frontend .

# Run the container
docker run -d -p 3000:80 --name healthcare-frontend healthcare-frontend
```

## Configuration

### Port Configuration

To change the port, modify the `ports` section in `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:80"  # Change YOUR_PORT to your desired port
```

### Backend Service Integration

Since your backend runs in a separate container, you need to:

1. **Connect to the backend's Docker network:**
   - Find your backend's network name (check your backend's `docker-compose.yml`)
   - Update the `networks` section in `docker-compose.yml` to use that network name
   - Set `BACKEND_HOST` to your backend's service name (from backend docker-compose)

2. **Example configuration:**
   ```yaml
   networks:
     backend-network:
       external: true
       name: your-backend-network-name  # Replace with actual network name
   ```

3. **Set backend connection details:**
   - `BACKEND_HOST`: Your backend service name (e.g., `backend`, `api`, `healthcare-backend`)
   - `BACKEND_PORT`: Backend port (default: `8080`)

4. **If backend is on host machine (not in Docker):**
   - Use `BACKEND_HOST=host.docker.internal` (Linux/Windows) or `BACKEND_HOST=host.docker.internal` (macOS)
   - Or use your host's IP address

### Custom Nginx Configuration

To use a custom nginx configuration, you can:
1. Modify `nginx.conf` directly
2. Or mount a custom config file in `docker-compose.yml`:
```yaml
volumes:
  - ./custom-nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

## Development vs Production

The Dockerfile builds a production-optimized version of the application. For development, you may want to:
- Use volume mounts for hot-reloading
- Run `npm run dev` instead of building
- Use a different Dockerfile for development

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs frontend`
- Verify port 3000 is not already in use
- Ensure Docker has enough resources allocated

### API requests failing
- Verify backend service is running and accessible
- Check nginx proxy configuration in `nginx.conf`
- Ensure network connectivity between frontend and backend containers

### Build fails
- Clear Docker cache: `docker-compose build --no-cache`
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility

