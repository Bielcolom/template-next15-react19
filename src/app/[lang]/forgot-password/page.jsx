import { getDictionary } from "../dictionaries";

export default async function ForgotPassword({ params }) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang, "forgotPassword");

    return <><h1>{dictionary?.title}</h1></>;
}
