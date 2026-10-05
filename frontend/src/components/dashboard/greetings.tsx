import { capitalize, greetingByHour } from "../../utils/format";

interface GreetingsProps {
  username?: string;
  done: number;
  target: number | null;
  hasRoutine: boolean;
}

export default function Greeting({
  username,
  done,
  target,
  hasRoutine,
}: GreetingsProps) {
  let message;
  if (!hasRoutine) {
    message = (
      <>
        Empieza creando una rutina y aquí verás tu semana de un vistazo.&nbsp;👋
      </>
    );
  } else if (target !== null && done >= target) {
    message = (
      <>
        Semana completada:
        <strong className="text-fg">
          {done} de {target} entrenos
        </strong>
        . Lo que hagas ahora es extra.&nbsp;🎉
      </>
    );
  } else if (target !== null) {
    <>
      Llevas{" "}
      <strong className="text-fg">
        {done} de {target} entrenos
      </strong>{" "}
      esta semana. ¡A por el siguiente!&nbsp;🔥
    </>;
  } else {
    message = (
      <>
        Llevas <strong className="text-fg">{done} entrenos</strong> esta
        semana.&nbsp;🔥
      </>
    );
  }
  return (
    <header className="grid gap-1.5">
      <h1 className="font-display text-4xl font-extrabold italic lg:text-5xl">
        {greetingByHour()}
        {username && `, ${capitalize(username)}`} 💪
      </h1>
      <p className="max-w-[60ch] text-fg-muted">{message}</p>
    </header>
  );
}
