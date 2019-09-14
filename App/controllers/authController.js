const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

const authconfig = require('../../config/server/auth');
const mailer = require('../../config/modules/mailer')
const router = express.Router();



const User = require('../models/user');

function generateToken(params = {}) {
    return jwt.sign(params, authconfig.secret, {
        expiresIn: 86400,
    });
}
router.post('/register', async (req, res) => {
    const { name, email, phone, occupation_area, password } = req.body;
    var { photo } = req.body;
    var hasPhoto = false;
    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'Email Already used' });

        if (photo){
            hasPhoto =true;
            photo = {
                data: fs.readFileSync(photo),
                contentType: 'image/png'
            }
        }
        var user = await User.create({name,email,phone,occupation_area,password});
        if(hasPhoto){
            user.photo.data = photo.data;
            user.photo.contentType = photo.contentType;
            await user.save();
        }
        
        user.password = undefined;
        return res.send({
            user,
            token: generateToken({ id: user._id })
        });
    } catch (err) {
        console.log(err);
                
        if(err.name =='ValidationError')
            return res.status(400).send({ error: err.message });

        return res.status(400).send({ error: 'Registration fail' });

    }

});
router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'User not found' });
    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid Password' });

    user.password = undefined;
    res.send({
        user,
        token: generateToken({ id: user._id })
    });
});
router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).send({ error: 'User not found' });

        const token = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await User.findByIdAndUpdate(user._id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpiresAt: expiresAt,
            }
        });
        mailer.sendMail({
            to: email,
            from: 'suporte@sinergiasolucoes.com',
            template: 'forgot_password',
            context: { token },
        }, (err) => {
            if (err) {

                return res.status(400).send({ error: 'Cannot send forgot password mail' });
            }
            res.send();
        });


    } catch (err) {
        console.log(err);
        res.status(400).send({ error: 'Error on forgot password,please try again' })
    }
});
router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;
    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpiresAt');
        if (!user)
            return res.status(400).send({ error: 'User not found!' });
        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Invalid Token!' });

        const now = new Date();

        if (now > user.passwordResetExpiresAt)
            return res.status(400).send({ error: 'Expired Token, generate a new one.' });

        user.password = password;
        await user.save();
        res.send();
    } catch (err) {
        return res.status(400).send({ error: 'Cannot reset password, try again' });

    }


});
router.post('/email_verification', async (req, res) => {
    const { email, token, password } = req.body;
    try {
        const user = await User.findOne({ email })
            .select('+emailVerificationToken emailVTokenExpiresAt');
        if (!user)
            return res.status(400).send({ error: 'User not found!' });
        if (token !== user.emailVerificationToken)
            return res.status(400).send({ error: 'Invalid Token!' });
        const now = new Date();

        if (now > user.emailVTokenExpiresAt)
            return res.status(400).send({ error: 'Expired Token, generate a new one.' });

        user.emailVerifiedAt = now;
        user.password = password;
        await user.save();
        res.send();

    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Cannot send Email verification, try again.' });
    }


});
router.post('/send_verification_mail', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).send({ error: 'User not found' });

        const token = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
        var expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await User.findByIdAndUpdate(user._id, {
            '$set': {
                emailVerificationToken: token,
                emailVTokenExpiresAt: expiresAt,
            }
        });
        mailer.sendMail({
            to: email,
            from: 'suporte@sinergiasolucoes.com',
            template: 'validate_email',
            context: { token },
        }, (err) => {
            if (err) {

                return res.status(400).send({ error: 'Cannot send verification mail' });
            }
            res.send();
        });


    } catch (err) {
        console.log(err);
        res.status(400).send({ error: 'Error on send verification mail,please try again' })
    }
});
module.exports = app => app.use('/auth', router);