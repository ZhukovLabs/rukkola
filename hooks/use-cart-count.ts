import {useEffect, useState} from "react";
import {getCart} from "@/lib/local-storage";

export const useCartCount = ({pollInterval = 2000} = {}) => {
    const [count, setCount] = useState(() => getCart().length);

    useEffect(() => {
        const update = () => setCount(getCart().length);

        const onStorage = (e: StorageEvent) => {
            if (!e) return;
            update();
        };

        window.addEventListener("storage", onStorage);

        const id = setInterval(update, pollInterval);

        return () => {
            window.removeEventListener("storage", onStorage);
            clearInterval(id);
        };
    }, [pollInterval]);

    return count;
}