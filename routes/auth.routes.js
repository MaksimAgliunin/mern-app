const {Router} = require('express');
const bcrypt = require('bcryptjs')
const config = require('config');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator')
const User = require('../models/User');
const router = Router();


// api/auth
router.post(
    '/register',
    [
        check('email', 'Incorrect email').isEmail(),
        check('password', 'Password must contain at least 6 symbols')
            .isLength({min: 6}),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);  // validating fields
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Incorrect data from register form'
                })
            }
            const {email, password} = req.body;

            const candidate = await User.findOne({email});
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
    })
// api/login
router.post(
    '/login',
    [
        check('email', 'Enter valid email').normalizeEmail().isEmail(),
        check('password', 'Enter valid password').exists()  // password must exist
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);  // validating fields
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Incorrect login data'
                })
            }

            const {email, password} = req.body;
            const user = await User.findOne({email});
            if (!user) {
                return res.status(404).json({message: 'User is not found'});
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({message: 'Invalid password, try again'});
            }

            const token = jwt.sign(
                {userId: user.id},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            )

            res.json({token, userId: user.id});

        } catch (e) {
            res.status(500).json({message: 'Something went wrong, try again'})
        }
    })

module.exports = router;