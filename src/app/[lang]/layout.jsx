import PropTypes from "prop-types";
import PageWrapper from "./components/PageWrapper";
import { getDictionaries } from "./dictionaries";

export default async function LocaleLayout({ children, params }) {
  const { lang } = await params;
  const dictionaries = await getDictionaries(lang, ["navbar", "backoffice"]);

  return (
    <PageWrapper  backofficeDictionary={dictionaries.backoffice} navbarDictionary={dictionaries.navbar}>
      {children}
    </PageWrapper>
  );
}

LocaleLayout.propTypes = {
  children: PropTypes.node.isRequired,
  params: PropTypes.object.isRequired,
};
