const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Importa a conexão

// Cadastro
router.post('/register', (req, res) => {
    const { nome, email, senha } = req.body;
    
    // Log para depuração
    console.log("Tentativa de cadastro:", email);

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "Preencha todos os campos" });
    }

    const senhaCriptografada = bcrypt.hashSync(senha, 8);
    
    const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    db.query(sql, [nome, email, senhaCriptografada], (err, result) => {
        if (err) {
            console.error("Erro no banco:", err);
            if(err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Email já cadastrado" });
            return res.status(500).json({ error: "Erro interno no servidor" });
        }
        res.status(201).json({ message: "Usuário criado com sucesso!" });
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
        
        const usuario = results[0];
        const senhaValida = bcrypt.compareSync(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ message: "Senha inválida" });

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: 86400 });
        res.status(200).json({ auth: true, token: token, nome: usuario.nome });
    });
});

module.exports = router;
