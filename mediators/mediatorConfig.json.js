export const config = {
  "urn": "urn:mediator:mpi_push",
  "version": "1.0.0",
  "name": "Mediator Routes",
  "description": "Tutorial Scaffold Mediator",
  "defaultChannelConfig": [
    {
      "name": "MPI Mediator Routes",
      "urlPattern": "^/patient$",
      "routes": [
        {
          "name": "MPI Mediators",
          "host": "mediators",
          "path": "/",
          "port": "8082",
          "primary": true,
          "type": "http"
        }
      ],
      "allow": ["admin"],
      "methods": ["GET", "POST"],
      "type": "http"
    }
  ],
  "endpoints": [
    {
      "name": "Bootstrap Scaffold Mediator Endpoint",
      "host": "mediators",
      "path": "/",
      "port": "8082",
      "primary": true,
      "type": "http"
    }
  ]
}