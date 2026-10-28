
const prisma = require("../data/prisma");

const cadastro = async (req, res) => {
    try {
        const { nome, email, senha } = req.body || {};

        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: "Preencha todos os campos." });
        }

        const existente = await prisma.usuario.findUnique({
            where: { email: email.trim() }
        });

        if (existente) {
            return res.status(409).json({ erro: "Este email já está cadastrado." });
        }

        const usuario = await prisma.usuario.create({
            data: {
                nome: nome.trim(),
                email: email.trim(),
                senha: senha
            }
        });

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (erro) {
        console.error("ERRO AO CADASTRAR:", erro);
        return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
    }
};

const login = async (req, res) => {
    try {
        const { email, senha } = req.body || {};

        if (!email || !senha) {
            return res.status(400).json({ erro: "Informe email e senha." });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { email: email.trim() }
        });

        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ erro: "Credenciais inválidas! Verifique seu email e senha." });
        }

        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            usuario: {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (erro) {
        console.error("ERRO AO REALIZAR LOGIN:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor ao realizar login." });
    }
};

module.exports = {
    cadastro,
    login
};
