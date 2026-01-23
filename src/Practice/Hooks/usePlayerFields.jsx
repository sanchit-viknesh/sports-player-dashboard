import { useMemo } from "react";

export function usePlayerFields(singlePlayerDetail, options = {}) {

    const {
        exclude = [],
        formatKey = (key) => key
    } = options;
    return useMemo(() => {
        if (!singlePlayerDetail) return [];
        return Object.entries(singlePlayerDetail).filter(([key]) => !exclude.includes(key)).map(([key, value]) => ({
            key: formatKey(key),
            value
        }
        ))
    }, [singlePlayerDetail, exclude, formatKey])
}