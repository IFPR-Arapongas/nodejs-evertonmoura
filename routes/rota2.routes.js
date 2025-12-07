const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware de Segurança (Verifica o Token)
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Token não fornecido' });
    
    const bearer = token.split(' '); 
    const tokenValor = bearer[1];

    jwt.verify(tokenValor, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Falha na autenticação' });
        req.userId = decoded.id;
        next();
    });
}

// Listar Tarefas
router.get('/', verificarToken, (req, res) => {
    db.query("SELECT * FROM tarefas WHERE usuario_id = ?", [req.userId], (err, results) => {
        if (err) {
            console.error("Erro ao listar tarefas:", err);
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        res.status(200).json(results);
    });
});

// Criar Tarefa
router.post('/', verificarToken, (req, res) => {
    const { descricao } = req.body;
    if(!descricao) return res.status(400).json({message: "Descrição necessária"});

    db.query("INSERT INTO tarefas (descricao, usuario_id, status) VALUES (?, ?, 'Pendente')", [descricao, req.userId], (err, result) => {
        if (err) {
            console.error("Erro ao criar tarefa:", err);
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        res.status(201).json({ message: "Tarefa criada!", id: result.insertId });
    });
});

// Atualizar Tarefa (Status)
router.put('/:id', verificarToken, (req, res) => {
    const { status } = req.body;
    db.query("UPDATE tarefas SET status = ? WHERE id = ? AND usuario_id = ?", [status, req.params.id, req.userId], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar tarefa:", err);
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        res.status(200).json({ message: "Tarefa atualizada!" });
    });
});

// Deletar Tarefa
router.delete('/:id', verificarToken, (req, res) => {
    db.query("DELETE FROM tarefas WHERE id = ? AND usuario_id = ?", [req.params.id, req.userId], (err, result) => {
        if (err) {
            console.error("Erro ao deletar tarefa:", err);
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        res.status(200).json({ message: "Tarefa deletada!" });
    });
});

module.exports = router;