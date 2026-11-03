import { User as UserIcon } from "lucide-react";
import type { User } from "../../types/users";

type AvatarUser = Pick<
  User,
  "avatar" | "first_name" | "last_name" | "username"
>;

interface AvatarProps {
  user?: AvatarUser;
  className?: string; // tamaño y letra
}

const initialsOf = (user: AvatarUser) => {
  const first = user.first_name.trim()[0] ?? user.username[0] ?? "";
  const last = user.last_name.trim()[0] ?? "";
  return (first + last).toUpperCase();
};

export default function Avatar({ user, className = "" }: AvatarProps) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft font-semibold text-accent ${className}`}
    >
      {user?.avatar ? (
        <img src={user.avatar} alt="" className="size-full object-cover" />
      ) : user ? (
        initialsOf(user)
      ) : (
        <UserIcon className="size-1/2" aria-hidden="true" />
      )}
    </span>
  );
}
