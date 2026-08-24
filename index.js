const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const livrosRoutes = require('./routes/entidade1');
const emprestimosRoutes = require('./routes/entidade2');

app.use('/api/livros', livrosRoutes);
app.use('/api/emprestimos', emprestimosRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Acesse a aplicação no navegador\n`);
});