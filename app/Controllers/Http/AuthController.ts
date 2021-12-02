import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';

export default class AuthController {
    public async login({ request, auth, response }: HttpContextContract) {
        const { email, password } = request.all();
        if ((email == null || password == null) || (email.trim().length < 1 || password.trim().length < 1)) {
            return response.status(400).send({
                errors: [
                    {
                        message: 'Invalid email or password'
                    }
                ]
            });
        } else {
            const token = await auth.use('api').attempt(email, password, {
                expiresIn: '10 days',
            });
            return token.toJSON();
        }
    }

    public async register({ request, auth, response }: HttpContextContract) {
        const { email, password }: Record<string, string> = request.all();
        if ((email == null || password == null) || (email.trim().length < 1 || password.trim().length < 1)) {
            response.status(400).send({
                errors: [
                    {
                        message: 'Invalid email or password'
                    }
                ]
            });
        } else {
            const newUser = new User();
            newUser.email = email;
            newUser.password = password;
            await newUser.save();

            const token = await auth.use('api').login(newUser, {
                expiresIn: '10 days',
            });
            return token.toJSON();
        }
    }
}
