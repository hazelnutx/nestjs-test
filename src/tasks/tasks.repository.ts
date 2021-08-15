import { GetUser } from 'src/auth/get-user-decorator';
import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskStatus } from './task-status.model';
import { Task } from './task.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  async getTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('task');

    // Get only the tasks owned by the user
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status }); // query and search for the task with the status
    }

    // Wrapped the query condition in paranthases, as there was a bug, even though each task was showing only for the user that made it
    // by searching a word that is common in two users task, we would get retrieve both users tasks.
    // So by adding the paranthases, the condition is read as ONE, and not separate conditions.
    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}` },
      );
    }

    // ORDER MATTERS, IF I PUT THIS ABOVE THE CONDITIONS IT WILL ALWAYS RETURN ME ALL THE TASKS
    const tasks = await query.getMany();

    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.save(task);
    return task;
  }
}
