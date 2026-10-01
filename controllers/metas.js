import Metas from "../models/metas.js";
import mongoose from "mongoose";

const traduccionesTipo = {
  "MANTENIMIENTOS CORRECTIVOS": "CUMPLIMIENTO DE CORRECTIVOS",
  "SL ACIDO": "SL Acido (KA)",
};

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

      const existeMeta = await Metas.findOne({
        tipo,
        mes,
        anio,
        idusuario,
      });

      if (existeMeta) {
        return res.status(400).json({
          message: "Ya existe una meta, Con este mes y año",
        });
      }

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

      res.json({
        message: "Meta creada satisfactoriamente",
        meta,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        err: "No se pudo crear la meta",
      });
    }
  },
  putMetas: async (req, res) => {
    try {
      const { id } = req.params;

      const { tipo, mes, anio, idusuario, ...resto } = req.body;

      const existeMeta = await Metas.findOne({
        tipo,
        mes,
        anio,
        idusuario,
        _id: { $ne: id },
      });

      if (existeMeta) {
        return res.status(400).json({
          message:
            "Ya existe una meta con ese tipo, mes y año para este usuario",
        });
      }

      const meta = await Metas.findByIdAndUpdate(
        id,
        {
          tipo,
          mes,
          anio,
          idusuario,
          ...resto,
        },
        { new: true }
      );

      res.json(meta);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        err: "No se pudo actualizar la meta",
      });
    }
  },
  getAcByUsuario: async (req, res) => {
    try {
      const { idusuario, tipo } = req.params;

      const tipoBusqueda = traduccionesTipo[tipo] || tipo;

      const metas = await Metas.find({
        idusuario: new mongoose.Types.ObjectId(idusuario),
        tipo: tipoBusqueda,
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

      const tipoBusqueda = traduccionesTipo[tipo] || tipo;

      const metas = await Metas.find({
        idusuario: new mongoose.Types.ObjectId(idusuario),
        tipo: tipoBusqueda,
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

      const tipoBusqueda = traduccionesTipo[tipo] || tipo;

      const metas = await Metas.find({
        idusuario: new mongoose.Types.ObjectId(idusuario),
        tipo: tipoBusqueda,
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
  getPromediosTodosAnio: async (req, res) => {
    try {
      const { idusuario, tipo, anio } = req.params;

      const tipoBusqueda = traduccionesTipo[tipo] || tipo;

      const metas = await Metas.find({
        idusuario: new mongoose.Types.ObjectId(idusuario),
        tipo: tipoBusqueda,
        anio: Number(anio),
      }).select("valor valorideal mes anio");

      if (!metas || metas.length === 0) {
        return res.status(404).json({
          message: "No hay metas para este usuario en el año seleccionado",
        });
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
        anio,
        valores: valoresPorMes,
        promedio: Math.round(promedio * 100) / 100,
        valoresIdeal: valoresIdealPorMes,
        promedioIdeal: Math.round(promedioIdeal * 100) / 100,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error al calcular promedios por año",
      });
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
        "ASSET EFFIENCIENCY": 20,
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
          case "DPO": cumplida = meta.valor >= meta.valorideal; break;
          case "NPS": cumplida = meta.valor <= meta.valorideal; break;
          case "OTIF": cumplida = meta.valor <= meta.valorideal; break;
          case "HCD": cumplida = meta.valorideal > meta.valor; break;
          case "VLC T2": cumplida = meta.valorideal < meta.valor; break;
          case "HL NO ENTREGADO": cumplida = meta.valorideal < meta.valor; break;
          case "TOTAL PRODUCTIVITY": cumplida = meta.valor < meta.valorideal; break;
          case "ENTREGA RANGO": cumplida = meta.valorideal > meta.valor; break;
          case "VLC LS": cumplida = meta.valor >= meta.valorideal; break;
          case "IRA": cumplida = meta.valor <= meta.valorideal; break;
          case "SCO": cumplida = meta.valorideal > meta.valor; break;
          case "ATCT": cumplida = meta.valorideal < meta.valor; break;
          case "WNP": cumplida = meta.valorideal > meta.valor; break;
          case "HL NO PLANEADO": cumplida = meta.valorideal > meta.valor; break;
          case "RUTAS SIF": cumplida = meta.valor >= meta.valorideal; break;
          case "SIF INDEX": cumplida = meta.valorideal >= meta.valor; break;
          case "ACIS": cumplida = meta.valorideal >= meta.valor; break;
          case "LTI": cumplida = meta.valor <= meta.valorideal; break;
          case "ON TIME": cumplida = meta.valor <= meta.valorideal; break;
          case "ASSET EFFIENCIENCY": cumplida = meta.valor >= meta.valorideal; break;
          case "CUMPLIMIENTO DE CORRECTIVOS": cumplida = meta.valorideal > meta.valor; break;
          case "DISPONIBILIDAD DE FLOTA": cumplida = meta.valorideal > meta.valor; break;
          case "Asset Efficiency - MAZ": cumplida = meta.valorideal >= meta.valor; break;
          case "Service Level in full": cumplida = meta.valorideal <= meta.valor; break;
          case "TSO MAZ": cumplida = meta.valorideal <= meta.valor; break;
          case "VLC TOTAL (P&P)": cumplida = meta.valorideal <= meta.valor; break;
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

      const mesesConDatos = cumplimientoMeses.filter(v => v > 0);
      const YTD = mesesConDatos.length > 0
        ? (mesesConDatos.reduce((a, b) => a + b, 0) / mesesConDatos.length).toFixed(2)
        : 0;

      res.json({
        idusuario,
        cumplimientoAnual: resultado,
        YTD: `${YTD}`
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al calcular el cumplimiento anual" });
    }
  },
  getCumplimientoAnio: async (req, res) => {
    try {
      const { idusuario, anio } = req.params;

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
        "ASSET EFFIENCIENCY": 20,
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
        idusuario: new mongoose.Types.ObjectId(idusuario),
        anio: Number(anio)
      });

      if (!metas || metas.length === 0) {
        return res.status(404).json({
          message: "No se encontraron metas para este usuario en ese año"
        });
      }

      let cumplimientoMeses = Array(12).fill(0);

      let grupoEspecial = Array.from(
        { length: 12 },
        () => []
      );

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

          case "ASSET EFFIENCIENCY":
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
        const totalCumplidas =
          cumplidas.filter(c => c).length;

        if (totalCumplidas >= 4) {
          cumplimientoMeses[index] += 20;
        }
      });

      const nombresMeses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
      ];

      const resultado = cumplimientoMeses.map((valor, i) => ({
        mes: nombresMeses[i],
        cumplimiento: `${valor}`
      }));

      const mesesConDatos =
        cumplimientoMeses.filter(v => v > 0);

      const YTD =
        mesesConDatos.length > 0
          ? (
              mesesConDatos.reduce((a, b) => a + b, 0)
              / mesesConDatos.length
            ).toFixed(2)
          : 0;

      res.json({
        idusuario,
        anio,
        cumplimientoAnual: resultado,
        YTD: `${YTD}`
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error al calcular el cumplimiento anual"
      });
    }
  },
      getCumplimiento2026: async (req, res) => {
    try {
      const { idusuario, anio } = req.params;

      // MAPEO DE MESES EN TEXTO A NÚMEROS (Soluciona el problema de "Agosto")
      const mesesMap = {
        "Enero": 1, "Febrero": 2, "Marzo": 3, "Abril": 4, "Mayo": 5, "Junio": 6,
        "Julio": 7, "Agosto": 8, "Septiembre": 9, "Octubre": 10, "Noviembre": 11, "Diciembre": 12
      };

      const pesos = {
        "ACIS": 15,
        "ASSET EFFIENCIENCY": 15,
        "ASSET UTILIZATION": 15,
        "ATCT 1": 10,
        "ATCT 2": 5,
        "CO Logistic T2 Regional Dashboard": 25,
        "DELIVERY EXPERIENCE": 10,
        "DISPONIBILIDAD DE FLOTA": 20,
        "DPO": 20,
        "HL NO ENTREGADO": 5,
        "HL NO PLANEADO": 10,
        "LTI's": 15,
        "MANTENIMIENTOS CORRECTIVOS": 10,
        "CUMPLIMIENTO DE CORRECTIVOS": 10,
        "NPS 1": 15,
        "NPS 2": 5,
        "ON TIME": 20,
        "OTIF": 15,
        "ROUTE TO MARKET": 5,
        "RTM": 5,
        "RUTAS SIF": 20,
        "SCO": 15,
        "Service Level in full": 10,
        "SIF INDEX": 15,
        "SL Acido (KA)": 5,
        "TOTAL PRODUCTIVITY": 10,
        "Total losses (Productividad)": 15,
        "TRI": 5,
        "TSO": 10,
        "TSO MAZ": 10,
        "VLC LS": 20,
        "VLC T2": 20,
        "VLC TOTAL (P&P)": 20,
        "WNP": 5
      };

      const metas = await Metas.find({
        idusuario: new mongoose.Types.ObjectId(idusuario),
        anio: Number(anio)
      });

      if (!metas || metas.length === 0) {
        return res.status(404).json({
          message: "No se encontraron metas para este usuario en ese año"
        });
      }

      let cumplimientoMeses = Array(12).fill(0);

      metas.forEach(meta => {
        const peso = pesos[meta.tipo.trim()] || 0;

        // Convertir el mes a número (soporta "Agosto" o 8)
        const mesNumero = typeof meta.mes === 'string' 
          ? (mesesMap[meta.mes.trim()] || Number(meta.mes)) 
          : Number(meta.mes);
        
        const indiceMes = mesNumero - 1;

        // Si el mes no es válido, saltamos este registro
        if (isNaN(indiceMes) || indiceMes < 0 || indiceMes > 11) return;

        // AQUÍ ESTÁ LA CLAVE: 
        // meta.valor = AC (Actual)
        // meta.valorideal = BGT (Meta Ideal)
        const actual = Number(meta.valor);
        const ideal = Number(meta.valorideal);

        if (isNaN(actual) || isNaN(ideal)) return;

        let cumplida = false;

        switch (meta.tipo.trim()) {
          case "DPO":
            cumplida = actual <= ideal; // 100 <= 99 -> Falso (Rojo)
            break;

          case "NPS 1":
          case "NPS 2":
            cumplida = actual >= ideal; // 71.1 >= 69.5 -> Verdadero (Verde)
            break;

          case "OTIF":
            cumplida = actual >= ideal; // 85.04 >= 90.63 -> Falso (Rojo)
            break;

          case "SCO":
            cumplida = ideal > actual;
            break;

          case "ATCT 1":
          case "ATCT 2":
            cumplida = actual >= ideal;
            break;

          case "WNP":
            cumplida = actual >= ideal; 
            break;

          case "HL NO PLANEADO":
            cumplida = ideal > actual;
            break;

          case "RUTAS SIF":
            cumplida = actual >= ideal;
            break;

          case "SIF INDEX":
            cumplida = ideal >= actual;
            break;

          case "ACIS":
            cumplida = ideal >= actual;
            break;

          case "ON TIME":
            cumplida = actual <= ideal;
            break;

          case "ASSET EFFIENCIENCY":
            cumplida = actual <= ideal;
            break;

          case "ASSET UTILIZATION":
            cumplida = actual <= ideal;
            break;

          case "DISPONIBILIDAD DE FLOTA":
            // NOTA: Si en tu Excel 95.55 (AC) vs 92 (BGT) es Verde, cambia esto a: actual >= ideal
            cumplida = ideal > actual; 
            break;

          case "MANTENIMIENTOS CORRECTIVOS":
          case "CUMPLIMIENTO DE CORRECTIVOS":
            cumplida = actual >= ideal;
            break;

          case "Service Level in full":
            cumplida = actual >= ideal;
            break;

          case "TSO MAZ":
            cumplida = actual >= ideal;
            break;

          case "VLC TOTAL (P&P)":
            cumplida = actual >= ideal;
            break;

          case "VLC LS":
            cumplida = actual >= ideal;
            break;

          case "HL NO ENTREGADO":
            cumplida = actual <= ideal; // 3.78 <= 4.00 -> Verdadero (Verde)
            break;

          case "TOTAL PRODUCTIVITY":
            cumplida = actual >= ideal; // 1.62 >= 1.83 -> Falso (Rojo)
            break;

          case "VLC T2":
            cumplida = actual <= ideal; // 5.46 <= 5.48 -> Verdadero (Verde)
            break;

          case "DELIVERY EXPERIENCE":
            cumplida = actual >= ideal; // 6.76 >= 4.92 -> Verdadero (Verde)
            break;

          case "ROUTE TO MARKET":
            cumplida = actual >= ideal; // 3.49 >= 3.63 -> Falso (Rojo)
            break;

          case "RTM":
            cumplida = actual >= ideal;
            break;

          case "LTI's":
            cumplida = actual >= ideal;
            break;

          case "Total losses (Productividad)":
            cumplida = actual >= ideal; 
            break;

          case "TRI":
            cumplida = actual >= ideal;
            break;

          case "TSO":
            cumplida = actual >= ideal; 
            break;

          case "SL Acido (KA)":
            cumplida = actual >= ideal;
            break;

          case "CO Logistic T2 Regional Dashboard":
            cumplida = actual >= ideal;
            break;

          default:
            cumplida = actual >= ideal;
        }

        if (peso > 0 && cumplida) {
          cumplimientoMeses[indiceMes] += peso;
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

      const mesesConDatos = cumplimientoMeses.filter(v => v > 0);

      const YTD =
        mesesConDatos.length > 0
          ? (
              mesesConDatos.reduce((a, b) => a + b, 0) /
              mesesConDatos.length
            ).toFixed(2)
          : 0;

      res.json({
        idusuario,
        anio,
        cumplimientoAnual: resultado,
        YTD: `${YTD}`
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error al calcular el cumplimiento anual 2026"
      });
    }
  },
  deleteMetas: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const meta = await Metas.findByIdAndDelete(id);

      if (!meta) {
        return res.status(404).json({ message: "Meta no encontrada" });
      }

      res.json({ message: "Meta eliminada correctamente", meta });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al eliminar la meta" });
    }
  },
};
export default httpMetas;