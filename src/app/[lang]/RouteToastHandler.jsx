"use client";

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../context/toastProvider";

const TOAST_QUERY_PARAM = "toast";

const RouteToastHandler = ({ toastMessages }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showSuccess } = useToast();
  const lastHandledToastRef = useRef(null);

  useEffect(() => {
    const toastCode = searchParams.get(TOAST_QUERY_PARAM);
    const toastMessage = toastCode ? toastMessages[toastCode] : null;

    if (!toastCode || !toastMessage || lastHandledToastRef.current === toastCode) {
      return;
    }

    lastHandledToastRef.current = toastCode;
    showSuccess(toastMessage);

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete(TOAST_QUERY_PARAM);
    const nextUrl = nextSearchParams.toString() ? `${pathname}?${nextSearchParams.toString()}` : pathname;

    router.replace(nextUrl);
  }, [pathname, router, searchParams, showSuccess, toastMessages]);

  return null;
};

RouteToastHandler.propTypes = {
  toastMessages: PropTypes.objectOf(PropTypes.string),
};

RouteToastHandler.defaultProps = {
  toastMessages: {},
};

export default RouteToastHandler;
