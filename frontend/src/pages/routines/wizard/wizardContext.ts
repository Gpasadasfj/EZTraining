import { createContext } from "react";

/* Hueco donde se pintan los botones de abajo, fuera de la animación */
export const WizardActionsSlot = createContext<HTMLElement | null>(null);
