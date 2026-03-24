// src/components/shared/StatusBadge.jsx
// Reusable appointment status badge

import { Clock, CheckCircle, XCircle } from "lucide-react";

const config = {
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    cls: "badge-scheduled",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    cls: "badge-completed",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    cls: "badge-cancelled",
  },
};

export default function StatusBadge({ status }) {
  const { label, icon: Icon, cls } = config[status] || config.scheduled;
  return (
    <span className={cls}>
      <Icon size={12} />
      {label}
    </span>
  );
}
