// TriggerIcons.tsx
import React from 'react';
import { LuWebhook } from "react-icons/lu"; // 'lu' = Lucide (Clean UI icons)
import { FaTelegram } from "react-icons/fa6"; // 'fa6' = FontAwesome 6 (Brands)
import { MdNearbyError, MdWebhook, MdEmail } from "react-icons/md"; // 'md' = Material Design
import { SiGmail, SiGoogle } from "react-icons/si";



// The Map
export const TriggerIconMap: Record<string, React.ReactNode> = {
  webhook: <MdWebhook className="h-6 w-6 text-orange-500" />,
  telegram: <FaTelegram className="h-6 w-6 text-blue-500" />,
  gmail: <SiGmail className="h-6 w-6 text-[#EA4335]" />,
  google: <SiGoogle className="h-6 w-6" />,
  default: <MdNearbyError className="h-6 w-6 text-gray-400" />
};