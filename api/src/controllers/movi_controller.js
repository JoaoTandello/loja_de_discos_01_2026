const prisma = require("../data/prisma");
const { discoExiste, usuarioExiste } = require("../service/disco_service");

const movimentarEstoque = async (req, res) => {
    try {
        const { id_disco, id_usuario, tipo_movimentacao, quantidade, data_movimentacao, observacao } = req.body || {};

        if (!id_disco || isNaN(Number(id_disco))) {
            return res.status(400).json({ erro: "O campo id_disco é obrigatório e deve ser válido." });
        }
        if (!id_usuario || isNaN(Number(id_usuario))) {
            return res.status(400).json({ erro: "O campo id_usuario é obrigatório e deve ser válido." });
        }
        if (!tipo_movimentacao || !['entrada', 'saida'].includes(tipo_movimentacao)) {
            return res.status(400).json({ erro: "Tipo de movimentação inválido. Use 'entrada' ou 'saida'." });
        }
        if (!quantidade || isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
            return res.status(400).json({ erro: "A quantidade deve ser um número maior que zero." });
        }
        if (!data_movimentacao) {
            return res.status(400).json({ erro: "A data da movimentação é obrigatória." });
        }

        if (!(await discoExiste(id_disco))) {
            return res.status(404).json({ erro: "O disco informado não existe." });
        }

        if (!(await usuarioExiste(id_usuario))) {
            return res.status(404).json({ erro: "O usuário informado não existe." });
        }

        const disco = await prisma.disco.findUnique({
            where: { id_disco: Number(id_disco) }
        });

        let novoEstoque = disco.quantidade_estoque;
        let alertaEstoque = null;

        if (tipo_movimentacao === 'entrada') {
            novoEstoque += Number(quantidade);
        } else if (tipo_movimentacao === 'saida') {
            if (disco.quantidade_estoque < Number(quantidade)) {
                return res.status(400).json({ erro: "Estoque insuficiente para realizar esta venda." });
            }
            novoEstoque -= Number(quantidade);

            if (novoEstoque < disco.estoque_minimo) {
                alertaEstoque = `O estoque do disco "${disco.titulo}" ficou abaixo do mínimo configurado! (Atual: ${novoEstoque}, Mínimo: ${disco.estoque_minimo})`;
            }
        }

        await prisma.disco.update({
            where: { id_disco: Number(id_disco) },
            data: { quantidade_estoque: novoEstoque }
        });

        const movimentacao = await prisma.movimentacaoEstoque.create({
            data: {
                id_disco: Number(id_disco),
                id_usuario: Number(id_usuario),
                tipo_movimentacao,
                quantidade: Number(quantidade),
                data_movimentacao: new Date(data_movimentacao),
                observacao: observacao ? observacao.trim() : null
            }
        });

        return res.status(201).json({
            mensagem: "Movimentação registrada com sucesso!",
            movimentacao,
            alerta: alertaEstoque
        });
    } catch (erro) {
        console.error("ERRO AO MOVIMENTAR ESTOQUE:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor ao registrar movimentação." });
    }
};

module.exports = { movimentarEstoque };