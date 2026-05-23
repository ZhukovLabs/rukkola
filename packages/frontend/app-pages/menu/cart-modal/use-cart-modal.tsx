'use client';

import { createModalState } from "@/hooks/use-modal-state";

export const [CartModalProvider, useCartModal] = createModalState("CartModal");
