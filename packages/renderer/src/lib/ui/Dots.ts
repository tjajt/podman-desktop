import type { PodInfoContainerUI } from '../pod/PodInfoUI';

const allStatuses = ['running', 'created', 'paused', 'waiting', 'degraded', 'exited', 'stopped', 'terminated', 'dead'];

// All the possible statuses that will appear for both Pods and Kubernetes
// NOTE: See: https://tailwindcss.com/docs/content-configuration#dynamic-class-names
// we cannot do "partial" names like referencing 'bg-'+status because it will
// not be shown due to how svelte handles dynamic class names
export function getStatusColor(status: string): string {
  // Define the mapping directly with Record
  // must be either "bg-" or "outline-" for either solid / outline colors
  const colors: Record<string, string> = {
    // Podman & Kubernetes
    running: 'bg-status-running',

    // Kubernetes-only
    terminated: 'bg-status-terminated',
    waiting: 'bg-status-waiting',

    // Podman-only
    stopped: 'outline-status-stopped',
    paused: 'bg-status-paused',
    exited: 'outline-status-exited',
    dead: 'bg-status-dead',
    created: 'outline-status-created',
    degraded: 'bg-status-degraded',
  };

  // Return the corresponding color class or a default if not found
  return colors[status] || 'bg-status-unknown';
}

// Organize the containers by returning their status as the key + an array of containers by order of
// highest importance (running) to lowest (dead)
export function organizeContainers(containers: PodInfoContainerUI[]): Record<string, PodInfoContainerUI[]> {
  const organizedContainers: Record<string, PodInfoContainerUI[]> = {
    running: [],
    created: [],
    paused: [],
    waiting: [],
    degraded: [],
    exited: [],
    stopped: [],
    terminated: [],
    dead: [],
  };

  containers.forEach(container => {
    const statusKey = container.Status.toLowerCase();
    if (!organizedContainers[statusKey]) {
      organizedContainers[statusKey] = [container];
    } else {
      organizedContainers[statusKey].push(container);
    }
  });

  allStatuses.forEach(status => {
    organizedContainers[status] = organizedContainers[status] || [];
  });

  return organizedContainers;
}
