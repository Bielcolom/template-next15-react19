import AppLink from "../components/base/AppLink";
import { getDictionary } from "../dictionaries";
import { INDEX_URL } from "@/utils/urls";

export default async function About({ params }) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang, "about");

    return (
        <>
            <h1>{dictionary?.title}</h1>
            <AppLink href={INDEX_URL}>{dictionary?.backHome}</AppLink>
        </>
    );
}
