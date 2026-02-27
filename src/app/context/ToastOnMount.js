"use client";

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useToast } from "./toastProvider";

const ToastOnMount = ({ messages, type = "error" }) => {
  const { showError, showSuccess } = useToast();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current || !Array.isArray(messages) || messages.length === 0) {
      return;
    }

    hasTriggeredRef.current = true;
    const show = type === "success" ? showSuccess : showError;
    messages.forEach((message) => show(message));
  }, [messages, showError, showSuccess, type]);

  return null;
};

ToastOnMount.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.oneOf(["error", "success"]),
};

ToastOnMount.defaultProps = {
  messages: [],
  type: "error",
};

export default ToastOnMount;
