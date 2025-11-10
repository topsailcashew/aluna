
"use client";

import { EmotionWheel } from "@/components/emotion-wheel";
import { useEffect, useState } from "react";

interface EmotionWheelWrapperProps {
    selectedEmotion: string;
    onSelectEmotion: (emotion: string) => void;
}

export function EmotionWheelWrapper(props: EmotionWheelWrapperProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Render a placeholder on the server and initial client render
    if (!isClient) {
        return <div style={{ height: '500px', width: '100%' }} aria-hidden="true" />;
    }

    return <EmotionWheel {...props} />;
}

    