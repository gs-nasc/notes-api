import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'

export default class TasksController {

    public async index({ auth }: HttpContextContract) {
        const user = await auth.authenticate();
        const tasks = await Task.query().where('user_id', user.id).where('deleted', false).preload('user');
        return tasks;
    }

    public async show({ params, auth, response }: HttpContextContract) {
        const user = await auth.authenticate();
        const task = await Task.findOrFail(params.id);
        if (task.userId === user.id) {
            return task;
        } else {
            response.status(401).send({
                errors: [
                    {
                        error: 'You are not authorized to view this task'
                    }
                ]
            });
        }
    }

    public async update({ auth, params, request, response }: HttpContextContract) {
        const user = await auth.authenticate();
        const task = await Task.findOrFail(params.id);
        const data = request.only(['description', 'completed']);
        if (task.userId === user.id) {
            task.merge(data);
            if (await task.save()) {
                await task.preload('user');
                return task;
            }
        } else {
            response.status(401).send({
                errors: [
                    {
                        message: 'You are not authorized to update this task'
                    }
                ]
            });
            return;
        }
    }

    public async store({ auth, request }: HttpContextContract) {
        const user = await auth.authenticate();
        const task = new Task();
        const data = request.only(['description']);
        task.description = data.description;

        await user.related('tasks').save(task);
        return task;
    }

    public async destroy({ auth, params, response }: HttpContextContract) {
        const user = await auth.authenticate();
        const task = await Task.findOrFail(params.id);
        if (task.userId === user.id) {
            if(task.deleted) {
                response.status(400).send({
                    errors: [
                        {
                            message: 'Task already deleted'
                        }
                    ]
                });
            }else {
                task.deleted = true;
                await task.save();
                response.status(200).send({ message: 'Task deleted' });
            }
        } else {
            response.status(401).send({
                errors: [
                    {
                        message: 'You are not authorized to delete this task'
                    }
                ]
            });
            return;
        }
    }

}
