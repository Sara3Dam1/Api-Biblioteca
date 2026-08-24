const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/livros.json');

function lerDados() {
  try {
    if (fs.existsSync(dataPath)) {
      const dados = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(dados);
    }
    return [];
  } catch (erro) {
    console.error('Erro ao ler dados:', erro);
    return [];
  }
}

function salvarDados(dados) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(dados, null, 2), 'utf8');
    return true;
  } catch (erro) {
    console.error('Erro ao salvar dados:', erro);
    return false;
  }
}

router.get('/', (req, res) => {
  try {
    const livros = lerDados();
    res.status(200).json(livros);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar livros' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const livros = lerDados();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    const livro = livros.find(l => l.id === id);
    
    if (!livro) {
      return res.status(404).json({ erro: 'Livro não encontrado' });
    }
    
    res.status(200).json(livro);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar livro' });
  }
});

router.post('/', (req, res) => {
  try {
    const { titulo, autor, isbn, editora, ano, categoria } = req.body;
    
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ erro: 'Título é obrigatório' });
    }
    
    if (!autor || !autor.trim()) {
      return res.status(400).json({ erro: 'Autor é obrigatório' });
    }
    
    const livros = lerDados();
    const novaId = livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1;
    
    const novoLivro = {
      id: novaId,
      titulo: titulo.trim(),
      autor: autor.trim(),
      isbn: isbn || '',
      editora: editora || '',
      ano: ano || new Date().getFullYear(),
      categoria: categoria || 'Geral',
      disponivel: true,
      dataCadastro: new Date().toISOString()
    };
    
    livros.push(novoLivro);
    
    if (salvarDados(livros)) {
      res.status(201).json(novoLivro);
    } else {
      res.status(500).json({ erro: 'Erro ao criar livro' });
    }
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar livro' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { titulo, autor, isbn, editora, ano, categoria, disponivel } = req.body;
    const livros = lerDados();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    const indice = livros.findIndex(l => l.id === id);
    
    if (indice === -1) {
      return res.status(404).json({ erro: 'Livro não encontrado' });
    }
    
    if (titulo) livros[indice].titulo = titulo.trim();
    if (autor) livros[indice].autor = autor.trim();
    if (isbn) livros[indice].isbn = isbn;
    if (editora) livros[indice].editora = editora;
    if (ano) livros[indice].ano = ano;
    if (categoria) livros[indice].categoria = categoria;
    if (disponivel !== undefined) livros[indice].disponivel = disponivel;
    
    if (salvarDados(livros)) {
      res.status(200).json(livros[indice]);
    } else {
      res.status(500).json({ erro: 'Erro ao atualizar livro' });
    }
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar livro' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const livros = lerDados();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    const indice = livros.findIndex(l => l.id === id);
    
    if (indice === -1) {
      return res.status(404).json({ erro: 'Livro não encontrado' });
    }
    
    const livroDeletado = livros.splice(indice, 1);
    
    if (salvarDados(livros)) {
      res.status(200).json({ mensagem: 'Livro deletado com sucesso', livro: livroDeletado[0] });
    } else {
      res.status(500).json({ erro: 'Erro ao deletar livro' });
    }
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao deletar livro' });
  }
});

module.exports = router;