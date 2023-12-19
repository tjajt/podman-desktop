/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { ApiSenderType } from './api.js';
import type { NotificationInfo } from './api/notification.js';
import type { NotificationTask, StatefulTask, Task } from './api/task.js';

/**
 * Contribution manager to provide the list of external OCI contributions
 */
export class TaskManager {
  private taskId = 0;

  private tasks = new Map<string, Task>();

  constructor(private apiSender: ApiSenderType) {}

  public createTask(title: string | undefined): StatefulTask {
    this.taskId++;
    const task: StatefulTask = {
      id: `main-${this.taskId}`,
      name: title ? title : `Task ${this.taskId}`,
      started: new Date().getTime(),
      state: 'running',
      status: 'in-progress',
    };
    this.tasks.set(task.id, task);
    this.apiSender.send('task-created', task);
    return task;
  }

  public createNotificationTask(notificationInfo: NotificationInfo): NotificationTask {
    this.taskId++;
    const task: NotificationTask = {
      id: `main-${this.taskId}`,
      name: notificationInfo.title,
      started: new Date().getTime(),
      description: notificationInfo.body || '',
      markdownActions: notificationInfo.markdownActions,
    };
    this.tasks.set(task.id, task);
    this.apiSender.send('task-created', task);
    return task;
  }

  public updateTask(task: Task) {
    this.apiSender.send('task-updated', task);
    if (this.isStatefulTask(task) && task.state === 'completed') {
      this.tasks.delete(task.id);
    }
  }

  isStatefulTask(task: Task): task is StatefulTask {
    return 'state' in task;
  }

  isNotificationTask(task: Task): task is NotificationTask {
    return 'description' in task;
  }
}
