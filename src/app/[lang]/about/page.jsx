"use client";
import { useRouter } from "next/navigation";

export default function About() {
    const router = useRouter();
    return (
        <>
            <h1>About Us</h1>
            <button
                onClick={() => router.push("/")}> Home
            </button>
        </>

    );
}