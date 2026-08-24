const API_BASE = 'http://localhost:3000/api';

let estadoApp = {
  livros: [],
  emprestimos: [],
  livroSelecionado: null
};

document.addEventListener('DOMContentLoaded', () => {
  carregarLivros();
  carregarEmprestimos();
  atualizarSelectLivros();
});

function mostrarNotificacao(mensagem, tipo = 'sucesso') {
  const notif = document.getElementById('notificacao');
  notif.textContent = mensagem;
  notif.className = `notificacao ${tipo}`;
  
  setTimeout(() => {
    notif.className = 'notificacao';
  }, 4000);
}

async function carregarLivros() {
  try {
    const response = await fetch(`${API_BASE}/livros`);
    if (!response.ok) throw new Error('Erro ao carregar livros');
    
    estadoApp.livros = await response.json();
    renderizarLivros();
  } catch (erro) {
    console.error('Erro:', erro);
    mostrarNotificacao('Erro ao carregar livros', 'erro');
  }
}

function renderizarLivros() {
  const lista = document.getElementById('listaLivros');
  
  if (estadoApp.livros.length === 0) {
    lista.innerHTML = '<p class="vazio">Nenhum livro cadastrado. Clique em "+ Novo Livro" para começar.</p>';
    return;
  }
  
  lista.innerHTML = estadoApp.livros.map(livro => `
    <div class="item">
      <div class="item-header">
        <div>
          <div class="item-title">${livro.titulo}</div>
          <div class="item-meta">
            <span><strong>Autor:</strong> ${livro.autor}</span>
            <span class="status-badge ${livro.disponivel ? 'status-ativo' : 'status-inativo'}">
              ${livro.disponivel ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
        </div>
      </div>
      <div class="item-description">
        ${livro.editora ? `<span>Editora: ${livro.editora}</span>` : ''}
        ${livro.isbn ? `<span>ISBN: ${livro.isbn}</span>` : ''}
        ${livro.categoria ? `<span>Categoria: ${livro.categoria}</span>` : ''}
        ${livro.ano ? `<span>Ano: ${livro.ano}</span>` : ''}
      </div>
      <div class="item-actions">
        <button class="btn btn-warning" onclick="editarLivro(${livro.id})">✏️ Editar</button>
        <button class="btn btn-danger" onclick="deletarLivro(${livro.id})">🗑️ Deletar</button>
      </div>
    </div>
  `).join('');
}

function mostrarFormLivro() {
  document.getElementById('formLivro').classList.remove('hidden');
  document.getElementById('tituloLivro').focus();
}

function ocultarFormLivro() {
  document.getElementById('formLivro').classList.add('hidden');
  document.getElementById('tituloLivro').value = '';
  document.getElementById('autorLivro').value = '';
  document.getElementById('isbnLivro').value = '';
  document.getElementById('editoraLivro').value = '';
  document.getElementById('anoLivro').value = '';
  document.getElementById('categoriaLivro').value = '';
}

async function salvarLivro(event) {
  event.preventDefault();
  
  const titulo = document.getElementById('tituloLivro').value.trim();
  const autor = document.getElementById('autorLivro').value.trim();
  const isbn = document.getElementById('isbnLivro').value.trim();
  const editora = document.getElementById('editoraLivro').value.trim();
  const ano = document.getElementById('anoLivro').value || new Date().getFullYear();
  const categoria = document.getElementById('categoriaLivro').value.trim();
  
  if (!titulo) {
    mostrarNotificacao('Título é obrigatório', 'erro');
    return;
  }
  
  if (!autor) {
    mostrarNotificacao('Autor é obrigatório', 'erro');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/livros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, autor, isbn, editora, ano, categoria })
    });
    
    const dados = await response.json();
    
    if (!response.ok) {
      mostrarNotificacao(dados.erro || 'Erro ao criar livro', 'erro');
      return;
    }
    
    estadoApp.livros.push(dados);
    renderizarLivros();
    atualizarSelectLivros();
    ocultarFormLivro();
    mostrarNotificacao('Livro criado com sucesso!', 'sucesso');
  } catch (erro) {
    console.error('Erro:', erro);
    mostrarNotificacao('Erro de conexão ao criar livro', 'erro');
  }
}

async function editarLivro(id) {
  const livro = estadoApp.livros.find(l => l.id === id);
  if (!livro) {
    mostrarNotificacao('Livro não encontrado', 'erro');
    return;
  }
  
  const novoTitulo = prompt('Novo título do livro:', livro.titulo);
  if (!novoTitulo || !novoTitulo.trim()) return;
  
  try {
    const response = await fetch(`${API_BASE}/livros/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: novoTitulo.trim() })
    });
    
    const dados = await response.json();
    
    if (!response.ok) {
      mostrarNotificacao(dados.erro || 'Erro ao atualizar', 'erro');
      return;
    }
    
    carregarLivros();
    atualizarSelectLivros();
    mostrarNotificacao('Livro atualizado com sucesso!', 'sucesso');
  } catch (erro) {
    console.error('Erro:', erro);
    mostrarNotificacao('Erro ao atualizar livro', 'erro');
  }
}

async function deletarLivro(id) {
  if (!confirm('Tem certeza que deseja deletar este livro?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/livros/${id}`, {
      method: 'DELETE'
    });
    
    const dados = await response.json();
    
    if (!response.ok) {
      mostrarNotificacao(dados.erro || 'Erro ao deletar', 'erro');
      return;
    }
    
    estadoApp.livros = estadoApp.livros.filter(l => l.id !== id);
    estadoApp.emprestimos = estadoApp.emprestimos.filter(e => e.livroId !== id);
    renderizarLivros();
    renderizarEmprestimos();
    atualizarSelectLivros();
    mostrarNotificacao('Livro deletado com sucesso!', 'sucesso');
  } catch (erro) {
    console.error('Erro:', erro);
    mostrarNotificacao('Erro ao deletar livro', 'erro');
  }
}

async function carregarEmprestimos() {
  try {
    const response = await fetch(`${API_BASE}/emprestimos`);
    if (!response.ok) throw new Error('Erro ao carregar empréstimos');
    
    estadoApp.emprestimos = await response.json();
    renderizarEmprestimos();
  } catch (erro) {
    console.error('Erro:', erro);
    mostrarNotificacao('Erro ao carregar empréstimos', 'erro');
  }
}

function renderizarEmprestimos() {
  const lista = document.getElementById('listaEmprestimos');
  
  if (estadoApp.emprestimos.length === 0) {
    lista.innerHTML = '<p class="vazio">Nenhum empréstimo registrado. Clique em "+ Novo Empréstimo" para começar.</p>';
    return;
  }
  
  lista.innerHTML = estadoApp.emprestimos.map(emprestimo => {
    const livro = estadoApp.livros.find(l => l.id === emprestimo.livroId);
    return `
      <div class="item">
        <div class="item-header">
          <div>
            <div class="item-title">${livro ? livro.titulo : 'Livro não encontrado'}</div>
            <div class="item-meta">
              <span><strong>Leitor:</strong> ${emprestimo.nomeLeitor}</span>
              <span class="status-badge status-${emprestimo.status}">${emprestimo.status}</span>
            </div>
          </div>
        </div>
        <div class="item-description">
          <span>Email: ${emprestimo.emailLeitor}</span>
          <span>Empréstimo: ${new Date(emprestimo.dataEmprestimo).toLocaleDateString('pt-BR')}</span>
          <span>Devolução Prevista: ${new Date(emprestimo.dataDevolucaoPrevista).toLocaleDateString('pt-BR')}</span>
          ${emprestimo.dataDevolucaoReal ? `<span>Devolvido em: ${new Date(emprestimo.dataDevolucaoReal).toLocaleDateString('pt-BR')}</span>` : ''}
        </div>
        <div class="item-actions">
          ${emprestimo.status === 'ativo' ? `<button class="btn btn-success" onclick="finalizarEmprestimo(${emprestimo.id})">✓ Finalizar</button>` : ''}
          <button class="btn btn-warning" onclick="editarEmprestimo(${emprestimo.id})">✏️ Editar</button>
          <button class="btn btn-danger" onclick="deletarEmprestimo(${emprestimo.id})">🗑️ Deletar</button>
        </div>
      </div>
    `;
  }).join('');
}

function atualizarSelectLivros() {
  const select = document.getElementById('livroEmprestimo');
  select.innerHTML = '<option value="">Selecione um livro</option>';
  
  estadoApp.livros.forEach(livro => {
    select.innerHTML += `<option value="${livro.id}">${livro.titulo} - ${livro.autor}</option>`;
  });
}

function mostrarFormEmprestimo() {
  if (estadoApp.livros.length === 0) {
    mostrarNotificacao('Crie um livro antes de registrar empréstimos', 'erro');
    return;
  }
  document.getElementById('formEmprestimo').classList.remove('hidden');
  document.getElementById('nomeLeitor').focus();
}

function ocultarFormEmprestimo() {
  document.getElementById('formEmprestimo').classList.add('hidden');
  document.getElementById('livroEmprestimo').value = '';
  document.getElementById('nomeLeitor').value = '';
  document.getElementById('emailLeitor').value = '';
  document.getElementById('dataDevolucao').value = '';
}

async function salvarEmprestimo(event) {
  event.preventDefault();
  
  const livroId = document.getElementById('livroEmprestimo').value;
  const nomeLeitor = document.getElementById('nomeLeitor').value.trim();
  const emailLeitor = document.getElementById('emailLeitor').value.trim();
  const dataDevolucaoPrevista = document.getElementById('dataDevolucao').value;
  
  if (!livroId) {
    mostrarNotificacao('Selecione um livro', 'erro');
    return;
  }
  
  if (!nomeLeitor) {
    mostrarNotificacao('Nome do leitor é obrigatório', 'erro');
    return;
  }
  
  if (!emailLeitor) {
    mostrarNotificacao('Email é obrigatório', 'erro');
    return;
  }
  
  if (!dataDevolucaoPrevista) {
    mostrarNotificacao('Data de devolução é obrigatória', 'erro');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/emprestimos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        livroId: parseInt(livroId), 
        nomeLeitor, 
        emailLeitor,
        dataDevolucaoPrevista: new Date(dataDevolucaoPrevista).toISOString()
      })
    });
    
    const dados = await response.json();
    
    if (!response.ok) {
      mostrarNotificacao(dados.erro || 'Erro ao criar empréstimo', 'erro');
      return;
    }
    
    estadoApp.emprestimos.push(dados);
    renderizarEmprestimos();
    ocultarFormEmprestimo();
    mostrarNotificacao('Empréstimo registrado com sucesso!', 'sucesso');
  } catch (erro) {
    console.error('Erro:', erro);
    mostrarNotificacao('Erro de conexão ao criar empréstimo', 'erro');
  }
}

async function finalizarEmprestimo(id) {
  try {
    const response = await fetch(`${API_BASE}/emprestimos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        dataDevolucaoReal: new Date().toISOString(),
        status: 'finalizado'
      })
    });
    
    const dados = await response.json();
    
    if (!response.ok) {
      mostrarNotificacao(dados.erro || 'Erro ao finalizar', 'erro');
      return;
    }
    
    carregarEmprestimos();
    mostrarNotificacao('Empréstimo finalizado com sucesso!', 'sucesso');
  } catch (erro) {
    console.error('Erro:', erro);
    mostrarNotificacao('Erro ao finalizar empréstimo', 'erro');
  }
}

async function editarEmprestimo(id) {
  const emprestimo = estadoApp.emprestimos.find(e => e.id === id);
  if (!emprestimo) {
    mostrarNotificacao('Empréstimo não encontrado', 'erro');
    return;
  }
  
  const novoNome = prompt('Novo nome do leitor:', emprestimo.nomeLeitor);
  if (!novoNome || !novoNome.trim()) return;
  
  try {
    const response = await fetch(`${API_BASE}/emprestimos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeLeitor: novoNome.trim() })
    });
    
    const dados = await response.json();
    
    if (!response.ok) {
      mostrarNotificacao(dados.erro || 'Erro ao atualizar', 'erro');
      return;
    }
    
    carregarEmprestimos();
    mostrarNotificacao('Empréstimo atualizado com sucesso!', 'sucesso');
  } catch (erro) {
    console.error('Erro:', erro);
    mostrarNotificacao('Erro ao atualizar empréstimo', 'erro');
  }
}

async function deletarEmprestimo(id) {
  if (!confirm('Tem certeza que deseja deletar este empréstimo?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/emprestimos/${id}`, {
      method: 'DELETE'
    });
    
    const dados = await response.json();
    
    if (!response.ok) {
      mostrarNotificacao(dados.erro || 'Erro ao deletar', 'erro');
      return;
    }
    
    estadoApp.emprestimos = estadoApp.emprestimos.filter(e => e.id !== id);
    renderizarEmprestimos();
    mostrarNotificacao('Empréstimo deletado com sucesso!', 'sucesso');
  } catch (erro) {
    console.error('Erro:', erro);
    mostrarNotificacao('Erro ao deletar empréstimo', 'erro');
  }
}