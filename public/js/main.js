// Como o front está na mesma porta do back, podemos usar a URL base
const API = 'http://localhost:3000';
let isLoginMode = true;

// Verifica login ao carregar
const token = localStorage.getItem('token');
if (token) {
    mostrarApp();
}

function alternarTelaAuth() {
    isLoginMode = !isLoginMode;
    const nomeInput = document.getElementById('nome');
    const title = document.getElementById('auth-title');
    const btnAction = document.getElementById('btn-action');
    const btnToggle = document.getElementById('btn-toggle');

    if (isLoginMode) {
        nomeInput.classList.add('hidden');
        title.innerText = "Login";
        btnAction.innerText = "Entrar";
        btnToggle.innerText = "Não tem conta? Cadastre-se";
    } else {
        nomeInput.classList.remove('hidden');
        title.innerText = "Cadastro";
        btnAction.innerText = "Cadastrar";
        btnToggle.innerText = "Já tem conta? Faça Login";
    }
}

async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const nome = document.getElementById('nome').value;

    // Ajuste nas rotas (agora tem o prefixo /auth)
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const body = isLoginMode ? { email, senha } : { nome, email, senha };

    try {
        const response = await fetch(API + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            if (isLoginMode) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('nome', data.nome);
                mostrarApp();
            } else {
                alert("Cadastro realizado! Faça login.");
                alternarTelaAuth();
            }
        } else {
            alert(data.message || "Erro ao conectar");
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor.");
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    location.reload();
}

function mostrarApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = `Olá, ${localStorage.getItem('nome')}`;
    carregarTarefas();
}

// --- Funções de Tarefas ---

async function carregarTarefas() {
    const token = localStorage.getItem('token');
    const res = await fetch(API + '/tarefas', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const tarefas = await res.json();
    
    const lista = document.getElementById('lista-tarefas');
    lista.innerHTML = '';

    tarefas.forEach(t => {
        const div = document.createElement('div');
        div.className = 'tarefa-item';
        div.innerHTML = `
            <span>${t.descricao}</span>
            <div class="task-actions">
                <select class="status-select" onchange="atualizarStatus(${t.id}, this.value)">
                    <option value="Pendente" ${t.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="Em Andamento" ${t.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="Concluída" ${t.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                </select>
                <button class="danger" onclick="deletarTarefa(${t.id})">X</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

async function criarTarefa() {
    const input = document.getElementById('nova-tarefa');
    const descricao = input.value;
    if (!descricao) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API + '/tarefas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ descricao })
        });

        if (response.ok) {
            input.value = '';
            carregarTarefas();
        } else {
            const data = await response.json();
            alert(data.message || 'Não foi possível criar a tarefa.');
        }
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        alert('Erro de conexão ao tentar criar a tarefa.');
    }
}

async function atualizarStatus(id, status) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API}/tarefas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (response.ok) {
            carregarTarefas();
        } else {
            alert('Não foi possível atualizar a tarefa.');
        }
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        alert('Erro de conexão ao tentar atualizar a tarefa.');
    }
}

async function deletarTarefa(id) {
    if(!confirm("Deletar tarefa?")) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API}/tarefas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            carregarTarefas();
        } else {
            alert('Não foi possível deletar a tarefa.');
        }
    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        alert('Erro de conexão ao tentar deletar a tarefa.');
    }
}
