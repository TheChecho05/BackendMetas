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
  postMetas: async (req, res) => {
    try {
      const { tipo, valor, valorideal, texto, mes, anio, idusuario } = req.body;
      const meta = new Metas({
        tipo,
        valor,
        valorideal,
        texto,
        mes,
        anio,
        idusuario,
      });
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
  getPromediosTodos: async (req, res) => {
    try {
      const { idusuario, tipo } = req.params;

      const metas = await Metas.find({
        idusuario: new mongoose.Types.ObjectId(idusuario),
        tipo,
      }).select("valor valorideal mes anio");

      if (!metas || metas.length === 0) {
        return res
          .status(404)
          .json({ message: "No hay metas para este usuario" });
      }

      const valoresPorMes = Array(12).fill(0);
      const valoresIdealPorMes = Array(12).fill(0);
      const mesesConValor = [];
      const mesesConValorIdeal = [];

      metas.forEach((m) => {
        const indice = m.mes - 1;
        valoresPorMes[indice] = m.valor;
        if (m.valorideal !== undefined && m.valorideal !== null) {
          valoresIdealPorMes[indice] = m.valorideal;
          mesesConValorIdeal.push(m.valorideal);
        }
        mesesConValor.push(m.valor);
      });

      const promedio =
        mesesConValor.reduce((a, b) => a + b, 0) / mesesConValor.length;

      const promedioIdeal =
        mesesConValorIdeal.length > 0
          ? mesesConValorIdeal.reduce((a, b) => a + b, 0) /
            mesesConValorIdeal.length
          : 0;

      res.json({
        tipo,
        valores: valoresPorMes,
        promedio: Math.round(promedio * 100) / 100,
        valoresIdeal: valoresIdealPorMes,
        promedioIdeal: Math.round(promedioIdeal * 100) / 100,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error al calcular promedios con valor ideal" });
    }
  },
  getCumplimientoAnual: async (req, res) => {
  try {
    const { idusuario } = req.params;

    const pesos = {
      "DPO": 20,
      "NPS": 15,
      "OTIF": 15,
      "HCD": 10,
      "IRA": 15,
      "SCO": 15,
      "ATCT": 10,
      "WNP": 10,
      "RUTAS SIF": 20,
      "SIF INDEX": 15,
      "ACIS": 15,
      "LTI": 15,
      "ON TIME": 20,
      "ASSET EFFICIENCY": 20,
      "CUMPLIMIENTO DE CORRECTIVOS": 20,
      "DISPONIBILIDAD DE FLOTA": 20,
      "VLC T2": 10,
      "VLC LS": 10,
      "HL NO ENTREGADO": 10,
      "HL NO PLANEADO": 10,
      "TOTAL PRODUCTIVITY": 10,
      "ENTREGA RANGO": 10,
      "Asset Efficiency - MAZ": 20,
      "Service Level in full": 10,
      "TSO MAZ": 10,
      "VLC TOTAL (P&P)": 20,
      "Modelos de Distribucion": 0,
      "SCL": 0,
      "TP": 0,
      "NPS DB": 0,
      "CONTROL POLICIES": 0
    };

    const metas = await Metas.find({
      idusuario: new mongoose.Types.ObjectId(idusuario)
    });

    if (!metas || metas.length === 0) {
      return res.status(404).json({ message: "No se encontraron metas para este usuario" });
    }

    let cumplimientoMeses = Array(12).fill(0);
    let grupoEspecial = Array.from({ length: 12 }, () => []);

    metas.forEach(meta => {
      const peso = pesos[meta.tipo] || 0;
      let cumplida = false;

      switch (meta.tipo) {
        case "DPO":
          cumplida = meta.valor >= meta.valorideal;
          break;
        case "NPS":
          cumplida = meta.valor <= meta.valorideal;
          break;
        case "OTIF":
          cumplida = meta.valor <= meta.valorideal;
          break;
        case "HCD":
          cumplida = meta.valorideal > meta.valor;
          break;
        case "VLC T2":
          cumplida = meta.valorideal < meta.valor;
          break;
        case "HL NO ENTREGADO":
          cumplida = meta.valorideal < meta.valor;
          break;
        case "TOTAL PRODUCTIVITY":
          cumplida = meta.valor < meta.valorideal;
          break;
        case "ENTREGA RANGO":
          cumplida = meta.valorideal > meta.valor;
          break;
        case "VLC LS":
          cumplida = meta.valor >= meta.valorideal;
          break;
        case "IRA":
          cumplida = meta.valor <= meta.valorideal;
          break;
        case "SCO":
          cumplida = meta.valorideal > meta.valor;
          break;
        case "ATCT":
          cumplida = meta.valorideal < meta.valor;
          break;
        case "WNP":
          cumplida = meta.valorideal > meta.valor;
          break;
        case "HL NO PLANEADO":
          cumplida = meta.valorideal > meta.valor;
          break;
        case "RUTAS SIF":
          cumplida = meta.valor >= meta.valorideal;
          break;
        case "SIF INDEX":
          cumplida = meta.valorideal >= meta.valor;
          break;
        case "ACIS":
          cumplida = meta.valorideal >= meta.valor;
          break;
        case "LTI":
          cumplida = meta.valor <= meta.valorideal;
          break;
        case "ON TIME":
          cumplida = meta.valor <= meta.valorideal;
          break;
        case "ASSET EFFICIENCY":
          cumplida = meta.valor >= meta.valorideal;
          break;
        case "CUMPLIMIENTO DE CORRECTIVOS":
          cumplida = meta.valorideal > meta.valor;
          break;
        case "DISPONIBILIDAD DE FLOTA":
          cumplida = meta.valorideal > meta.valor;
          break;
        case "Asset Efficiency - MAZ":
          cumplida = meta.valorideal >= meta.valor;
          break;
        case "Service Level in full":
          cumplida = meta.valorideal <= meta.valor;
          break;
        case "TSO MAZ":
          cumplida = meta.valorideal <= meta.valor;
          break;
        case "VLC TOTAL (P&P)":
          cumplida = meta.valorideal <= meta.valor;
          break;
        case "Modelos de Distribucion":
        case "SCL":
        case "TP":
        case "NPS DB":
        case "CONTROL POLICIES":
          cumplida = meta.valorideal > meta.valor;
          grupoEspecial[meta.mes - 1].push(cumplida);
          break;
        default:
          cumplida = meta.valor >= meta.valorideal;
      }

      if (peso > 0 && cumplida) {
        cumplimientoMeses[meta.mes - 1] += peso;
      }
    });

    grupoEspecial.forEach((cumplidas, index) => {
      const totalCumplidas = cumplidas.filter(c => c).length;
      if (totalCumplidas >= 4) {
        cumplimientoMeses[index] += 20;
      }
    });

    const nombresMeses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const resultado = cumplimientoMeses.map((valor, i) => ({
      mes: nombresMeses[i],
      cumplimiento: `${valor}`
    }));

    res.json({
      idusuario,
      cumplimientoAnual: resultado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al calcular el cumplimiento anual" });
  }
},


};
export default httpMetas;
