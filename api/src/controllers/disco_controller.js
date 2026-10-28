const prisma = require("../data/prisma");
const { discoExiste } = require("../service/disco_service");

const adicionar = async (req, res) => {
    try {
        const { titulo, artista, genero, preco_custo, preco_venda, quantidade_estoque, estoque_minimo } = req.body || {};

        if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
            return res.status(400).json({ erro: "O título do disco é obrigatório." });
        }
        if (!artista || typeof artista !== "string" || !artista.trim()) {
            return res.status(400).json({ erro: "O artista/banda é obrigatório." });
        }
        if (preco_custo === undefined || isNaN(Number(preco_custo))) {
            return res.status(400).json({ erro: "O preço de custo é obrigatório e deve ser um número válido." });
        }
        if (preco_venda === undefined || isNaN(Number(preco_venda))) {
            return res.status(400).json({ erro: "O preço de venda é obrigatório e deve ser um número válido." });
        }
        if (quantidade_estoque === undefined || isNaN(Number(quantidade_estoque))) {
            return res.status(400).json({ erro: "A quantidade em estoque é obrigatória." });
        }
        if (estoque_minimo === undefined || isNaN(Number(estoque_minimo))) {
            return res.status(400).json({ erro: "O estoque mínimo é obrigatório." });
        }

        const disco = await prisma.disco.create({
            data: {
                titulo: titulo.trim(),
                artista: artista.trim(),
                genero: genero ? genero.trim() : "Geral",
                preco_custo: Number(preco_custo),
                preco_venda: Number(preco_venda),
                quantidade_estoque: Number(quantidade_estoque),
                estoque_minimo: Number(estoque_minimo)
            }
        });

        return res.status(201).json({
            mensagem: "Disco cadastrado com sucesso!",
            disco
        });
    } catch (erro) {
        console.error("ERRO AO CADASTRAR DISCO:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor ao cadastrar disco." });
    }
};

const listar = async (req, res) => {
    try {
        const { busca, ordenar } = req.query;

        const filtro = {};
        if (busca) {
            filtro.OR = [
                { titulo: { contains: busca } },
                { artista: { contains: busca } }
            ];
        }

        let discos = await prisma.disco.findMany({
            where: filtro
        });

        if (ordenar === "alfabetica") {
            discos.sort((a, b) => a.titulo.localeCompare(b.titulo));
        }

        return res.status(200).json(discos);
    } catch (erro) {
        console.error("ERRO AO LISTAR DISCOS:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor ao listar discos." });
    }
};

const buscar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({ erro: "ID de disco inválido." });
        }

        const disco = await prisma.disco.findUnique({
            where: { id_disco: Number(id) }
        });

        if (!disco) {
            return res.status(404).json({ erro: "Disco não encontrado." });
        }

        return res.status(200).json(disco);
    } catch (erro) {
        console.error("ERRO AO BUSCAR DISCO:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor ao buscar disco." });
    }
};

const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, artista, genero, preco_custo, preco_venda, quantidade_estoque, estoque_minimo } = req.body || {};

        if (isNaN(Number(id))) {
            return res.status(400).json({ erro: "ID de disco inválido." });
        }

        if (!(await discoExiste(id))) {
            return res.status(404).json({ erro: "Disco não encontrado." });
        }

        const dadosAtualizacao = {};
        if (titulo !== undefined) dadosAtualizacao.titulo = titulo.trim();
        if (artista !== undefined) dadosAtualizacao.artista = artista.trim();
        if (genero !== undefined) dadosAtualizacao.genero = genero.trim();
        if (preco_custo !== undefined) dadosAtualizacao.preco_custo = Number(preco_custo);
        if (preco_venda !== undefined) dadosAtualizacao.preco_venda = Number(preco_venda);
        if (quantidade_estoque !== undefined) dadosAtualizacao.quantidade_estoque = Number(quantidade_estoque);
        if (estoque_minimo !== undefined) dadosAtualizacao.estoque_minimo = Number(estoque_minimo);

        const disco = await prisma.disco.update({
            where: { id_disco: Number(id) },
            data: dadosAtualizacao
        });

        return res.status(200).json({
            mensagem: "Disco atualizado com sucesso!",
            disco
        });
    } catch (erro) {
        console.error("ERRO AO ATUALIZAR DISCO:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor ao atualizar disco." });
    }
};

const excluir = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({ erro: "ID de disco inválido." });
        }

        if (!(await discoExiste(id))) {
            return res.status(404).json({ erro: "Disco não encontrado." });
        }

        const disco = await prisma.disco.delete({
            where: { id_disco: Number(id) }
        });

        return res.status(200).json({
            mensagem: "Disco removido com sucesso!",
            disco
        });
    } catch (erro) {
        console.error("ERRO AO EXCLUIR DISCO:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor ao excluir disco." });
    }
};

module.exports = {
    adicionar,
    listar,
    buscar,
    atualizar,
    excluir
};