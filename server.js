require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importa as rotas que criamos
const authRoutes = require('./routes/rota1.routes');
const tarefasRoutes = require('./routes/rota2.routes');

const app = express();
app.use(express.json());
app.use(cors());

// Configura o servidor para servir os arquivos do Frontend (pasta public)
app.use(express.static('public'));

// Usa as rotas
app.use('/auth', authRoutes);     // Rotas de login ficarão em /auth/login
app.use('/tarefas', tarefasRoutes); // Rotas de tarefas ficarão em /tarefas

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});