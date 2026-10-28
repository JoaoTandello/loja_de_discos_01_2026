const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.movimentacaoEstoque.deleteMany();
  await prisma.disco.deleteMany();
  await prisma.usuario.deleteMany();

  const user1 = await prisma.usuario.create({
    data: {
      nome: 'Admin Loja',
      email: 'admin@vinil.com',
      senha: '123'
    }
  });

  const user2 = await prisma.usuario.create({
    data: {
      nome: 'João',
      email: 'joao@vinil.com',
      senha: '123'
    }
  });

  const user3 = await prisma.usuario.create({
    data: {
      nome: 'Mirella',
      email: 'mirella@vinil.com',
      senha: '123'
    }
  });

  const disco1 = await prisma.disco.create({
    data: {
      titulo: 'Lets Go 4',
      artista: 'MC IG',
      genero: 'Funk',
      preco_custo: 30.00,
      preco_venda: 60.00,
      quantidade_estoque: 10,
      estoque_minimo: 3
    }
  });

  const disco2 = await prisma.disco.create({
    data: {
      titulo: 'Solta a oreia do chefe',
      artista: 'MC IG',
      genero: 'Funk',
      preco_custo: 40.00,
      preco_venda: 80.00,
      quantidade_estoque: 8,
      estoque_minimo: 2
    }
  });

  const disco3 = await prisma.disco.create({
    data: {
      titulo: 'Pós',
      artista: 'Felipe & Rodrigo',
      genero: 'Sertanejo',
      preco_custo: 50.00,
      preco_venda: 100.00,
      quantidade_estoque: 5,
      estoque_minimo: 2
    }
  });

  await prisma.movimentacaoEstoque.create({
    data: {
      id_disco: disco1.id_disco,
      id_usuario: user1.id_usuario,
      tipo_movimentacao: 'entrada',
      quantidade: 10,
      data_movimentacao: new Date('2026-10-01'),
      observacao: 'Compra inicial de fornecedor'
    }
  });

  await prisma.movimentacaoEstoque.create({
    data: {
      id_disco: disco2.id_disco,
      id_usuario: user2.id_usuario,
      tipo_movimentacao: 'saida',
      quantidade: 3,
      data_movimentacao: new Date('2026-10-05'),
      observacao: 'Venda balcão'
    }
  });

  await prisma.movimentacaoEstoque.create({
    data: {
      id_disco: disco3.id_disco,
      id_usuario: user3.id_usuario,
      tipo_movimentacao: 'entrada',
      quantidade: 8,
      data_movimentacao: new Date('2026-10-10'),
      observacao: 'Reposição de estoque'
    }
  });

  console.log('Banco populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
