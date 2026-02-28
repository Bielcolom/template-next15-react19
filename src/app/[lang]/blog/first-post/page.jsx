import { getDictionary } from "../../dictionaries";

export default async function FirstPost({ params }) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang, "blog");

    return <><h1>{dictionary?.firstPostTitle}</h1></>;
}
