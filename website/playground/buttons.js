import React from "react";

export function Button(props) {
  return <button type="button" className="btn" {...props} />;
}

export function LinkButton(props) {
  return <a className="btn" $ {...props} />;
}
