const mongoose = require('../../config/database');
const bcryptjs = require('bcryptjs');
const validator = require('validator');


const UserSchema = new mongoose.Schema({      
    name:{
        type: String,
        required: [true,'Nome é Obrigatório'],
        minlength:[6,'Deve ter mais de 6 caracteres'],
        maxlength:[40,'Deve possuir menos de 40 caracteres'],
    },
    email:{
        type: String,
        unique:true,
        required:[true,'Nome é Obrigatório'],
        lowercase: true,
        validate: [ validator.isEmail, 'Email inválido' ],
    },
    phone:{
        type: String,
        required: true,
        minlength:[11,'Deve Ter 11 caracteres '],
        maxlength:[11,'Deve Ter 11 caracteres'],
    },
    occupation_area:{
        type:String,
        required:[true,'Area de ocupação é Obrigatória'],
    },
    photo:{ 
        data: Buffer, 
        contentType: String, 
    },
    emailVerifiedAt:{
        type:Date
    },
    emailVerificationToken:{
        type: String,
        select: false,
    },
    emailVTokenExpiresAt:{
        type:Date,
        select:false,
    },
    password:{
        type: String,
        required: true,
        select: false,

    },
    passwordResetToken:{
        type: String,
        select: false,
    },
    passwordResetExpiresAt:{
        type:Date,
        select:false
    },
    created_At:{
        type: Date,
        default: Date.now,
    }
});

UserSchema.pre('save',async function(next){
    const hash =  await bcryptjs.hash(this.password,10);
    this.password = hash;
    next();
});
UserSchema.pre('remove', function(next) {
    //Aqui deve se remover todas as referencias ao objeto 
    //gerando um efeito OnDeleteCascade
    next();
});
const User = mongoose.model('User',UserSchema);
   
module.exports = User;