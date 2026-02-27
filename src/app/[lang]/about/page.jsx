"use client";
import { useAppRouter } from "../hooks/useAppRouter";

export default function About() {
    const appRouter = useAppRouter();
    return (
        <>
            <h1>About Us</h1>
            <button
                onClick={() => appRouter.push("/")}> Home
            </button>
        </>

    );
}
