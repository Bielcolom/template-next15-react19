"use client";

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { TOAST_TYPES, useToast } from "./toastProvider";

const ToastOnMount = ({ messages, type = TOAST_TYPES.error }) => {
  const { showError, showSuccess } = useToast();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current || !Array.isArray(messages) || messages.length === 0) {
      return;
    }

    hasTriggeredRef.current = true;
    const show = type === TOAST_TYPES.success ? showSuccess : showError;
    messages.forEach((message) => show(message));
  }, [messages, showError, showSuccess, type]);

  return null;
};

ToastOnMount.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.oneOf(Object.values(TOAST_TYPES)),
};

ToastOnMount.defaultProps = {
  messages: [],
  type: TOAST_TYPES.error,
};

export default ToastOnMount;
