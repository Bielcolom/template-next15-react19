"use client";

import { useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Añade una clase al <body> durante el mount de una página y la quita al desmontar.
 * Úsalo en páginas auth para activar los estilos de `body.auth-page` (fullscreen,
 * sin navbar ni sidebar).
 *
 * @example
 *   <AuthBodyClass className="auth-page" />
 */
export default function AuthBodyClass({ className = "auth-page" }) {
  useEffect(() => {
    document.body.classList.add(className);
    return () => { document.body.classList.remove(className); };
  }, [className]);

  return null;
}

AuthBodyClass.propTypes = { 
  className: PropTypes.string
};
