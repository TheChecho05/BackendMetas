import mongoose from "mongoose";

const metaSchema=new mongoose.Schema({
    tipo:{type:String,required:true},
    valor:{type:Number},
    valorideal:{type:Number},
    texto:{type:String,required:true},
    mes:{type:Number,required:true},
    anio:{type:Number,required:true},
    idusuario:{type:mongoose.Schema.Types.ObjectId,ref:'Usuario',required:true},
})

export default mongoose.model("Meta",metaSchema)
