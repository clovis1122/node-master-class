# Pirple Home Assignment #1 - Hello World!
This simple application starts a node server that returns a custom message when the route `/hello` is accessed.

Includes:
- HTTPS support.
- Basic routing.
- Request parsing (headers, querystring, path, payload...).
- Returns Not found if the URL does not exist.

### Running the server
Type `node .` to run the server.

## Testing the hello response
If you have curl installed, use `curl localhost:3000/hello`. For testing the HTTPS connection you need to provide a certificate.
