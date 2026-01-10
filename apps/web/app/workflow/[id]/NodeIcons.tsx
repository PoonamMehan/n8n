// TriggerIcons.tsx
import React from 'react';
import { LuWebhook } from "react-icons/lu"; // 'lu' = Lucide (Clean UI icons)
import { FaTelegram } from "react-icons/fa6"; // 'fa6' = FontAwesome 6 (Brands)
import { MdNearbyError } from "react-icons/md"; // 'md' = Material Design

// The Map
export const TriggerIconMap: Record<string, React.ReactNode> = {
  webhook: <LuWebhook className="h-6 w-6 text-orange-500" />,
  telegram: <FaTelegram className="h-6 w-6 text-blue-500" />,
  default: <MdNearbyError className="h-6 w-6 text-gray-400" />
};