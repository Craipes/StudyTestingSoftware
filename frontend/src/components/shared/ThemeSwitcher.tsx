import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun,Moon, Loader } from 'lucide-react';


export default function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false);
    const {setTheme, resolvedTheme} = useTheme();

    useEffect(() => setMounted(true), []);

    if(!mounted) return (
        <Loader className="animate-spin" />
    )

    if(resolvedTheme === 'dark') {
        return (
            <>
                <Sun className="cursor-pointer" onClick={()=>setTheme('light')} />
            </>
        );
    }

    if(resolvedTheme === 'light') {
        return (
            <>
                <Moon className="cursor-pointer" onClick={()=>setTheme('dark')} />
            </>
        );
    }

}