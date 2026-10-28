require('dotenv').config();
const express = require('express');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const authRoutes = require('./src/routes/auth_routes');
const discoRoutes = require('./src/routes/disco_routes');
const movimentacaoRoutes = require('./src/routes/movi_routes');

app.use('/auth', authRoutes);
app.use('/discos', discoRoutes);
app.use('/movimentacoes', movimentacaoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} `);
});