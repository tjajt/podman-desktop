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

import moment from 'moment';
import humanizeDuration from 'humanize-duration';
import type { Condition, ServiceUI } from './ServiceUI';
import type { V1Service } from '@kubernetes/client-node';

export class ServiceUtils {
  humanizeAge(started: string): string {
    // get start time in ms
    const uptimeInMs = moment().diff(started);
    // make it human friendly
    return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
  }

  refreshAge(service: ServiceUI): string {
    if (!service.created) {
      return '';
    }
    // make it human friendly
    return this.humanizeAge(service.created.toString());
  }

  getServiceUI(service: V1Service): ServiceUI {
    const conditions = [];
    if (service.status?.conditions) {
      for (const con of service.status.conditions) {
        const c: Condition = {
          type: con.type,
          message: con.message,
        };
        conditions.push(c);
      }
    }

    return {
      name: service.metadata?.name ?? '',
      status: 'RUNNING',
      namespace: service.metadata?.namespace ?? '',
      created: service.metadata?.creationTimestamp,
      age: service.metadata?.creationTimestamp ? this.humanizeAge(service.metadata.creationTimestamp.toString()) : '',
      conditions: conditions,
      selected: false,
    };
  }
}
