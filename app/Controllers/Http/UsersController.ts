import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
    public async tasksByUser({ auth }: HttpContextContract) {
        const user = await auth.authenticate();
        await user.load('tasks');
        const tasks = user.tasks;
        return tasks;
    }
}
