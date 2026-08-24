const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/emprestimos.json');

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
    const emprestimos = lerDados();
    res.status(200).json(emprestimos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar empréstimos' });
  }
});

router.get('/livro/:livroId', (req, res) => {
  try {
    const emprestimos = lerDados();
    const livroId = parseInt(req.params.livroId);
    
    if (isNaN(livroId)) {
      return res.status(400).json({ erro: 'ID do livro inválido' });
    }
    
    const emprestimosFiltrados = emprestimos.filter(e => e.livroId === livroId);
    res.status(200).json(emprestimosFiltrados);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar empréstimos do livro' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const emprestimos = lerDados();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    const emprestimo = emprestimos.find(e => e.id === id);
    
    if (!emprestimo) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado' });
    }
    
    res.status(200).json(emprestimo);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar empréstimo' });
  }
});

router.post('/', (req, res) => {
  try {
    const { livroId, nomeLeitor, emailLeitor, dataDevolucaoPrevista } = req.body;
    
    // Validações de campos obrigatórios
    if (!livroId) {
      return res.status(400).json({ erro: 'ID do livro é obrigatório' });
    }
    
    if (!nomeLeitor || !nomeLeitor.trim()) {
      return res.status(400).json({ erro: 'Nome do leitor é obrigatório' });
    }
    
    if (!emailLeitor || !emailLeitor.trim()) {
      return res.status(400).json({ erro: 'Email do leitor é obrigatório' });
    }
    
    const livroIdNum = parseInt(livroId);
    if (isNaN(livroIdNum)) {
      return res.status(400).json({ erro: 'ID do livro inválido' });
    }
    
    const emprestimos = lerDados();
    const novaId = emprestimos.length > 0 ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1;
    
    const novoEmprestimo = {
      id: novaId,
      livroId: livroIdNum,
      nomeLeitor: nomeLeitor.trim(),
      emailLeitor: emailLeitor.trim(),
      dataEmprestimo: new Date().toISOString(),
      dataDevolucaoPrevista: dataDevolucaoPrevista || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      dataDevolucaoReal: null,
      status: 'ativo'
    };
    
    emprestimos.push(novoEmprestimo);
    
    if (salvarDados(emprestimos)) {
      res.status(201).json(novoEmprestimo);
    } else {
      res.status(500).json({ erro: 'Erro ao criar empréstimo' });
    }
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar empréstimo' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { nomeLeitor, emailLeitor, dataDevolucaoPrevista, dataDevolucaoReal, status } = req.body;
    const emprestimos = lerDados();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    const indice = emprestimos.findIndex(e => e.id === id);
    
    if (indice === -1) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado' });
    }
    
    if (nomeLeitor) emprestimos[indice].nomeLeitor = nomeLeitor.trim();
    if (emailLeitor) emprestimos[indice].emailLeitor = emailLeitor.trim();
    if (dataDevolucaoPrevista) emprestimos[indice].dataDevolucaoPrevista = dataDevolucaoPrevista;
    if (dataDevolucaoReal !== undefined) emprestimos[indice].dataDevolucaoReal = dataDevolucaoReal;
    if (status) emprestimos[indice].status = status;
    
    if (salvarDados(emprestimos)) {
      res.status(200).json(emprestimos[indice]);
    } else {
      res.status(500).json({ erro: 'Erro ao atualizar empréstimo' });
    }
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar empréstimo' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const emprestimos = lerDados();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    const indice = emprestimos.findIndex(e => e.id === id);
    
    if (indice === -1) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado' });
    }
    
    const emprestimoDeletado = emprestimos.splice(indice, 1);
    
    if (salvarDados(emprestimos)) {
      res.status(200).json({ mensagem: 'Empréstimo deletado com sucesso', emprestimo: emprestimoDeletado[0] });
    } else {
      res.status(500).json({ erro: 'Erro ao deletar empréstimo' });
    }
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao deletar empréstimo' });
  }
});

module.exports = router;