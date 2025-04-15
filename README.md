# Security Tools Hub

A minimalistic hub for security and API development tools built with TypeScript and React.

## Features

- **JWT Decoder**: Decode and inspect JSON Web Tokens to view header and payload contents
- **JWK Signer**: Create signed JWTs using a JSON Web Key (JWK) and custom payload
- **Base64 Encoder/Decoder**: Encode and decode data in both standard Base64 and Base64URL formats

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

To build the application for production, run:

```
npm run build
```

The optimized build will be available in the `dist` directory.

## Technologies Used

- TypeScript
- React
- React Router
- jsonwebtoken
- jose
- Bootstrap 5 (via CDN)
- Webpack