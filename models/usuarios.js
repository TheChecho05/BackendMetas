import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  correo: { type: String, required: true, unique: true, lowercase: true },
  contrasena: { type: String, required: true },
  foto:{ type: String},
  rol: { type:String,required:true},
  estado: { type:Number,default:1}
});

export default mongoose.model("Usuario", UsuarioSchema);
