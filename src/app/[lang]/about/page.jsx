"use client";
import { useAppRouter } from "../hooks/useAppRouter";
import { INDEX_URL } from "@/utils/urls";

export default function About() {
    const appRouter = useAppRouter();
    return (
        <>
            <h1>About Us</h1>
            <button
                onClick={() => appRouter.push(INDEX_URL)}> Home
            </button>
        </>

    );
}
