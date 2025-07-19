// Avatar options for users - Professional avatar images
export const avatarOptions = [
  { id: "avatar-1", name: "Professional 1", color: "#8B5CF6", imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-2", name: "Professional 2", color: "#06B6D4", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-3", name: "Professional 3", color: "#10B981", imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-4", name: "Professional 4", color: "#F59E0B", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-5", name: "Professional 5", color: "#EF4444", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-6", name: "Professional 6", color: "#84CC16", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-7", name: "Professional 7", color: "#F97316", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-8", name: "Professional 8", color: "#EC4899", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-9", name: "Professional 9", color: "#6366F1", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-10", name: "Professional 10", color: "#8B5CF6", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-11", name: "Professional 11", color: "#059669", imageUrl: "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-12", name: "Professional 12", color: "#DC2626", imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-13", name: "Professional 13", color: "#7C3AED", imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-14", name: "Professional 14", color: "#0891B2", imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-15", name: "Professional 15", color: "#BE185D", imageUrl: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150&h=150&fit=crop&crop=face&auto=format" },
  { id: "avatar-16", name: "Professional 16", color: "#0D9488", imageUrl: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face&auto=format" },
];

export function getAvatarByName(name: string) {
  return avatarOptions.find(avatar => avatar.name === name) || avatarOptions[0];
}

export function getRandomAvatar() {
  return avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
}

export function getAvatarById(id: string) {
  return avatarOptions.find(avatar => avatar.id === id) || avatarOptions[0];
}