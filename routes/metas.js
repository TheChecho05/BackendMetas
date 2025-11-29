import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../middleware/validar-campos.js';
import { validarJWT } from "../middleware/validar-jwts.js";
import httpMetas from '../controllers/metas.js';
import helpersUsuario from '../helpers/usuarios.js';


const router = Router();

router.get("/obt",[
    validarJWT,
], httpMetas.getMetas);

router.get("/obt/:idusuario",[
    validarJWT,
], httpMetas.getMetasByUsuario);

router.post("/agregar", [
    validarJWT,
    check("tipo", "El tipo es requerido").notEmpty(),
    // check("valor", "El valor es requerido").notEmpty(),
    // check("valor", "El valor debe ser numérico").isNumeric(),
    check("texto", "El tipo es requerido").notEmpty(),
    check("mes", "El mes es requerido").notEmpty(),
    check("anio", "El año es requerido").notEmpty(),
    check("idusuario", "El ID del usuario es requerido").notEmpty(),
    check("idusuario").custom(helpersUsuario.validarExistaIdUsuario),
    validarCampos,
], httpMetas.postMetas);

router.put("/actualizar/:id", [
  validarJWT,
    check("id", "ID de sala invalido").isMongoId(),
    // check("valor", "El valor es requerido").notEmpty(),
    // check("valor", "El valor debe ser numérico").isNumeric(),
    // check("valor", "El valor ideal debe ser numérico").isNumeric(),
    check("texto", "El texto es requerido").notEmpty(),
    check("mes", "El mes es requerido").notEmpty(),
    check("anio", "El año es requerido").notEmpty(),
    validarCampos,
], httpMetas.putMetas);

router.get("/promedios/:idusuario/:tipo", httpMetas.getPromedios);

router.get("/promediostodos/:idusuario/:tipo", httpMetas.getPromediosTodos);

router.get("/ac/:idusuario/tipo/:tipo/", httpMetas.getAcByUsuario);

router.get("/cumplimiento/:idusuario", httpMetas.getCumplimientoAnual);

router.delete("/borrar/:id", httpMetas.deleteMetas);


export default router;