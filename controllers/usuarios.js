import Usuarios from "../models/usuarios.js"
import bcryptjs from "bcryptjs";
import { generarJWT } from "../middleware/validar-jwts.js";

const httpUsuarios = {
    getUsuarios: async (req, res) => {
        try {
            const usuarios = await Usuarios.find()
            res.json({ usuarios });
        } catch (error) {
            res.status(500).json({ error: "Error al obtener las usuarios" });
        }
    },
    postUsuarios: async (req, res) => {
        try {
            const {nombre,correo,contrasena,foto,rol} = req.body;
            const usuario = new Usuarios({nombre,correo,contrasena,foto,rol});
            const salt = bcryptjs.genSaltSync();
            usuario.contrasena = bcryptjs.hashSync(contrasena, salt)
            await usuario.save();
            console.log(usuario);
            res.json({ message: "Usuario creada satisfactoriamente", usuario });
        } catch (error) {
            console.log(error);
            res.status(400).json({ err: "No se pudo crear la usuario" });
        }
    },
    login: async (req, res) => {
        const { correo, contrasena } = req.body;

        try {
            const usuario = await Usuarios.findOne({ correo }) 
            if (!usuario) {
                return res.status(401).json({
                    // msg: "Usuario / Password no son correctos+"
                    msg: "correo no es correcto"
                })
            }

            const validPassword = bcryptjs.compareSync(contrasena, usuario.contrasena);
            if (!validPassword) {
                return res.status(401).json({
                    // msg: "Usuario / Password no son correctos"
                    msg: "contrasena no es correcto"
                })
            }

            const token = await generarJWT(usuario._id);
            res.json({
                usuario,
                token
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({

                msg: "Hable con el WebMaster"
            })
        }
    },
    }
export default httpUsuarios