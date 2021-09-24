const bcrypt = require('bcrypt');
const  passport = require('passport');
const User = require('../../models/user')
function authController() {
    return {
        login(req,res) {
            res.render('auth/login');
        },
        postLogin(req, res, next) {
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message)
                    return next(err)

                }
                if(!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.login(user, (err) => {
                    if(err){
                        req.flash('error', info.message)
                        return next(err)
                    }
                    return res.redirect('/')
                })

            })(req,res,next)
        },
        register(req,res) {
            res.render('auth/register')
        },
        async postregister(req,res) {
            const {name, email, password} = req.body
            if (!name || !email || !password ) {
                req.flash('error','All fields are required')
                req.flash('name',name)
                req.flash('email',email)
                return res.redirect('/register')
            }

            User.exists({ email: email}, (err, result) =>{
                if(result) {
                    req.flash('error', 'Email already taken')
                    req.flash('name', name)
                    req.flash('email',email)
                    return res.redirect('/register')
                }
            
            })

            const hashedpassword = await bcrypt.hash(password, 10)
            const user = new User({
                name: name,
                email: email,
                password: hashedpassword
            })

            user.save().then((user) => {

                return res.redirect('/')
            }).catch(err => {
                res.flash('error', 'Something went wrong')
                return res.redirect('/register')

            })
        },
        logout(req, res) {
            req.logout()
            return res.redirect('/')
        }
        }
    }

module.exports= authController;