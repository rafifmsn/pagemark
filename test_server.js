const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    const authHeader = req.headers['authorization'];
    
    // Verify bearer token
    if (!authHeader || authHeader !== 'Bearer token123') {
      console.log('\n--- BLOCKED INCOMING WEBHOOK (401 Unauthorized) ---');
      console.log('Received Authorization Header:', authHeader || 'None');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized: Invalid Bearer Token' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('\n--- RECEIVED WEBHOOK ---');
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      try {
        const payload = JSON.parse(body);
        console.log('Payload Title:', payload.title);
        console.log('Payload URL:', payload.url);
        console.log('Payload Author:', payload.author);
        console.log('Payload Date:', payload.date);
        console.log('Payload Markdown Preview (first 150 chars):');
        console.log(payload.markdown ? payload.markdown.slice(0, 150) + '...' : 'none');
      } catch (err) {
        console.log('Raw Body:', body);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Webhook received successfully!' }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Test webhook server running on http://localhost:${PORT}`);
});
