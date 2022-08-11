import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    getlogindata,
    getusername,
    passtokenset,
    updateuserpassDetails,
    getUserpasstoken
} from "./helper.js";

const router = express.Router();

async function genhashpassword(password) {
    //no.of.salting = 10
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    // console.log(hashedpassword);
    return hashedpassword;
};

router.post("/register", async function (req, res) {
    try {
        const { email, password } = req.body;
        const hashedpassword = await genhashpassword(password);
        const existuser = await getusername(email);

        if (existuser) {

            res.status(422).send({ error: "already email exist" });
            console.log(existuser.error);
        } else {
            const result = getlogindata({ email: email, password: hashedpassword });
            res.status(200).send({ msg: "sucessfully registered" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "internal server error" });
    };
});

router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;
        const existuser = await getusername(email);
        if (!existuser) {
            res.status(401).send({ error: "User dose not exist" })
        } else {
            const storedpassword = existuser.password;
            const ispasswordmatch = await bcrypt.compare(password, storedpassword);
            if (ispasswordmatch) {
                const token = jwt.sign({ id: existuser._id }, process.env.SECRET_KEY);
                res.send({ msg: "sucessfull login", token: token });
            } else {
                res.status(401).send({ error: "invalid password or email" });
            }
        }
    } catch (error) {
        res.status(500).send({ error: "internal server error" });
    }
});

router.post("/forgotpassword", async function (req, res) {
    try {
        const email = req.body.email;
        let randomString = randomstring.generate();
        const isuserexist = await getusername(email);

        if (!isuserexist) {
            res.status(401).send({ error: "invalid credentials" });
        } else {
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: "shoukathali123@gmail.com",
                    pass: "shoukath@123",
                },
            });
            //Mail options
            let mailOptions = {
                from: "shoukathsandy@gmail.com",
                to: email,
                subject: "Reset Password - BrandFP",
                html: `<h4>Hello,</h4><p>We've received a request to reset the password for the AdminFP 
          account. You can reset the password by clicking the link below.
        <a href=${process.env.FRONTEND_URL}/${randomString}>click to reset your password</a></p>`,
            };
            //Send mail
            transporter.sendMail(mailOptions, async (err, data) => {
                if (err) {
                    res.status(401).send({ error: "email not send" });
                } else {
                    const ispasstoken = await passtokenset(email, randomString);

                    res
                        .status(200)
                        .send({
                            msg: "email sended successfully",
                            pass_token: randomString,
                        });
                }
            });
        }
    } catch (error) {
        res.status(500).send({ error: "interval error" });
    }
});
// resetpassword method
router.post("/resetpassword", async function (req, res) {
    try {
        const pass_token = req.body.pass_token;
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;
        const isuserpasstokenexist = await getUserpasstoken(pass_token);

        if (!isuserpasstokenexist) {
            res.status(401).send({ error: "invalid credentials" });
        } else {
            if (password === confirmpassword) {
                const hashpass = await hashingpassword(password);

                const ispasstoken = await updateuserpassDetails(pass_token, hashpass);

                res.status(200).send({ msg: "password set successfully" });
            } else {
                res.status(200).send({ error: "confirmed password not match" });
            }
        }
    } catch (error) {
        res.status(500).send({ error: "interval error" });
    }
});


export const Quotation_Maker_Route = router;
