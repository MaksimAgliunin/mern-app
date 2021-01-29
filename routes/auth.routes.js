const {Router} = require('express');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator')
const User = require('../models/User');
const router = Router();

// api/auth
router.post(
    '/reqister',
    [
        check('email', 'Incorrect email').isEmail(),
        check('password', 'Password must contain at least 6 symbols')
            .isLength({min: 6}),
],
async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email: email});
        if (candidate) {
            return res.status(400).json({message: `User with this email: ${email} already exist`})
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({email, password: hashedPassword});

        await user.save();

        res.status(201).json({message: 'User successfully created'});

    } catch (e) {
        res.status(500).json({message: 'Something went wrong, try again'})
    }
}
)
// api/login
router.post('/login', async (req, res) => {

})

module.exports = router;