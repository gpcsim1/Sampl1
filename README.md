# ArcGIS Map Viewer Sample

This project demonstrates a simple web application built with the ArcGIS JavaScript API 4.30 using ES modules.

Because the application relies on ES module imports from a CDN, you need to serve the files over HTTP. Start the local server and open `http://localhost:8080` in your browser:

```bash
npm start
```

## Running the test

The repository includes a small Node-based smoke test. Run it with:

```bash
npm test
```

It checks that `index.html` contains the expected title text.
