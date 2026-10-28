const prisma = require("../data/prisma");

const discoExiste = async (discoId) => {
    if (!discoId || isNaN(Number(discoId))) return false;
    const disco = await prisma.disco.findUnique({
        where: { id_disco: Number(discoId) }
    });
    return disco != null;
};

const usuarioExiste = async (usuarioId) => {
    if (!usuarioId || isNaN(Number(usuarioId))) return false;
    const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: Number(usuarioId) }
    });
    return usuario != null;
};

module.exports = {
    discoExiste,
    usuarioExiste
};