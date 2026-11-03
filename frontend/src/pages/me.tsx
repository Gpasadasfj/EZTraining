import { useState } from "react";
import { LogOut } from "lucide-react";
import AvatarSheet from "../components/me/avatarSheet";
import EditProfileSheet from "../components/me/editProfileSheet";
import ProfileHeader from "../components/me/profileHeader";
import WeightProgressCard from "../components/me/weightProgressCard";
import WeightSheet from "../components/me/weightSheet";
import WorkoutHistoryCard from "../components/me/workoutHistoryCard";
import useLogout from "../hooks/me/useLogout";
import useMe from "../hooks/me/useMe";

type OpenSheet = "weight" | "edit" | "photo" | null;

export default function Me() {
  const { data: me, isLoading, isError } = useMe();
  const logout = useLogout();
  // Solo puede haber una hoja abierta a la vez
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const closeSheet = () => setSheet(null);

  if (isLoading) return <p className="text-fg-muted">Cargando tu perfil…</p>;
  if (isError || !me)
    return <p className="text-fg-muted">No se pudo cargar tu perfil.</p>;

  const currentWeight = me.current_weight ? Number(me.current_weight) : null;
  const targetWeight = me.target_weight ? Number(me.target_weight) : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-4 lg:gap-5">
      <ProfileHeader
        me={me}
        onEditPhoto={() => setSheet("photo")}
        onEdit={() => setSheet("edit")}
      />

      <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-5">
        <WeightProgressCard
          targetWeight={targetWeight}
          onRegister={() => setSheet("weight")}
          onSetGoal={() => setSheet("edit")}
        />
        <WorkoutHistoryCard />
      </div>

      <button
        type="button"
        onClick={logout}
        className="inline-flex h-11 items-center gap-2 justify-self-center rounded-button px-4.5 font-semibold text-danger transition-colors hover:bg-danger/10"
      >
        <LogOut className="size-4.5" aria-hidden="true" />
        Cerrar sesión
      </button>

      {sheet === "weight" && (
        <WeightSheet lastWeight={currentWeight} onClose={closeSheet} />
      )}
      {sheet === "edit" && <EditProfileSheet me={me} onClose={closeSheet} />}
      {sheet === "photo" && <AvatarSheet me={me} onClose={closeSheet} />}
    </div>
  );
}
