import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../middleware/validar-campos.js';
import { validarJWT } from "../middleware/validar-jwts.js";


import { upload } from '../middleware/multer.js'; // tu multer
import cloudinary from '../middleware/cloudinary.js';

import httpUsuarios from '../controllers/usuarios.js';


const router = Router();

router.get("/obt", [
    validarJWT,   
], httpUsuarios.getUsuarios);

router.post("/agregar", [
    validarJWT,
    check("nombre", "El nombre es requerido").notEmpty(),
    check("nombre", "El nombre debe tener al menos 3 caracteres").isLength({ min: 3 }),
    check("correo", "El correo es requerido").notEmpty(),
    check("contrasena", "La contraseña es requerida").notEmpty(),
    check("foto", "La foto es requerida").notEmpty(),
    check("rol", "El rol es requerido").notEmpty(),
    validarCampos,
], httpUsuarios.postUsuarios);

router.put("/actualizar/:id", [
    validarJWT,
    check("nombre", "El nombre es requerido").notEmpty(),
    check("nombre", "El nombre debe tener al menos 3 caracteres").isLength({ min: 3 }),
    check("correo", "El correo es requerido").notEmpty(),
    check("contrasena", "La contraseña es requerida").notEmpty(),
    check("rol", "El rol es requerido").notEmpty(),
    validarCampos,
], httpUsuarios.putUsuarios);

router.post("/login", [
    check("correo", "El correo es obligatorio").isEmail(),
    check("contrasena", "La contraseña es obligatoria").notEmpty(),
    validarCampos,
], httpUsuarios.login);



export default router;