import express from "express";
import "dotenv/config";
import cors from "cors";
import dbConexion from "./database/cnxmongoose.js";

import metas from "./routes/metas.js";
import usuarios from "./routes/usuarios.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 👈 añadido

app.use(express.static("public"));

app.use("/api/metas", metas);
app.use("/api/usuarios", usuarios);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  dbConexion();
});
