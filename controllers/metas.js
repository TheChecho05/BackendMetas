import Metas from "../models/metas.js";
import mongoose from "mongoose";

const httpMetas = {
  getMetas: async (req, res) => {
    try {
      const metas = await Metas.find().populate("idusuario");
      res.json({ metas });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las metas" });
    }
  },
  getMetasByUsuario: async (req, res) => {
    try {
      const { idusuario } = req.params;
      const metas = await Metas.find({ idusuario });
      if (!metas || metas.length === 0) {
        return res
          .status(404)
          .json({ message: "No se encontraron metas para este usuario" });
      }
      res.json({ metas });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error al obtener las metas del usuario" });
    }
  },
  getAcByUsuario: async (req, res) => {
    try {
      const { idusuario, tipo } = req.params;

      const metas = await Metas.find({
        idusuario: new mongoose.Types.ObjectId(idusuario),
        tipo: tipo,
      }).select("valorideal mes anio");

      if (!metas || metas.length === 0) {
        return res.status(404).json({
          message: "No se encontraron metas para este usuario y tipo",
        });
      }

      let resultado = Array(12).fill(0);

      metas.forEach((m) => {
        resultado[m.mes - 1] = m.valorideal;
      });

      res.json({ valores: resultado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener las metas filtradas" });
    }
  },
  getPromedios: async (req, res) => {
    try {
      const { idusuario, tipo } = req.params;

      const metas = await Metas.find({
        idusuario: new mongoose.Types.ObjectId(idusuario),
        tipo,
      }).select("valor mes anio");

      if (!metas || metas.length === 0) {
        return res
          .status(404)
          .json({ message: "No hay metas para este usuario" });
      }

      const valoresPorMes = Array(12).fill(0);
      const mesesConValor = [];

      metas.forEach((m) => {
        const indice = m.mes - 1;
        valoresPorMes[indice] = m.valor;
        mesesConValor.push(m.valor);
      });

      const promedio =
        mesesConValor.reduce((a, b) => a + b, 0) / mesesConValor.length;

      res.json({
        tipo,
        valores: valoresPorMes,
        promedio: Math.round(promedio * 100) / 100,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al calcular promedios" });
    }
  },

  postMetas: async (req, res) => {
    try {
      const { tipo, valor, valorideal, texto, mes, anio, idusuario,  } = req.body;
      const meta = new Metas({ tipo, valor, valorideal, texto , mes, anio, idusuario });
      await meta.save();
      res.json({ message: "Meta creada satisfactoriamente", meta });
    } catch (error) {
      console.log(error);
      res.status(400).json({ err: "No se pudo crear la meta" });
    }
  },
  putMetas: async (req, res) => {
    const { id } = req.params;
    const { ...resto } = req.body;
    const meta = await Metas.findByIdAndUpdate(id, resto, { new: true });
    res.json(meta);
  },
};
export default httpMetas;
