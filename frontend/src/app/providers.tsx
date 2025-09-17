'use client';

import {ThemeProvider} from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";

export function Providers({children}: {children: React.ReactNode}) {
    return <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Toaster toastOptions={{className:'dark:bg-slate-900'}}/>
        <NextTopLoader />
        {children}</ThemeProvider>;
}