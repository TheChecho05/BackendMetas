import Usuario from "../models/usuarios.js"

    const helpersUsuario = {
        validarExistaIdUsuario:async (id)=>{
            const existe = await Usuario.findById(id)
            if (existe==undefined){
                throw new Error ("Id del Usuario no existe")
            }
        },
        validarCorreoUnico:async (correo) =>{
            const unico = await Administrador.findOne({correo})
            if(unico){
                throw new Error ("Correo Existe")
            }
        },
        validarTelefonoUnico:async (telefono) =>{
            const unico = await Administrador.findOne({telefono})
            if(unico){
                throw new Error ("Telefono Existe")
            }
        },
}

export default helpersUsuario