const {response} = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario'); 
const { validationResult } = require('express-validator');
const { generarJWT } = require('../helpers/jwt');




const crearUsuario = async (req,res = response) => {

    const {email, password} = req.body;

    try {

        let usuario = await Usuario.findOne({email}); 

        if(usuario)
        {
            return res.status(400).json({
                ok:false,
                msg:'El usuario ya existe con este correo'
            }); 
        }

        
        usuario = new Usuario(req.body); 

        //encriptar contrasena
        const salt = bcrypt.genSaltSync(); 
        usuario.password = bcrypt.hashSync(password, salt); 


        await usuario.save(); 

        //generar jwt
        const token = await generarJWT(usuario.id, usuario.name); 
    
        
        res.status(201).json({
            ok: true, 
            uid: usuario.id,
            name: usuario.name, 
            token
    
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Hubo un problema'
        })

    }
}

const loginUsuario = async (req,res=response) => {

    try {
        const {email, password} = req.body;

        const usuario = await Usuario.findOne({email}); 
    
        if(!usuario)
        {
            return res.status(400).json({
                ok:false,
                msg:'user doesnt exist'
            }); 
        }
    
        //confirmar password
        const validPassword = bcrypt.compareSync(password, usuario.password); 
    
        if(!validPassword){
            return res.status(400).json({
                ok:false,
                msg:'wrong password'
            }); 
        }

        //generar jwt
        const token = await generarJWT(usuario.id, usuario.name); 


        res.json({
            ok:true,
            uid: usuario.id, 
            name: usuario.name, 
            token
        })                           

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Hubo un problema'
        })
    }
}

const revalidarToken = async (req,res=response) => {

    const uid = req.uid; 
    const name = req.name; 

    //generar jwt
    const token = await generarJWT(uid, name); 

    res.json({
        ok: true,
        token
    })
}

module.exports = {
    crearUsuario, 
    loginUsuario, 
    revalidarToken
} 