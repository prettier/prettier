const closePortal = useCallback((e) => {
    if (isServer) return;
    const event = createCustomEvent(e);
    if (isOpenRef.current && typeof onClose === "function") onClose(event);
    if (isOpenRef.current) open(false);
  }, [createCustomEvent, isServer, onClose, open]
);
