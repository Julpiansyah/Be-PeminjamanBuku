const http = require('http');

const data = JSON.stringify({
  title: 'Buku Test API',
  author: 'John Doe',
  isbn: '123-456',
  publisher: 'Penerbit Test',
  year: '2023',
  category: 'Fiksi',
  description: 'Test deskripsi',
  stock: '5'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/books',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
